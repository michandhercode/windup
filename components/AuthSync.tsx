'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ACTIVE_USER_KEY, clearLocalProfile, purgeAccountStorage, syncProfileFromUser } from '@/lib/auth-client';
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/hooks/useLocalStorage';

/**
 * Renders nothing. Keeps this browser's cached state in step with the real Supabase session:
 *
 * - Remembers WHICH account the browser last showed. When that changes (sign-in as someone else, sign-out,
 *   a session that ended in another tab) everything cached for the previous account is wiped before the new
 *   one is shown, so drafts, hearts, read marks and profile details can never carry over.
 * - Refreshes the server-rendered data (jar, sent planes, sky hearts) after such a change, so this tab shows
 *   only the rows of the account that is signed in now (`user_id = auth.uid()`).
 */
export default function AuthSync() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const nextId = session?.user?.id ?? null;
      const previousId = getLocalStorageItem(ACTIVE_USER_KEY);
      const accountChanged = previousId !== nextId;

      if (accountChanged) {
        purgeAccountStorage();
        if (nextId) setLocalStorageItem(ACTIVE_USER_KEY, nextId);
      }

      if (session?.user) {
        // A different account must not inherit the previous account's saved display name.
        syncProfileFromUser(session.user, { overwriteName: accountChanged });
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        clearLocalProfile();
      }

      // Another account (or none) is active now: reload the server data for it. Deferred so it never runs
      // inside the auth callback itself.
      if (accountChanged && previousId !== null) setTimeout(() => router.refresh(), 0);
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  return null;
}