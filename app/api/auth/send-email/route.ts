import { NextResponse, type NextRequest } from 'next/server';
import { authEmail } from '@/lib/email-templates';
import { sendBrevoEmail } from '@/lib/email';
import { parseHookPayload, verifyHookSignature } from '@/lib/auth-hook';

/**
 * Supabase "Send Email" Auth Hook: Supabase calls this route instead of sending its own plain email, and we send
 * Windup's designed version through Brevo. It handles EVERY auth email (sign-up confirmation, password reset,
 * magic link, invite, email change, re-authentication) because the hook replaces all of them.
 *
 * The link inside each email is the same verification link Supabase's default template uses
 * ({SUPABASE_URL}/auth/v1/verify?...), so after the click the reader lands on the existing /auth/callback
 * flow exactly as before. Nothing in the sign-up code changes.
 *
 * Setup: Supabase dashboard > Authentication > Hooks > Send Email > HTTPS, URL https://<your-site>/api/auth/send-email,
 * then copy the generated secret into SEND_EMAIL_HOOK_SECRET.
 */

export const dynamic = 'force-dynamic';

/** Supabase expects errors in this shape. */
const hookError = (status: number, message: string) =>
  NextResponse.json({ error: { http_code: status, message } }, { status });

const MAX_NAME_LENGTH = 30;

/**
 * The display name is chosen by whoever started the sign-up, which is not always the person who receives this email
 * (anyone can start a sign-up with someone else's address). So it is cleaned before it goes into an official
 * Windup email: no links, no angle brackets or control characters, and a short length.
 */
function cleanDisplayName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value
    .replace(/https?:\/\/\S+|www\.\S+/gi, '')
    .replace(/[<>\u0000-\u001f]/g, '')
    .trim()
    .slice(0, MAX_NAME_LENGTH);
  return cleaned || null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!secret || !supabaseUrl) {
    console.error('[auth-hook] SEND_EMAIL_HOOK_SECRET or NEXT_PUBLIC_SUPABASE_URL is not set');
    return hookError(500, 'Email sending is not configured.');
  }

  // The body must be read as text first: the signature is computed over the exact bytes Supabase sent.
  const rawBody = await request.text();
  if (!verifyHookSignature(rawBody, request.headers, secret)) {
    return hookError(401, 'Invalid signature.');
  }

  const payload = parseHookPayload(rawBody);
  if (!payload) return hookError(400, 'Unexpected request body.');

  const { user, email_data: emailData } = payload;
  const type = emailData.email_action_type ?? '';

  // Same link Supabase's own {{ .ConfirmationURL }} produces
  let actionUrl: string | undefined;
  if (emailData.token_hash) {
    const url = new URL('/auth/v1/verify', supabaseUrl);
    url.searchParams.set('token', emailData.token_hash);
    url.searchParams.set('type', type);
    if (emailData.redirect_to) url.searchParams.set('redirect_to', emailData.redirect_to);
    actionUrl = url.toString();
  }

  // A link-based email without a link, or a code-based one without a code, would be useless to the reader
  if (type === 'reauthentication' ? !emailData.token : !actionUrl) {
    console.error('[auth-hook] missing token data for email type', type);
    return hookError(400, 'Missing token data.');
  }

  const displayName = cleanDisplayName(user.user_metadata?.display_name);
  const content = authEmail({ type, name: displayName, actionUrl, code: emailData.token });

  const result = await sendBrevoEmail({
    to: { email: user.email, name: displayName },
    ...content,
    tags: [`auth-${type || 'unknown'}`],
  });

  if (!result.success) {
    // Supabase reports this to the person who triggered it (for example "could not send confirmation email")
    return hookError(502, 'We could not send the email. Please try again.');
  }

  return NextResponse.json({});
}