'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>
            </div>
            <span>ToveeAi</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-md text-sm transition-all ${
              isActive('/dashboard') 
                ? 'bg-white/10 text-white font-medium' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/library"
            className={`px-4 py-2 rounded-md text-sm transition-all ${
              isActive('/library') 
                ? 'bg-white/10 text-white font-medium' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Library
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-white/10 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* User Info - Desktop only */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-white">{user?.name || 'Guest'}</span>
            <span className="text-xs text-gray-400">{user?.email}</span>
          </div>
          
          {/* Logout Button - Desktop */}
          <button
            onClick={handleLogout}
            className="hidden md:inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-white/20 bg-white/5 shadow-sm hover:bg-white/10 hover:text-white text-gray-200 h-9 px-4 py-2 active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/50 backdrop-blur-xl">
          <nav className="px-6 py-4 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-md text-sm transition-all ${
                isActive('/dashboard') 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/library"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-md text-sm transition-all ${
                isActive('/library') 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Library
            </Link>
            
            {/* User Info - Mobile */}
            <div className="px-4 py-3 border-t border-white/10 mt-2">
              <div className="text-sm font-medium text-white">{user?.name || 'Guest'}</div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </div>
            
            {/* Logout Button - Mobile */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-md text-sm font-medium transition-all border border-white/20 bg-white/5 hover:bg-white/10 text-gray-200"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
