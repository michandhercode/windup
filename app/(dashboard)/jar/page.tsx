import { Metadata } from 'next';
import JarPage from './JarPage';

export const metadata: Metadata = {
  title: 'My Jar | Windup',
  description: 'Your private safe haven for drafts, kept thoughts, and sealed letters.',
};

export default function Page() {
  return <JarPage />;
}