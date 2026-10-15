import { Metadata } from 'next';
import FoldPage from './FoldPage';
import { getUserJarThoughts } from '@/app/actions/thoughts';
import { getAuthUserId } from '@/lib/auth';
import { thoughtToLetter } from '@/lib/thoughts';

export const metadata: Metadata = {
  title: 'Fold a Letter | Windup',
  description: 'Pour your thoughts and fold them into a paper plane or jar.',
};

export default async function Page() {
  const isAuthenticated = !!(await getAuthUserId());
  // Loaded so a draft can be opened for editing (/fold?draftId=...)
  const initialThoughts = isAuthenticated ? (await getUserJarThoughts()).map(thoughtToLetter) : [];

  return <FoldPage isAuthenticated={isAuthenticated} initialThoughts={initialThoughts} />;
}