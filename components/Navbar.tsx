'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic user states
  const [displayName, setDisplayName] = useState('Anonymous Scribe');
  const [email, setEmail] = useState('scribe@windup.app');
  const [initials, setInitials] = useState('AS');

  // Function para basahin ang profile at email mula sa localStorage
  const loadUserData = () => {
    const savedName = localStorage.getItem('windup_display_name');
    if (savedName) {
      const trimmed = savedName.trim();
      setDisplayName(trimmed);
      
      // Kunin ang initials (Halimbawa: Isang salita -> kukunin ang unang 2 letra)
      const words = trimmed.split(' ');
      if (words.length >= 2) {
        setInitials((words[0][0] + words[1][0]).toUpperCase());
      } else if (words.length === 1 && words[0].length > 0) {
        setInitials(words[0].substring(0, 2).toUpperCase());
      }
    }

    // Basahin din ang naka-save na email
    const savedEmail = localStorage.getItem('windup_user_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  };

  // Re-check dark mode state & Load user profile on mount
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
    loadUserData();

    // Listener para mag-update agad kapag binago sa Settings o Sign up/Login page
    const handleStorageChange = () => {
      loadUserData();
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event para sa instant local updates sa loob ng parehong tab
    window.addEventListener('windup_profile_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('windup_profile_updated', handleStorageChange);
    };
  }, []);

  // Close dropdown kapag nag-click sa labas
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
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Fold', href: '/fold' },
    { name: 'My Jar', href: '/jar' },
    { name: 'The Sky', href: '/sky' },
    { name: 'Sent Planes', href: '/sent-planes' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <header className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/jar" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-slate-100 group">
          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-extrabold shadow-xs group-hover:scale-105 transition-transform">
            W
          </div>
          <span>Windup</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Theme Toggle & Profile Avatar */}
        <div className="flex items-center gap-3">
          {/* Quick Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Profile Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            {/* Clickable Dynamic Profile Avatar Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-purple-400/80 transition-all focus:outline-hidden cursor-pointer shadow-xs"
            >
              {initials}
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                
                {/* User Info Header (Dynamic) */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {email}
                  </p>
                </div>

                {/* Sign Out Button */}
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
        </div>

      </div>
    </header>
  );
}