'use client';

import { useSyncExternalStore } from 'react';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
  useLocalStorageItem,
} from '@/lib/hooks/useLocalStorage';
import { useNow } from '@/lib/hooks/useNow';
import { createClient } from '@/utils/supabase/client';

/** How many paper planes can be released into the Sky per calendar day. Tweak freely. */
export const MAX_DAILY_RELEASES = 3;

/**
 * localStorage keys. They are scoped per account (`<prefix>:<user id>`), so two accounts on the same browser
 * each get their own daily allowance, and logging out and back in does not hand out a fresh one.
 */
export const LAST_RELEASE_DATE_KEY_PREFIX = 'windup_last_release_date'; // value: "YYYY-MM-DD" (local time)
export const DAILY_RELEASE_COUNT_KEY_PREFIX = 'windup_daily_release_count'; // value: number

/** Old, account-less keys. They were shared by every account on the device, so they are discarded. */
const LEGACY_RELEASE_KEYS = ['windup_last_release_date', 'windup_daily_release_count'] as const;

export const DAILY_LIMIT_MESSAGE = `You've reached your limit of ${MAX_DAILY_RELEASES} paper planes for today. Come back tomorrow!`;

export interface DailyReleaseStatus {
  used: number;
  remaining: number;
  isLimitReached: boolean;
}

/**
 * Who is signed in, kept in one place for every page that needs the daily allowance.
 * `undefined` = the session is still being checked, `null` = signed out, string = the account's id.
 * It follows sign-in, sign-out and account switches, so reads in event handlers are always current.
 */
let currentUserId: string | null | undefined = undefined;
const userIdListeners = new Set<() => void>();
let authSubscriptionStarted = false;

const startAuthSubscription = () => {
  if (authSubscriptionStarted) return;
  authSubscriptionStarted = true;
  createClient().auth.onAuthStateChange((_event, session) => {
    const next = session?.user?.id ?? null;
    if (next === currentUserId) return;
    currentUserId = next;
    userIdListeners.forEach((listener) => listener());
  });
};

if (typeof window !== 'undefined') {
  // Browser only: discard the old shared keys once, and start following the signed-in account right away.
  LEGACY_RELEASE_KEYS.forEach(removeLocalStorageItem);
  startAuthSubscription();
}

const subscribeUserId = (onChange: () => void) => {
  startAuthSubscription();
  userIdListeners.add(onChange);
  return () => {
    userIdListeners.delete(onChange);
  };
};

/** Account-scoped storage keys. While the account is unknown they point at a placeholder that is never written. */
const releaseKeysFor = (userId: string | null | undefined) => {
  const owner = userId === undefined ? 'pending' : userId === null ? 'guest' : userId;
  return {
    date: `${LAST_RELEASE_DATE_KEY_PREFIX}:${owner}`,
    count: `${DAILY_RELEASE_COUNT_KEY_PREFIX}:${owner}`,
  };
};

/** "YYYY-MM-DD" in the user's local calendar (toISOString would use UTC and roll over at the wrong hour). */
export const toDateKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const parseCount = (raw: string | null): number => {
  const value = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

/** Pure: releases used today. A stored date from another day means a fresh day, so 0. */
const getUsedToday = (storedDate: string | null, storedCount: string | null, todayKey: string): number =>
  storedDate === todayKey ? parseCount(storedCount) : 0;

const toStatus = (used: number): DailyReleaseStatus => ({
  used,
  remaining: Math.max(0, MAX_DAILY_RELEASES - used),
  isLimitReached: used >= MAX_DAILY_RELEASES,
});

/**
 * For rendering ("2 of 3 planes left today"). Hydration-safe: the server snapshot is empty storage,
 * and the date comes from `useNow` instead of calling `new Date()` / `Date.now()` in render.
 */
export function useDailyReleaseStatus(): DailyReleaseStatus {
  const now = useNow();
  const userId = useSyncExternalStore(
    subscribeUserId,
    () => currentUserId,
    () => undefined
  );
  const keys = releaseKeysFor(userId);
  const storedDate = useLocalStorageItem(keys.date);
  const storedCount = useLocalStorageItem(keys.count);
  return toStatus(getUsedToday(storedDate, storedCount, toDateKey(new Date(now))));
}

/**
 * Fresh read for event handlers (e.g. before opening a confirmation). Does not write.
 * Until we know which account is signed in, nothing can be released (the release would be counted for nobody).
 */
export function getDailyReleaseStatus(): DailyReleaseStatus {
  if (currentUserId === undefined) return toStatus(MAX_DAILY_RELEASES);

  const keys = releaseKeysFor(currentUserId);
  const todayKey = toDateKey(new Date());
  return toStatus(getUsedToday(getLocalStorageItem(keys.date), getLocalStorageItem(keys.count), todayKey));
}

/**
 * Call right before a plane is actually released (event handlers only).
 * - New calendar day: resets the stored date and count to today / 0.
 * - Limit already reached: returns `allowed: false` and changes nothing.
 * - Otherwise: increments the stored count and returns `allowed: true`.
 */
export function tryConsumeDailyRelease(): DailyReleaseStatus & { allowed: boolean } {
  // The allowance belongs to an account, so never count a release before we know whose it is.
  if (currentUserId === undefined) return { ...toStatus(MAX_DAILY_RELEASES), allowed: false };

  const keys = releaseKeysFor(currentUserId);
  const todayKey = toDateKey(new Date());

  if (getLocalStorageItem(keys.date) !== todayKey) {
    setLocalStorageItem(keys.date, todayKey);
    setLocalStorageItem(keys.count, '0');
  }

  const used = parseCount(getLocalStorageItem(keys.count));
  if (used >= MAX_DAILY_RELEASES) {
    return { ...toStatus(used), allowed: false };
  }

  setLocalStorageItem(keys.count, String(used + 1));
  return { ...toStatus(used + 1), allowed: true };
}