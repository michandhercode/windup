import { Metadata } from 'next';
import SkyPage from './SkyPage';

export const metadata: Metadata = {
  title: 'The Sky | Windup',
  description: 'Anonymous public paper planes drifting softly in the quiet sky.',
};

export default function Page() {
  return <SkyPage />;
}