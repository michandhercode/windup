import { Suspense } from 'react';
import LoginPage from './LoginPage';

export default function Page() {
  // LoginPage reads the URL (?error=...), which needs a Suspense boundary
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}