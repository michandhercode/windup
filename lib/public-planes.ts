import { createPublicClient } from '@/utils/supabase/public';

/**
 * The real number of public planes: rows that are released AND public, counted in the database.
 * It reads the same `public_thoughts` view that fills The Sky, so both always agree.
 * (A head request: Postgres counts, no rows are sent.)
 */
export async function getPublicPlaneCount(): Promise<number> {
  try {
    const { count, error } = await createPublicClient()
      .from('public_thoughts')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('[public-planes] count failed', { code: error.code, message: error.message });
      return 0;
    }
    return count ?? 0;
  } catch (error) {
    // e.g. the Supabase env vars are missing at build time: never break the welcome page over a counter
    console.error('[public-planes] count failed', error);
    return 0;
  }
}