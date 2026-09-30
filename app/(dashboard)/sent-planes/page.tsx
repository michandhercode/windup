import { Metadata } from 'next';
import SentPlanesPage from './SentPlanesPage';

export const metadata: Metadata = {
  title: 'Sent Planes | Windup',
  description: 'Manage and view all the public paper planes you have released.',
};

export default function Page() {
  return <SentPlanesPage />;
}