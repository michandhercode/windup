import { Metadata } from 'next';
import FoldPage from './FoldPage';

export const metadata: Metadata = {
  title: 'Fold a Letter | Windup',
  description: 'Pour your thoughts and fold them into a paper plane or jar.',
};

export default function Page() {
  return <FoldPage />;
}