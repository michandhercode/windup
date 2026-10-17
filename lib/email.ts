/**
 * Sends Windup's emails through Brevo (https://developers.brevo.com/reference/sendtransacemail).
 *
 * Uses Brevo's REST API directly with `fetch`, so it does not depend on the version of the @getbrevo/brevo SDK
 * (its API changed between major versions). SERVER-SIDE ONLY: it reads BREVO_API_KEY, so import it from server
 * actions, route handlers and server components, never from a 'use client' file.
 *
 * Environment variables:
 *   BREVO_API_KEY        required. Brevo > SMTP & API > API keys.
 *   BREVO_SENDER_EMAIL   required. Must be a sender/domain verified in Brevo (Senders, Domains & Dedicated IPs).
 *   BREVO_SENDER_NAME    optional, defaults to "Windup".
 *   NEXT_PUBLIC_SITE_URL recommended. Public address of the app, used for links inside emails.
 */

import { sealedLetterUnlockedEmail } from '@/lib/email-templates';

const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';
const REQUEST_TIMEOUT_MS = 10_000;

export interface SendEmailInput {
  to: { email: string; name?: string | null };
  subject: string;
  html: string;
  text: string;
  /** Labels shown in Brevo's logs, to tell Windup's email types apart. */
  tags?: string[];
}

export type SendEmailResult = { success: true; messageId?: string } | { success: false; error: string };

/** Public address of the app, without a trailing slash. Used to build links that go inside emails. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)?.trim();
  const raw = explicit || (vercel ? `https://${vercel}` : 'http://localhost:3000');
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, '');
}

/** Sends one email. Never throws: the caller decides what a failed email means for its own flow. */
export async function sendBrevoEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  if (!apiKey) return { success: false, error: 'BREVO_API_KEY is not set.' };
  if (!senderEmail) return { success: false, error: 'BREVO_SENDER_EMAIL is not set (it must be a sender verified in Brevo).' };

  try {
    const response = await fetch(BREVO_SEND_URL, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME?.trim() || 'Windup' },
        to: [input.to.name?.trim() ? { email: input.to.email, name: input.to.name.trim() } : { email: input.to.email }],
        subject: input.subject,
        htmlContent: input.html,
        textContent: input.text,
        ...(input.tags?.length ? { tags: input.tags } : {}),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!response.ok) {
      // Brevo explains what is wrong (unverified sender, bad key, ...). Logged for us, never shown to a reader.
      const detail = await response.text().catch(() => '');
      console.error('[email] Brevo refused the email', { status: response.status, detail: detail.slice(0, 500) });
      return { success: false, error: `Brevo answered with status ${response.status}.` };
    }

    const data = (await response.json().catch(() => null)) as { messageId?: string } | null;
    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('[email] Could not reach Brevo', error);
    return { success: false, error: 'Could not reach Brevo.' };
  }
}

/** Tells the owner that a sealed letter can now be opened (reminder + link, never the letter's contents). */
export async function sendSealedLetterUnlockedEmail(input: {
  to: string;
  name?: string | null;
  letterTitle?: string | null;
}): Promise<SendEmailResult> {
  const content = sealedLetterUnlockedEmail({
    name: input.name,
    letterTitle: input.letterTitle,
    openUrl: `${getSiteUrl()}/jar`,
  });
  return sendBrevoEmail({ to: { email: input.to, name: input.name }, ...content, tags: ['sealed-letter-unlocked'] });
}