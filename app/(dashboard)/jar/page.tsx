import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import JarPage from './JarPage';
import { getUserJarThoughts } from '@/app/actions/thoughts';
import { getAuthUserId } from '@/lib/auth';
import { thoughtToLetter } from '@/lib/thoughts';

export const metadata: Metadata = {
  title: 'My Jar | Windup',
  description: 'Your private safe haven for drafts, kept thoughts, and sealed letters.',
};

export default async function Page() {
  // The jar is private to an account: guests are sent to sign in instead of seeing anyone's (or any local) letters.
  if (!(await getAuthUserId())) redirect('/login');

  // Only this account's rows (user_id = auth.uid()), fetched fresh on every request.
  const initialThoughts = (await getUserJarThoughts()).map(thoughtToLetter);

  return <JarPage initialThoughts={initialThoughts} isAuthenticated />;
}