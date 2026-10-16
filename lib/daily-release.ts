'use client';

import { DAILY_RELEASE_LIMIT_MESSAGE, DEFAULT_DAILY_LIMITS } from '@/lib/quota';
import { getDailyQuotaStatus, recordDailyQuotaUse, useDailyQuota } from '@/lib/quota-client';

/**
 * Daily paper-plane allowance. The count lives in the database, per account (see supabase/quotas.sql):
 * a trigger on `thoughts` consumes one unit whenever a row becomes a released plane, so the rule holds even if
 * the browser is cleared, a different browser is used, or another account signs in on the same device.
 * This file only shows the numbers; the server is what actually says yes or no.
 */

/** Display value until the real limit arrives from the database. */
export const MAX_DAILY_RELEASES = DEFAULT_DAILY_LIMITS.release;

export const DAILY_LIMIT_MESSAGE = DAILY_RELEASE_LIMIT_MESSAGE;

export interface DailyReleaseStatus {
  used: number;
  remaining: number;
  isLimitReached: boolean;
}

/** For rendering ("2 of 3 planes left today"). Hydration-safe, and follows the signed-in account. */
export function useDailyReleaseStatus(): DailyReleaseStatus {
  const { used, remaining, isLimitReached } = useDailyQuota('release');
  return { used, remaining, isLimitReached };
}

/**
 * Fresh read for event handlers, used to skip a pointless request. While the numbers are unknown this says
 * "not reached" and lets the server decide, because the server enforces the limit either way.
 */
export function getDailyReleaseStatus(): DailyReleaseStatus {
  const { used, remaining, isLimitReached } = getDailyQuotaStatus('release');
  return { used, remaining, isLimitReached };
}

/**
 * Call after a plane was really released (the database has already counted it). Updates the counter right away
 * and re-reads the authoritative number from the server.
 */
export function tryConsumeDailyRelease(): DailyReleaseStatus & { allowed: boolean } {
  recordDailyQuotaUse('release');
  return { ...getDailyReleaseStatus(), allowed: true };
}