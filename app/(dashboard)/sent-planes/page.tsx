import { Metadata } from 'next';
import SentPlanesPage from './SentPlanesPage';
import { getPublicThoughts } from '@/app/actions/thoughts';
import { getAuthUserId } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Sent Planes | Windup',
  description: 'Manage and view all the public paper planes you have released.',
};

export default async function Page() {
  const [publicThoughts, userId] = await Promise.all([getPublicThoughts(), getAuthUserId()]);

  return <SentPlanesPage publicThoughts={publicThoughts} isAuthenticated={!!userId} />;
}