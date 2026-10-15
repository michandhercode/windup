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

/** The display name chosen at sign-up (stored in user metadata), or a friendly one derived from the email. */
export const getDisplayName = (user: User): string => {
  const fromMetadata = user.user_metadata?.display_name;
  if (typeof fromMetadata === 'string' && fromMetadata.trim()) return fromMetadata.trim();
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