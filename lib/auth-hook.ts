/**
 * Helpers for Supabase's "Send Email" Auth Hook (Authentication > Hooks in the Supabase dashboard).
 * Supabase POSTs each auth email request to our route, signed with the Standard Webhooks scheme.
 * Server-side only.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface SendEmailHookPayload {
  user: {
    id?: string;
    email: string;
    user_metadata?: { display_name?: unknown; [key: string]: unknown };
  };
  email_data: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
  };
}

const MAX_CLOCK_SKEW_SECONDS = 5 * 60;

/**
 * Checks that a request really comes from Supabase: HMAC-SHA256 over "<id>.<timestamp>.<body>" with the hook secret
 * (the "v1,whsec_..." value shown when the hook is created). Rejects old timestamps so a captured request cannot be replayed.
 */
export function verifyHookSignature(rawBody: string, headers: Headers, secret: string, nowMs = Date.now()): boolean {
  const id = headers.get('webhook-id');
  const timestamp = headers.get('webhook-timestamp');
  const signatures = headers.get('webhook-signature');
  if (!id || !timestamp || !signatures) return false;

  const ageSeconds = Math.abs(nowMs / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > MAX_CLOCK_SKEW_SECONDS) return false;

  const key = Buffer.from(secret.trim().replace(/^v1,/, '').replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest();

  // The header can carry several signatures ("v1,<base64> v1,<base64>") while a secret is being rotated
  return signatures.split(' ').some((entry) => {
    const [version, signature] = entry.split(',');
    if (version !== 'v1' || !signature) return false;
    const given = Buffer.from(signature, 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/** Parses the hook body; null when it is not the shape Supabase documents. */
export function parseHookPayload(rawBody: string): SendEmailHookPayload | null {
  try {
    const data = JSON.parse(rawBody) as Partial<SendEmailHookPayload> | null;
    if (!data || typeof data !== 'object') return null;
    if (typeof data.user?.email !== 'string' || !data.user.email) return null;
    if (!data.email_data || typeof data.email_data !== 'object') return null;
    return data as SendEmailHookPayload;
  } catch {
    return null;
  }
}