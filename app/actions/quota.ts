'use server'

import { createClient } from '@/utils/supabase/server'
import { getAuthUserId } from '@/lib/auth'
import type { DailyQuota, QuotaKind } from '@/lib/quota'

/**
 * How much of today's quota the signed-in account has used. Returns null for guests, or if the quotas are not
 * installed yet (supabase/quotas.sql). The database reads the account from auth.uid(), never from the browser.
 */
export async function getDailyQuota(kind: QuotaKind): Promise<DailyQuota | null> {
  if (kind !== 'release' && kind !== 'mimi') return null

  const userId = await getAuthUserId()
  if (!userId) return null

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_daily_quota', { p_kind: kind })
  const row = (data as { used: number; daily_limit: number }[] | null)?.[0]

  if (error || !row) {
    if (error) console.error('[quota] get_daily_quota failed', { code: error.code, message: error.message })
    return null
  }
  return { userId, used: row.used, limit: row.daily_limit }
}