import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SettingsPage from './SettingsPage';
import { getAuthUserId } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Settings | Windup',
  description: 'Customize your Windup journaling experience.',
};

export default async function Page() {
  // Settings belong to an account: guests are sent to sign in.
  if (!(await getAuthUserId())) redirect('/login');

  return <SettingsPage />;
}