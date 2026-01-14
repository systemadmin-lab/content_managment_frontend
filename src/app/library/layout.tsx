'use client';

import AuthGuard from '@/components/AuthGuard';
import DashboardHeader from '@/components/DashboardHeader';

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        <DashboardHeader />
        {children}
      </div>
    </AuthGuard>
  );
}
