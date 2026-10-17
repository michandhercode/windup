import { Metadata } from 'next';
import SkyPage from './SkyPage';
import { getPublicThoughts, getReadThoughtIds } from '@/app/actions/thoughts';
import { getAuthUserId } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'The Sky | Windup',
  description: 'Anonymous public paper planes drifting softly in the quiet sky.',
};

export default async function Page() {
  // Guests may browse and read; the page only needs to know whether liking is allowed.
  // The planes this reader has already opened are loaded together with the feed (read_thought_ids), so the
  // very first paint already shows them as Read. Guests have no account, so their list is empty.
  const [publicThoughts, userId, readThoughtIds] = await Promise.all([
    getPublicThoughts(),
    getAuthUserId(),
    getReadThoughtIds(),
  ]);

  return <SkyPage publicThoughts={publicThoughts} isAuthenticated={!!userId} initialReadIds={readThoughtIds} />;
}