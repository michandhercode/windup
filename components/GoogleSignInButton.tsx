'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface GoogleSignInButtonProps {
  /** Called with a friendly message when the sign-in could not be started. */
  onError: (message: string) => void;
  /** Disables the button (e.g. while the email/password form is submitting). */
  disabled?: boolean;
  /** Button text, so the login and signup pages can word it differently. */
  label?: string;
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function GoogleSignInButton({
  onError,
  disabled = false,
  label = 'Continue with Google',
}: GoogleSignInButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  // If the user comes back with the browser's Back button, the page can be restored from the
  // back/forward cache with the button still stuck on "Redirecting...". Reset it.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setIsRedirecting(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsRedirecting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Same landing point as the email confirmation link. It exchanges the code for a session
          // and sends the user to /jar. Kept free of query params so it matches the Redirect URLs
          // allow-list in Supabase exactly.
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        onError('We could not start Google sign-in. Please try again.');
        setIsRedirecting(false);
      }
      // On success the browser is already navigating to Google, so the button stays in its loading state.
    } catch {
      onError('We could not reach the server. Please check your connection and try again.');
      setIsRedirecting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || isRedirecting}
      className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 border border-slate-300 dark:border-slate-600 shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 cursor-pointer"
    >
      <GoogleIcon />
      <span>{isRedirecting ? 'Redirecting to Google...' : label}</span>
    </button>
  );
}