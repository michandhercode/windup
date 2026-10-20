import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Landing point for the confirmation link Supabase emails after sign-up.
 * Supports both flavours of link:
 *   - PKCE:       /auth/callback?code=...
 *   - Token hash: /auth/callback?token_hash=...&type=signup
 * Exchanges the one-time credential for a session cookie, then sends the user to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Only allow same-site relative redirects (prevents an open redirect)
  const requestedNext = searchParams.get('next') ?? '/jar'
  const next =
    requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/jar'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('[auth/callback] exchangeCodeForSession failed:', error.message)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('[auth/callback] verifyOtp failed:', error.message)
  }

  // LoginPage.tsx already shows a friendly message for this error value
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}