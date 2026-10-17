'use client';

import { useSyncExternalStore } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getUserQuota } from '@/app/actions/quota';
import { DEFAULT_DAILY_LIMITS, type DailyQuota, type QuotaKind, type QuotaSnapshot } from '@/lib/quota';

/**
 * Browser-side mirror of the daily quotas that live in the database (see supabase/quotas.sql).
 * Nothing here is saved to localStorage. Every number comes from the server for the signed-in account, and is
 * dropped the moment the account changes, so one account's energy can never show up (or get stuck) for another.
 */

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
  /** False until the server has answered for the current account (and always for guests). */
  isLoaded: boolean;
}

const KINDS: QuotaKind[] = ['release', 'mimi'];
const EMPTY: DailyQuota | null = null;

// One immutable value per kind (required by useSyncExternalStore). Always belongs to `currentUserId`.
const quotas: Record<QuotaKind, DailyQuota | null> = { release: EMPTY, mimi: EMPTY };
const listeners: Record<QuotaKind, Set<() => void>> = { release: new Set(), mimi: new Set() };

/** `undefined` = session not checked yet, `null` = signed out, string = the signed-in account. */
let currentUserId: string | null | undefined = undefined;
let started = false;

/**
 * Orders answers so an older one can never overwrite a newer one. Every request takes a ticket when it starts;
 * a number pushed in by the server (see applyDailyQuotaSnapshot) takes one when it arrives. An answer is only
 * applied if no newer number has landed for that kind in the meantime.
 */
let ticketCounter = 0;
const appliedTicket: Record<QuotaKind, number> = { release: 0, mimi: 0 };

const emit = (kind: QuotaKind) => listeners[kind].forEach((listener) => listener());
const hasListeners = (kind: QuotaKind) => listeners[kind].size > 0;
const anyListeners = () => KINDS.some(hasListeners);

const clamp = ({ used, limit }: QuotaSnapshot): QuotaSnapshot => ({ used: Math.min(Math.max(used, 0), limit), limit });

let inFlight: { owner: string; promise: Promise<void> } | null = null;

/**
 * Asks the server for the real numbers of both counters (one database call). An answer for another account
 * (a switch mid-request) or one that is older than a number already shown is thrown away.
 * Calls made while a read is already running share it, unless `fresh` is set (use that right after the
 * database changed, so the read cannot be one that started before the change).
 */
export function refreshUserQuota({ fresh = false }: { fresh?: boolean } = {}): Promise<void> {
  const owner = currentUserId;
  if (!owner) return Promise.resolve();
  if (!fresh && inFlight?.owner === owner) return inFlight.promise;

  const ticket = ++ticketCounter;
  // Created before the read starts, so the cleanup below can compare against it without touching an unassigned variable.
  const entry: { owner: string; promise: Promise<void> } = { owner, promise: Promise.resolve() };
  inFlight = entry;

  entry.promise = (async () => {
    try {
      const result = await getUserQuota();
      if (currentUserId !== owner || !result) return;

      for (const kind of KINDS) {
        const next = result[kind];
        if (!next || next.userId !== owner) continue;
        if (ticket < appliedTicket[kind]) continue; // a newer number is already on screen
        appliedTicket[kind] = ticket;
        quotas[kind] = next;
        emit(kind);
      }
    } catch (error) {
      console.error('Could not load the daily quotas', error);
    } finally {
      if (inFlight === entry) inFlight = null;
    }
  })();

  return entry.promise;
}

/** Re-reads one counter from the server (both are fetched together by one database call). */
export function refreshDailyQuota(kind: QuotaKind, options?: { fresh?: boolean }): Promise<void> {
  void kind;
  return refreshUserQuota(options);
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;

  createClient().auth.onAuthStateChange((_event, session) => {
    const next = session?.user?.id ?? null;
    if (next === currentUserId) return;
    currentUserId = next;
    inFlight = null;
    // New account (or signed out): forget everything that belonged to the previous one, then load fresh numbers.
    KINDS.forEach((kind) => {
      quotas[kind] = EMPTY;
      appliedTicket[kind] = 0;
      emit(kind);
    });
    if (next && anyListeners()) void refreshUserQuota({ fresh: true });
  });

  // A tab left open overnight must not keep yesterday's numbers.
  const refreshVisible = () => {
    if (document.visibilityState === 'hidden' || !anyListeners()) return;
    void refreshUserQuota();
  };
  document.addEventListener('visibilitychange', refreshVisible);
  window.addEventListener('focus', refreshVisible);
}

const subscribers = Object.fromEntries(
  KINDS.map((kind) => [
    kind,
    (onChange: () => void) => {
      start();
      listeners[kind].add(onChange);
      if (currentUserId && !quotas[kind]) void refreshUserQuota();
      return () => {
        listeners[kind].delete(onChange);
      };
    },
  ])
) as Record<QuotaKind, (onChange: () => void) => () => void>;

const toStatus = (quota: DailyQuota | null, kind: QuotaKind): QuotaStatus => {
  const limit = quota?.limit ?? DEFAULT_DAILY_LIMITS[kind];
  const used = Math.min(quota?.used ?? 0, limit);
  return { used, limit, remaining: Math.max(0, limit - used), isLimitReached: !!quota && used >= limit, isLoaded: !!quota };
};

/** Live usage for rendering. Empty on the server and for guests, so markup always matches while hydrating. */
export function useDailyQuota(kind: QuotaKind): QuotaStatus {
  const quota = useSyncExternalStore(
    subscribers[kind],
    () => quotas[kind],
    () => EMPTY
  );
  return toStatus(quota, kind);
}

/** Fresh read for event handlers (never during render). */
export function getDailyQuotaStatus(kind: QuotaKind): QuotaStatus {
  return toStatus(quotas[kind], kind);
}

/**
 * Puts a number the server just returned on screen right away (for example the energy left after
 * consume_mimi_message()). Ignored (returns false) when it belongs to a different account than the one signed in here.
 */
export function applyDailyQuotaSnapshot(kind: QuotaKind, userId: string | null | undefined, snapshot: QuotaSnapshot): boolean {
  if (!userId || currentUserId !== userId) return false;
  appliedTicket[kind] = ++ticketCounter;
  quotas[kind] = { userId, ...clamp(snapshot) };
  emit(kind);
  return true;
}

/**
 * Shows one more unit as used right away, then (unless `refresh` is false) re-reads the truth.
 * Pass `refresh: false` when the server has NOT counted the unit yet (e.g. just before sending a chat message):
 * a read made now would still return the old number and undo the update. Never counts for an unknown account.
 */
export function recordDailyQuotaUse(kind: QuotaKind, { refresh = true }: { refresh?: boolean } = {}): void {
  const quota = quotas[kind];
  if (quota && currentUserId === quota.userId) {
    quotas[kind] = { ...quota, used: Math.min(quota.used + 1, quota.limit) };
    emit(kind);
  }
  if (refresh) void refreshUserQuota({ fresh: true });
}