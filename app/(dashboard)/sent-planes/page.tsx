import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SentPlanesPage from './SentPlanesPage';
import { getPublicThoughts } from '@/app/actions/thoughts';
import { getAuthUserId } from '@/lib/auth';
import { getUserQuota } from '@/app/actions/quota';

export const metadata: Metadata = {
  title: 'Sent Planes | Windup',
  description: 'Manage and view all the public paper planes you have released.',
};

export default async function Page() {
  const [publicThoughts, userId, quota] = await Promise.all([getPublicThoughts(), getAuthUserId(), getUserQuota()]);
  // Sent planes belong to an account: guests are sent to sign in.
  if (!userId) redirect('/login');

  // Today's release count from get_user_quota(), so "Today's Limit" is right on the very first paint.
  return <SentPlanesPage publicThoughts={publicThoughts} isAuthenticated initialReleaseQuota={quota?.release ?? null} />;
}