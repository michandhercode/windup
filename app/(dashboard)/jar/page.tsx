import { Metadata } from 'next';
import JarPage from './JarPage';
import { getUserJarThoughts } from '@/app/actions/thoughts';
import { getAuthUserId } from '@/lib/auth';
import { thoughtToLetter } from '@/lib/thoughts';

export const metadata: Metadata = {
  title: 'My Jar | Windup',
  description: 'Your private safe haven for drafts, kept thoughts, and sealed letters.',
};

export default async function Page() {
  const isAuthenticated = !!(await getAuthUserId());
  const initialThoughts = isAuthenticated ? (await getUserJarThoughts()).map(thoughtToLetter) : [];

  return <JarPage initialThoughts={initialThoughts} isAuthenticated={isAuthenticated} />;
}