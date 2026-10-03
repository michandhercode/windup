'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LogOut, Moon, Sun, LogIn, Eye, Menu, X, Settings, type LucideIcon } from 'lucide-react';

interface NavLink {
  name: string;
  href: string;
  /** Existing app artwork shown in the mobile menu */
  iconSrc?: string;
  /** Lucide fallback when there is no artwork */
  Icon?: LucideIcon;
}

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && resolvedTheme === 'dark';
  const [isGuest, setIsGuest] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [displayName, setDisplayName] = useState('Anonymous Scribe');
  const [email, setEmail] = useState('scribe@windup.app');
  const [memberSince, setMemberSince] = useState<string | null>(null);

  // Load user data or guest status
  const loadUserData = () => {
    const guestFlag = localStorage.getItem('windup_is_guest') === 'true';
    const savedEmail = localStorage.getItem('windup_user_email');
    const savedName = localStorage.getItem('windup_display_name');
    const savedJoined = localStorage.getItem('windup_member_since');

    if (guestFlag || (!savedEmail && !savedName)) {
      setIsGuest(true);
      setDisplayName('Guest Traveler');
      setEmail('Browsing mode');
    } else {
      setIsGuest(false);
      if (savedName) {
        setDisplayName(savedName.trim());
      }
      if (savedEmail) {
        setEmail(savedEmail);
      }
      const joinedYear = savedJoined ? new Date(savedJoined).getFullYear() : NaN;
      setMemberSince(Number.isNaN(joinedYear) ? null : String(joinedYear));
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

  // Mobile menu: close on outside click / ESC
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen]);

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem('windup_is_guest');
    localStorage.removeItem('windup_user_email');
    localStorage.removeItem('windup_display_name');
    router.push('/');
  };

  const allNavLinks: NavLink[] = [
    { name: 'Fold', href: '/fold', iconSrc: '/logo_and_icons/fold_icon.webp' },
    { name: 'My Jar', href: '/jar', iconSrc: '/logo_and_icons/jar_icon.webp' },
    { name: 'The Sky', href: '/sky', iconSrc: '/logo_and_icons/sky_icon.webp' },
    { name: 'Sent Planes', href: '/sent-planes', iconSrc: '/logo_and_icons/sentplanes_icon.webp' },
    { name: 'Settings', href: '/settings', Icon: Settings },
  ];

  const navLinks: NavLink[] = isGuest
    ? [{ name: 'The Sky', href: '/sky', iconSrc: '/logo_and_icons/sky_icon.webp' }]
    : allNavLinks;

  // Kunin ang unang salita sa pangalan para sa bookmark nametag
  const firstName = displayName.split(' ')[0] || 'Scribe';

  return (
    <header className="w-full border-b border-rose-100/70 dark:border-slate-800 bg-[#fbf9f5]/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand logo */}
        <Link href={isGuest ? '/sky' : '/jar'} className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-slate-100 group shrink-0">
          <img
            src="/logo_and_icons/logo.webp"
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
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-rose-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100/70 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-rose-100/60 dark:border-transparent"
            title="Toggle theme"
            aria-label="Toggle theme"
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
              {/* Paper Bookmark Nametag */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2 min-[400px]:px-3 py-1.5 rounded-2xl bg-[#fdfbf7] dark:bg-slate-800 border-2 border-rose-200/80 dark:border-slate-700 shadow-[2px_2px_0px_rgba(244,63,94,0.18)] hover:shadow-[3px_3px_0px_rgba(244,63,94,0.22)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shrink-0"
                title="Profile Menu"
              >
                {/* Profile icon */}
                <img
                  src="/logo_and_icons/profile_icon.webp"
                  alt="Profile"
                  className="w-7 h-7 object-contain shrink-0 select-none"
                  draggable={false}
                />
                
                <span className="hidden min-[400px]:inline text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {firstName}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-rose-50 dark:border-slate-800 flex items-center gap-3">
                    <img
                      src="/logo_and_icons/profile_icon.webp"
                      alt=""
                      className="w-8 h-8 object-contain shrink-0 select-none"
                      draggable={false}
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {email}
                      </p>
                      <p className="mt-1 text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 truncate">
                        {memberSince ? `Windup member since ${memberSince}` : 'Windup Member'}
                      </p>
                    </div>
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

          {/* Mobile menu toggle (hidden from md up, where the pill nav is shown) */}
          {navLinks.length > 1 && (
            <div className="md:hidden" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="p-2 rounded-full bg-rose-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100/70 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-rose-100/60 dark:border-transparent"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {isMobileMenuOpen && (
                <nav
                  id="mobile-nav"
                  aria-label="Primary"
                  className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-rose-100/70 dark:border-slate-800 bg-[#fbf9f5]/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <ul className="max-w-7xl mx-auto grid gap-1 p-3 sm:px-6">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                              isActive
                                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 font-bold shadow-xs'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-800 font-medium'
                            }`}
                          >
                            {link.iconSrc ? (
                              <img src={link.iconSrc} alt="" className="w-7 h-7 object-contain shrink-0 select-none" draggable={false} />
                            ) : (
                              link.Icon && <link.Icon className="w-5 h-5 mx-1 shrink-0 text-slate-500 dark:text-slate-400" />
                            )}
                            {link.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}