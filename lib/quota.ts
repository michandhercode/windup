// Shared by server code and client code (no 'use client' / 'use server' here on purpose).
// The database (supabase/quotas.sql) is the source of truth for every daily quota.

export type QuotaKind = 'release' | 'mimi';

/** Fallbacks used for display until the real numbers arrive from the database. Keep in step with quota_limit() in quotas.sql. */
export const DEFAULT_DAILY_LIMITS: Record<QuotaKind, number> = {
  release: 3,
  mimi: 10,
};

export const DAILY_RELEASE_LIMIT_MESSAGE = `You've reached your limit of ${DEFAULT_DAILY_LIMITS.release} paper planes for today. Come back tomorrow!`;
export const MIMI_RESTING_MESSAGE = 'Mimi is resting for today. Her battery will be full again tomorrow, so come back then to write more together.';

/** One account's usage today. `userId` lets the browser discard an answer that belongs to a different account. */
export interface DailyQuota {
  userId: string;
  used: number;
  limit: number;
}