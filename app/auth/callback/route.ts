import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Landing point for the confirmation link Supabase emails after sign-up, and for the redirect back
 * from Google after "Continue with Google".
 * Supports these flavours of request:
 *   - PKCE:       /auth/callback?code=...   (email confirmation links and Google OAuth)
 *   - Token hash: /auth/callback?token_hash=...&type=signup
 *   - Provider error: /auth/callback?error=access_denied&error_description=...  (e.g. user cancelled on Google)
 * Exchanges the one-time credential for a session cookie, then sends the user to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const providerError = searchParams.get('error')

  // Only allow same-site relative redirects (prevents an open redirect)
  const requestedNext = searchParams.get('next') ?? '/jar'
  const next =
    requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/jar'

  // Google (or Supabase) reported a problem, e.g. the user pressed "Cancel" on the consent screen
  if (providerError && !code) {
    console.error(
      '[auth/callback] OAuth provider error:',
      providerError,
      searchParams.get('error_description') ?? ''
    )
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

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