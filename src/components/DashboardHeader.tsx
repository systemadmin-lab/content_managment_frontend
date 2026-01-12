'use client';

import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                {/* We need to import Brain from lucide-react. I'll do that in a separate replacement or assume it's available if I add the import. */}
                {/* Wait, I can't assume imports. I need to update imports too. I'll use multi_replace. */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>
            </div>
            <span>Antigravity<span className="text-gray-400">AI</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            Dashboard
          </Link>
          <Link
            href="/library"
            className="px-4 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            Library
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-white">{user?.name || 'Guest'}</span>
            <span className="text-xs text-gray-400">{user?.email}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-white/20 bg-white/5 shadow-sm hover:bg-white/10 hover:text-white text-gray-200 h-9 px-4 py-2 active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
