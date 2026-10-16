import { Metadata } from 'next';
import SkyPage from './SkyPage';
import { getPublicThoughts } from '@/app/actions/thoughts';
import { getAuthUserId } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'The Sky | Windup',
  description: 'Anonymous public paper planes drifting softly in the quiet sky.',
};

export default async function Page() {
  // Guests may browse and read; the page only needs to know whether liking is allowed.
  const [publicThoughts, userId] = await Promise.all([getPublicThoughts(), getAuthUserId()]);

  return <SkyPage publicThoughts={publicThoughts} isAuthenticated={!!userId} />;
}