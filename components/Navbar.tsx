'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LogOut, Moon, Sun, LogIn, Eye } from 'lucide-react';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && resolvedTheme === 'dark';
  const [isGuest, setIsGuest] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [displayName, setDisplayName] = useState('Anonymous Scribe');
  const [email, setEmail] = useState('scribe@windup.app');
  const [initials, setInitials] = useState('AS');

  // Load user data or guest status
  const loadUserData = () => {
    const guestFlag = localStorage.getItem('windup_is_guest') === 'true';
    const savedEmail = localStorage.getItem('windup_user_email');
    const savedName = localStorage.getItem('windup_display_name');

    if (guestFlag || (!savedEmail && !savedName)) {
      setIsGuest(true);
      setDisplayName('Guest Traveler');
      setEmail('Browsing mode');
      setInitials('G');
    } else {
      setIsGuest(false);
      if (savedName) {
        const trimmed = savedName.trim();
        setDisplayName(trimmed);
        
        const words = trimmed.split(' ');
        if (words.length >= 2) {
          setInitials((words[0][0] + words[1][0]).toUpperCase());
        } else if (words.length === 1 && words[0].length > 0) {
          setInitials(words[0].substring(0, 2).toUpperCase());
        }
      }

      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    loadUserData();

    const handleStorageChange = () => {
      loadUserData();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('windup_profile_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('windup_profile_updated', handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem('windup_is_guest');
    localStorage.removeItem('windup_user_email');
    localStorage.removeItem('windup_display_name');
    router.push('/login');
  };

  const allNavLinks = [
    { name: 'Fold', href: '/fold' },
    { name: 'My Jar', href: '/jar' },
    { name: 'The Sky', href: '/sky' },
    { name: 'Sent Planes', href: '/sent-planes' },
    { name: 'Settings', href: '/settings' },
  ];

  const navLinks = isGuest
    ? [{ name: 'The Sky', href: '/sky' }]
    : allNavLinks;

  return (
    <header className="w-full border-b border-rose-100/70 dark:border-slate-800 bg-[#fbf9f5]/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand logo */}
        <Link href={isGuest ? '/sky' : '/jar'} className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-slate-100 group shrink-0">
          <img
            src="/logo.png"
            alt="Windup logo"
            className="w-8 h-8 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="tracking-tight text-slate-800 dark:text-slate-100">Windup</span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-rose-50/50 dark:bg-slate-800/60 p-1 rounded-full border border-rose-100/60 dark:border-slate-800 text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full transition-colors duration-150 ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User / Theme section */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-rose-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100/70 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-rose-100/60 dark:border-transparent"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
          </button>

          {/* Guest or Profile menu */}
          {isGuest ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/50 dark:border-rose-900/40 text-[11px] font-medium text-rose-700 dark:text-rose-300">
                <Eye className="w-3 h-3 text-rose-400" /> Guest Mode
              </span>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-rose-300 transition-all focus:outline-hidden cursor-pointer shadow-xs border border-rose-200/80 dark:border-rose-900/50"
              >
                {initials}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-rose-50 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {email}
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}