import Navbar from '@/components/Navbar';
import AuthSync from '@/components/AuthSync';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh text-[var(--text-main)] transition-colors">
      <AuthSync />
      <Navbar />
      <main>{children}</main>
    </div>
  );
}