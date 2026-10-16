import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SentPlanesPage from './SentPlanesPage';
import { getPublicThoughts } from '@/app/actions/thoughts';
import { getAuthUserId } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Sent Planes | Windup',
  description: 'Manage and view all the public paper planes you have released.',
};

export default async function Page() {
  const [publicThoughts, userId] = await Promise.all([getPublicThoughts(), getAuthUserId()]);
  // Sent planes belong to an account: guests are sent to sign in.
  if (!userId) redirect('/login');

  return <SentPlanesPage publicThoughts={publicThoughts} isAuthenticated />;
}