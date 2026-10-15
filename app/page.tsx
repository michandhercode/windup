import LandingPage from './LandingPage';
import { getPublicPlaneCount } from '@/lib/public-planes';

// Static page, refreshed at most once a minute. Releasing or deleting a plane also refreshes it immediately.
export const revalidate = 60;

export default async function Page() {
  const livePlaneCount = await getPublicPlaneCount();

  return <LandingPage livePlaneCount={livePlaneCount} />;
}