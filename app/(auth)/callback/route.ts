import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Landing point for the confirmation link Supabase emails after sign-up.
 * Exchanges the one-time `code` for a session cookie, then sends the user into the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')

  // Only allow same-site relative redirects (prevents an open redirect)
  const requestedNext = searchParams.get('next') ?? '/jar'
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/jar'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}