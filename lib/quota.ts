// Shared by server code and client code (no 'use client' / 'use server' here on purpose).
// The database (supabase/quotas.sql) is the source of truth for every daily quota.

export type QuotaKind = 'release' | 'mimi';

/** Fallbacks used for display until the real numbers arrive from the database. Keep in step with quota_limit() in quotas.sql. */
export const DEFAULT_DAILY_LIMITS: Record<QuotaKind, number> = {
  release: 3,
  mimi: 10,
};

export const DAILY_RELEASE_LIMIT_MESSAGE = `You have reached your daily limit of ${DEFAULT_DAILY_LIMITS.release} paper planes for today. Please try again tomorrow!`;
export const MIMI_RESTING_MESSAGE = 'Mimi is resting for today. Her battery will be full again tomorrow, so come back then to write more together.';

/** One account's usage today. `userId` lets the browser discard an answer that belongs to a different account. */
export interface DailyQuota {
  userId: string;
  used: number;
  limit: number;
}

/* -------------------------------------------------------------------------------------------------------------
 * Reading the unified RPCs: get_user_quota() and consume_mimi_message().
 *
 * Every assumption about the shape of what those functions return lives in THIS block, so a change on the
 * database side only ever needs to be mirrored here. The readers accept the usual shapes (one row, an array of
 * rows, one row per kind, nested { release, mimi } objects, or flat <kind>_used / <kind>_limit /
 * <kind>_remaining columns; the current get_user_quota() returns ONE row
 * { mimi_energy, planes_released_today, plane_limit }) and return null for anything they cannot understand instead of guessing.
 * ----------------------------------------------------------------------------------------------------------- */

/** One counter: how much of the day's allowance has been used, out of how many. */
export interface QuotaSnapshot {
  used: number;
  limit: number;
}

export type UserQuota = Record<QuotaKind, QuotaSnapshot | null>;

/** Name of the transient stream part /api/chat sends so the battery can update the moment a reply arrives. */
export const MIMI_ENERGY_PART = 'data-mimiEnergy';

export interface MimiEnergyPayload extends QuotaSnapshot {
  /** Energy left today (limit - used). */
  remaining: number;
}

type Row = Record<string, unknown>;
interface KeyMap {
  used: string[];
  limit: string[];
  remaining: string[];
}

const isRow = (value: unknown): value is Row => typeof value === 'object' && value !== null && !Array.isArray(value);

const toCount = (value: unknown): number | null => {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : null;
};

const pick = (row: Row, keys: string[]): number | null => {
  for (const key of keys) {
    const n = toCount(row[key]);
    if (n !== null) return n;
  }
  return null;
};

const GENERIC_KEYS: KeyMap = { used: ['used', 'count'], limit: ['limit', 'daily_limit'], remaining: ['remaining', 'energy', 'left'] };

const FLAT_KEYS: Record<QuotaKind, KeyMap> = {
  release: {
    used: ['planes_released_today', 'release_used', 'planes_used', 'sent_planes_used'],
    limit: ['plane_limit', 'release_limit', 'release_daily_limit', 'planes_limit', 'sent_planes_limit'],
    remaining: ['release_remaining', 'planes_remaining', 'sent_planes_remaining'],
  },
  mimi: {
    used: ['mimi_used', 'energy_used'],
    limit: ['mimi_limit', 'mimi_daily_limit', 'energy_limit', 'max_energy'],
    // get_user_quota() returns mimi_energy = energy LEFT today (no limit column, so the default limit applies)
    remaining: ['mimi_energy', 'mimi_remaining', 'energy_remaining', 'energy'],
  },
};

const NESTED_KEYS: Record<QuotaKind, string[]> = {
  release: ['release', 'planes', 'sent_planes'],
  mimi: ['mimi', 'energy'],
};

const MIMI_ROW_KEYS: KeyMap = {
  used: [...GENERIC_KEYS.used, ...FLAT_KEYS.mimi.used],
  limit: [...GENERIC_KEYS.limit, ...FLAT_KEYS.mimi.limit],
  remaining: [...GENERIC_KEYS.remaining, ...FLAT_KEYS.mimi.remaining],
};

const clampSnapshot = (used: number, limit: number): QuotaSnapshot => ({ used: Math.min(Math.max(used, 0), limit), limit });

function readSnapshot(row: Row, keys: KeyMap, kind: QuotaKind): QuotaSnapshot | null {
  const limit = pick(row, keys.limit) ?? DEFAULT_DAILY_LIMITS[kind];
  let used = pick(row, keys.used);
  if (used === null) {
    const remaining = pick(row, keys.remaining);
    if (remaining !== null) used = limit - remaining;
  }
  return used === null ? null : clampSnapshot(used, limit);
}

/** Understands what get_user_quota() returns. Null when nothing in it can be read. */
export function parseUserQuota(data: unknown): UserQuota | null {
  const result: UserQuota = { release: null, mimi: null };
  const kinds: QuotaKind[] = ['release', 'mimi'];

  for (const row of Array.isArray(data) ? data : [data]) {
    if (!isRow(row)) continue;

    // One row per kind: { kind: 'mimi', used, limit }
    if (row.kind === 'release' || row.kind === 'mimi') {
      result[row.kind] = readSnapshot(row, GENERIC_KEYS, row.kind) ?? result[row.kind];
      continue;
    }

    // One row for everything: nested { release: {...}, mimi: {...} } or flat mimi_used / release_used columns
    for (const kind of kinds) {
      const nested = NESTED_KEYS[kind].map((name) => row[name]).find(isRow);
      result[kind] =
        (nested ? readSnapshot(nested, GENERIC_KEYS, kind) : null) ?? readSnapshot(row, FLAT_KEYS[kind], kind) ?? result[kind];
    }
  }

  return result.release || result.mimi ? result : null;
}

/**
 * Understands what consume_mimi_message() returns: whether the message was allowed and, when the function says
 * so, the new energy. Accepts a boolean (older version: no energy), a number (energy left; negative = refused),
 * or a row / array of rows with an optional allowed|success|ok flag.
 */
export function parseMimiConsume(data: unknown): { allowed: boolean; quota: QuotaSnapshot | null } {
  const denied = { allowed: false, quota: null };
  if (data === null || data === undefined) return denied;
  if (typeof data === 'boolean') return { allowed: data, quota: null };

  if (typeof data === 'number') {
    if (!Number.isFinite(data) || data < 0) return denied;
    const limit = DEFAULT_DAILY_LIMITS.mimi;
    return { allowed: true, quota: clampSnapshot(limit - Math.trunc(data), limit) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!isRow(row)) return denied;

  const flag = ['allowed', 'success', 'ok', 'consumed'].map((key) => row[key]).find((v) => typeof v === 'boolean');
  const quota = parseUserQuota(row)?.mimi ?? readSnapshot(row, MIMI_ROW_KEYS, 'mimi');
  return { allowed: typeof flag === 'boolean' ? flag : true, quota };
}

/** Validates the transient stream part sent by /api/chat. */
export function parseMimiEnergyPayload(data: unknown): MimiEnergyPayload | null {
  if (!isRow(data)) return null;
  const used = toCount(data.used);
  const limit = toCount(data.limit);
  if (used === null || limit === null || limit === 0) return null;
  const snapshot = clampSnapshot(used, limit);
  return { ...snapshot, remaining: snapshot.limit - snapshot.used };
}