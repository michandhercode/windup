'use client';

import type { User } from '@supabase/supabase-js';
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from '@/lib/hooks/useLocalStorage';

/**
 * Navbar, Settings and the sealed-letter confirmation read the profile from localStorage.
 * These helpers keep those keys mirroring the real Supabase user, so those components keep working unchanged.
 */
const KEYS = {
  email: 'windup_user_email',
  name: 'windup_display_name',
  memberSince: 'windup_member_since',
  guest: 'windup_is_guest',
} as const;

/**
 * The display name chosen at sign-up or in Settings (stored in user metadata). Accounts created with Google
 * have no such value, so they fall back to the first name Google provides, then to a name derived from the email.
 */
export const getDisplayName = (user: User): string => {
  const fromMetadata = user.user_metadata?.display_name;
  if (typeof fromMetadata === 'string' && fromMetadata.trim()) return fromMetadata.trim();

  // Google fills these in automatically. Windup display names are a single word, so keep the first word.
  const googleName = [
    user.user_metadata?.given_name,
    user.user_metadata?.full_name,
    user.user_metadata?.name,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const googleFirstName = googleName?.trim().split(/\s+/)[0];
  if (googleFirstName) return googleFirstName;

  const prefix = user.email?.split('@')[0] || 'Scribe';
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};

interface SyncOptions {
  /** Overwrite the saved display name. Off by default so a name edited in Settings is not reverted. */
  overwriteName?: boolean;
}

/** Mirrors the signed-in Supabase user into the localStorage profile keys. */
export function syncProfileFromUser(user: User, { overwriteName = false }: SyncOptions = {}): void {
  if (user.email) setLocalStorageItem(KEYS.email, user.email);
  if (user.created_at) setLocalStorageItem(KEYS.memberSince, user.created_at);
  if (overwriteName || !getLocalStorageItem(KEYS.name)) setLocalStorageItem(KEYS.name, getDisplayName(user));
  removeLocalStorageItem(KEYS.guest);
}

/** Forgets the local profile (used on sign-out or when the Supabase session is gone). */
export function clearLocalProfile(): void {
  Object.values(KEYS).forEach(removeLocalStorageItem);
}

/**
 * Browser storage that belongs to ONE account (or to the old, account-less local store). Matched by prefix, so
 * per-account keys such as `sky_liked_planes:<user id>` are caught too. The theme and other device-wide
 * preferences are deliberately not listed here.
 */
const ACCOUNT_SCOPED_PREFIXES = [
  'windup_letters', // legacy local letter store (retired: letters now live only in Supabase, per user_id)
  'windup_email_notifications',
  'windup_last_release_date', // legacy client-side quota counters (quotas now live in the database)
  'windup_daily_release_count',
  'windup_mimi_date',
  'windup_mimi_count',
  'sky_read_planes',
  'sky_liked_planes',
  'windup_mimi_chat', // Mimi conversation history, saved per account as windup_mimi_chat:<user id>
] as const;

/** Key that remembers which account this browser last showed. Managed by AuthSync only. */
export const ACTIVE_USER_KEY = 'windup_active_user';

/**
 * Wipes everything cached in this browser for the previous account (profile mirror, local letters, hearts,
 * read marks, old quota counters). Call when the signed-in account changes or ends.
 */
export function purgeAccountStorage(): void {
  clearLocalProfile();
  try {
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && ACCOUNT_SCOPED_PREFIXES.some((prefix) => key.startsWith(prefix))) stale.push(key);
    }
    stale.forEach(removeLocalStorageItem);
  } catch {
    /* storage unavailable - nothing cached to remove */
  }
  removeLocalStorageItem(ACTIVE_USER_KEY);
}

/** Friendly, non-technical messages for the Supabase auth errors users can actually hit. */
export function getAuthErrorMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Invalid email or password. Please try again.';
    case 'email_not_confirmed':
      return 'Please confirm your email address first. Check your inbox for the confirmation link.';
    case 'user_already_exists':
    case 'email_exists':
      return 'An account with this email already exists. Try signing in instead.';
    case 'weak_password':
      return 'That password is too weak. Try a longer or more varied one.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return fallback;
  }
}