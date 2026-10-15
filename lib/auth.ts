import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';

/**
 * Server-only: the signed-in Supabase user's id, or null when there is no Supabase session.
 *
 * - Uses getClaims(), which verifies the session token locally (no round trip to Supabase Auth) when the
 *   project uses asymmetric JWT signing keys. getUser() makes a network call every time.
 * - Wrapped in cache(), so a page and the server actions it calls share one check per request.
 *
 * Writes stay protected regardless: Row Level Security in the database checks auth.uid() on every query.
 */
export const getAuthUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
});