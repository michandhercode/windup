import { Metadata } from 'next';
import SkyPage from './SkyPage';
import { getPublicThoughts } from '@/app/actions/thoughts';

export const metadata: Metadata = {
  title: 'The Sky | Windup',
  description: 'Anonymous public paper planes drifting softly in the quiet sky.',
};

export default async function Page() {
  const publicThoughts = await getPublicThoughts();

  return <SkyPage publicThoughts={publicThoughts} />;
}