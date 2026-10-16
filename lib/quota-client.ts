'use client';

import { useSyncExternalStore } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getDailyQuota } from '@/app/actions/quota';
import { DEFAULT_DAILY_LIMITS, type DailyQuota, type QuotaKind } from '@/lib/quota';

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

const emit = (kind: QuotaKind) => listeners[kind].forEach((listener) => listener());
const hasListeners = (kind: QuotaKind) => listeners[kind].size > 0;

/** Asks the server for the real numbers. An answer for another account (a switch mid-request) is thrown away. */
export async function refreshDailyQuota(kind: QuotaKind): Promise<void> {
  const owner = currentUserId;
  if (!owner) return;
  try {
    const result = await getDailyQuota(kind);
    if (currentUserId !== owner) return;
    if (result && result.userId !== owner) return;
    quotas[kind] = result;
    emit(kind);
  } catch (error) {
    console.error(`Could not load the ${kind} quota`, error);
  }
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;

  createClient().auth.onAuthStateChange((_event, session) => {
    const next = session?.user?.id ?? null;
    if (next === currentUserId) return;
    currentUserId = next;
    // New account (or signed out): forget everything that belonged to the previous one, then load fresh numbers.
    KINDS.forEach((kind) => {
      quotas[kind] = EMPTY;
      emit(kind);
      if (next && hasListeners(kind)) void refreshDailyQuota(kind);
    });
  });

  // A tab left open overnight must not keep yesterday's numbers.
  const refreshVisible = () => {
    if (document.visibilityState === 'hidden') return;
    KINDS.forEach((kind) => hasListeners(kind) && void refreshDailyQuota(kind));
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
      if (currentUserId && !quotas[kind]) void refreshDailyQuota(kind);
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
 * Shows one more unit as used right away (the server already counted it), then re-reads the truth.
 * Never counts for an unknown account.
 */
export function recordDailyQuotaUse(kind: QuotaKind): void {
  const quota = quotas[kind];
  if (quota && currentUserId === quota.userId) {
    quotas[kind] = { ...quota, used: Math.min(quota.used + 1, quota.limit) };
    emit(kind);
  }
  void refreshDailyQuota(kind);
}