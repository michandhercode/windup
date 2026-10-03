'use client';

import {
  getLocalStorageItem,
  setLocalStorageItem,
  useLocalStorageItem,
} from '@/lib/hooks/useLocalStorage';
import { useNow } from '@/lib/hooks/useNow';

/** How many paper planes can be released into the Sky per calendar day. Tweak freely. */
export const MAX_DAILY_RELEASES = 3;

/** localStorage keys */
export const LAST_RELEASE_DATE_KEY = 'windup_last_release_date'; // "YYYY-MM-DD" (local time)
export const DAILY_RELEASE_COUNT_KEY = 'windup_daily_release_count'; // number

export const DAILY_LIMIT_MESSAGE = `You've reached your limit of ${MAX_DAILY_RELEASES} paper planes for today. Come back tomorrow!`;

export interface DailyReleaseStatus {
  used: number;
  remaining: number;
  isLimitReached: boolean;
}

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
  const storedDate = useLocalStorageItem(LAST_RELEASE_DATE_KEY);
  const storedCount = useLocalStorageItem(DAILY_RELEASE_COUNT_KEY);
  return toStatus(getUsedToday(storedDate, storedCount, toDateKey(new Date(now))));
}

/** Fresh read for event handlers (e.g. before opening a confirmation). Does not write. */
export function getDailyReleaseStatus(): DailyReleaseStatus {
  const todayKey = toDateKey(new Date());
  return toStatus(
    getUsedToday(getLocalStorageItem(LAST_RELEASE_DATE_KEY), getLocalStorageItem(DAILY_RELEASE_COUNT_KEY), todayKey)
  );
}

/**
 * Call right before a plane is actually released (event handlers only).
 * - New calendar day: resets the stored date and count to today / 0.
 * - Limit already reached: returns `allowed: false` and changes nothing.
 * - Otherwise: increments the stored count and returns `allowed: true`.
 */
export function tryConsumeDailyRelease(): DailyReleaseStatus & { allowed: boolean } {
  const todayKey = toDateKey(new Date());

  if (getLocalStorageItem(LAST_RELEASE_DATE_KEY) !== todayKey) {
    setLocalStorageItem(LAST_RELEASE_DATE_KEY, todayKey);
    setLocalStorageItem(DAILY_RELEASE_COUNT_KEY, '0');
  }

  const used = parseCount(getLocalStorageItem(DAILY_RELEASE_COUNT_KEY));
  if (used >= MAX_DAILY_RELEASES) {
    return { ...toStatus(used), allowed: false };
  }

  setLocalStorageItem(DAILY_RELEASE_COUNT_KEY, String(used + 1));
  return { ...toStatus(used + 1), allowed: true };
}