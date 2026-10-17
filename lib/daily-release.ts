'use client';

import { DAILY_RELEASE_LIMIT_MESSAGE, DEFAULT_DAILY_LIMITS, type DailyQuota } from '@/lib/quota';
import { applyDailyQuotaSnapshot, getDailyQuotaStatus, recordDailyQuotaUse, useDailyQuota } from '@/lib/quota-client';

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
  /** The real daily limit once the database has answered (the display default until then). */
  limit: number;
  remaining: number;
  isLimitReached: boolean;
  /** False until the database has answered for the signed-in account. */
  isLoaded: boolean;
}

/** For rendering ("2 of 3 planes left today"). Hydration-safe, and follows the signed-in account. */
export function useDailyReleaseStatus(): DailyReleaseStatus {
  const { used, limit, remaining, isLimitReached, isLoaded } = useDailyQuota('release');
  return { used, limit, remaining, isLimitReached, isLoaded };
}

/**
 * Fresh read for event handlers, used to skip a pointless request. While the numbers are unknown this says
 * "not reached" and lets the server decide, because the server enforces the limit either way.
 */
export function getDailyReleaseStatus(): DailyReleaseStatus {
  const { used, limit, remaining, isLimitReached, isLoaded } = getDailyQuotaStatus('release');
  return { used, limit, remaining, isLimitReached, isLoaded };
}

/**
 * Call after a plane was really released (the database has already counted it). Updates the counter right away.
 * Pass the `quota` the release action returned (the real count, read from the database) to show it exactly;
 * without it the counter goes up by one and the authoritative number is re-read from the server.
 */
export function tryConsumeDailyRelease(quota?: DailyQuota | null): DailyReleaseStatus & { allowed: boolean } {
  const applied = quota ? applyDailyQuotaSnapshot('release', quota.userId, quota) : false;
  if (!applied) recordDailyQuotaUse('release');
  return { ...getDailyReleaseStatus(), allowed: true };
}