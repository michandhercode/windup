import Navbar from '@/components/Navbar';
import AuthSync from '@/components/AuthSync';
import { ToastProvider } from '@/components/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-dvh text-[var(--text-main)] transition-colors">
        <AuthSync />
        <Navbar />
        <main>{children}</main>
      </div>
    </ToastProvider>
  );
}