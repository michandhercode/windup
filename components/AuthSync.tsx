'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { clearLocalProfile, syncProfileFromUser } from '@/lib/auth-client';

/**
 * Renders nothing. Keeps the local profile (used by the Navbar and Settings) in step with the real
 * Supabase session: fills it in after an email-confirmation sign-in, and clears it when the session
 * ends (sign-out in another tab, expired session) so the UI never claims you are signed in when you are not.
 */
export default function AuthSync() {
  useEffect(() => {
    const supabase = createClient();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        syncProfileFromUser(session.user);
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        clearLocalProfile();
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}