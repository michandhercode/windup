import { createClient } from '@supabase/supabase-js'

/**
 * Anonymous Supabase client for public data (e.g. counting released planes).
 * It never reads cookies, so a page that uses it can still be cached / statically generated.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}