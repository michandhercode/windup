'use server'

import { createClient } from '@/utils/supabase/server'
import { getAuthUserId } from '@/lib/auth'
import { parseUserQuota, type DailyQuota, type QuotaKind, type QuotaSnapshot } from '@/lib/quota'

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

const KINDS: QuotaKind[] = ['release', 'mimi']

/** Older per-kind function (supabase/quotas.sql). Only used for a kind get_user_quota() did not answer. */
async function readLegacyQuota(supabase: ServerSupabase, kind: QuotaKind): Promise<QuotaSnapshot | null> {
  const { data, error } = await supabase.rpc('get_daily_quota', { p_kind: kind })
  const row = (data as { used: number; daily_limit: number }[] | null)?.[0]
  if (error || !row) return null
  return { used: row.used, limit: row.daily_limit }
}

/**
 * Today's usage for the signed-in account, for BOTH counters (planes released + Mimi's energy) from one call to
 * the database function get_user_quota(). Returns null for guests. A counter that cannot be read comes back as
 * null so the screen shows "loading" rather than a made-up 0. The database reads the account from auth.uid(),
 * never from the browser.
 */
export async function getUserQuota(): Promise<Record<QuotaKind, DailyQuota | null> | null> {
  const userId = await getAuthUserId()
  if (!userId) return null

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_user_quota')
  if (error) {
    console.error('[quota] get_user_quota failed', { code: error.code, message: error.message })
  }

  const parsed = error ? null : parseUserQuota(data)
  const result: Record<QuotaKind, DailyQuota | null> = { release: null, mimi: null }

  for (const kind of KINDS) {
    const snapshot = parsed?.[kind] ?? (await readLegacyQuota(supabase, kind))
    result[kind] = snapshot ? { userId, ...snapshot } : null
  }
  return result
}

/** One counter of getUserQuota(). Kept for callers that only need a single kind. */
export async function getDailyQuota(kind: QuotaKind): Promise<DailyQuota | null> {
  if (kind !== 'release' && kind !== 'mimi') return null
  return (await getUserQuota())?.[kind] ?? null
}