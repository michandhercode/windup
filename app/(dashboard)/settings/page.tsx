import { Metadata } from 'next';
import SettingsPage from './SettingsPage';

export const metadata: Metadata = {
  title: 'Settings | Windup',
  description: 'Customize your Windup journaling experience.',
};

export default function Page() {
  return <SettingsPage />;
}