import Navbar from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh text-[var(--text-main)] transition-colors">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}