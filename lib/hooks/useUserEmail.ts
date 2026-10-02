'use client';

import { useEffect, useState } from 'react';

const EMAIL_KEY = 'windup_user_email';

/** Returns the logged-in user's email (from localStorage) or null if none is stored. */
export function useUserEmail(): string | null {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setEmail(localStorage.getItem(EMAIL_KEY));
    read();
    // Stay in sync when Settings/Login update the profile or another tab changes it
    window.addEventListener('windup_profile_updated', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('windup_profile_updated', read);
      window.removeEventListener('storage', read);
    };
  }, []);

  return email;
}