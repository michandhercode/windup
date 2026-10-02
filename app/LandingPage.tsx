'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useLetters } from '@/app/providers';
import { ALL_MOCK_POOL, isPublicPlane } from '@/lib/sky-planes';

// Stop-motion background: 5 frames per theme, served from /public/landing_bg
const FRAME_COUNT = 5;
const FRAME_INTERVAL_MS = 400;
const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => i + 1);

export default function LandingPage() {
  const router = useRouter();
  const { letters } = useLetters();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % FRAME_COUNT);
    }, FRAME_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

  // Dynamic counter connected to backend/database state
  const totalPlanes = (letters?.filter(isPublicPlane)?.length || 0) + ALL_MOCK_POOL.length;

  return (
    <div className="relative isolate overflow-hidden min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-[#fbf9f5] dark:bg-[var(--bg-main)] text-slate-800 dark:text-slate-100 transition-colors">

      {/* Stop-motion background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none">
        {FRAMES.map((n, i) => (
          <img
            key={`light-${n}`}
            src={`/landing_bg/landing${n}.webp`}
            alt=""
            draggable={false}
            className={`absolute inset-0 w-full h-full object-cover dark:hidden ${i === frame ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        {FRAMES.map((n, i) => (
          <img
            key={`dark-${n}`}
            src={`/landing_bg/darklanding${n}.webp`}
            alt=""
            draggable={false}
            className={`absolute inset-0 w-full h-full object-cover hidden dark:block ${i === frame ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>

      <div></div>

      {/* Main Centered Card */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-amber-200/80 dark:border-slate-800 shadow-2xl shadow-amber-950/10 backdrop-blur-md text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 ease-out">
        
        {/* Logo Header */}
        <div className="flex justify-center">
          <img
            src="/logo_and_icons/logo.webp"
            alt="Windup logo"
            className="w-16 h-16 rounded-2xl object-contain shadow-xs transition-transform hover:scale-105 duration-300"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to <span className="text-rose-600 dark:text-rose-400">Windup</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xs mx-auto">
            A quiet space to fold your memories into paper planes and keep them safe in your jar.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-3 pt-1">
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-200 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-amber-300/80 dark:border-slate-600 shadow-xs hover:scale-[1.01] active:scale-[0.99]"
          >
            <LogIn className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Sign In to your account</span>
          </button>

          <button
            onClick={() => router.push('/signup')}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-100/90 hover:bg-rose-200 text-rose-950 dark:bg-rose-950/70 dark:hover:bg-rose-900 dark:text-rose-200 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-rose-300/80 dark:border-rose-800 shadow-xs hover:scale-[1.01] active:scale-[0.99]"
          >
            <UserPlus className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            <span>Create a new space</span>
          </button>
        </div>

        {/* Simple & Clean Sky Card with Animated Number */}
        <div className="pt-1">
          <div
            onClick={() => router.push('/sky')}
            className="group cursor-pointer rounded-2xl bg-sky-50/80 dark:bg-slate-800/60 border border-sky-200/70 dark:border-slate-700 p-4 transition-all duration-200 hover:bg-sky-100/70 dark:hover:bg-slate-800/90 hover:border-sky-300/80 text-left"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Static Paper Plane Image */}
              <div className="shrink-0">
                <img
                  src="/logo_and_icons/my_plane.webp"
                  alt="Paper plane"
                  className="w-11 h-11 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Animated Pulsing Number & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="inline-block text-2xl font-extrabold text-sky-900 dark:text-sky-300 tabular-nums animate-pulse">
                    {totalPlanes.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    paper planes drifting in the sky
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Read quiet thoughts shared by people everywhere
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className="shrink-0 text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Copyright */}
      <footer className="text-[11px] text-slate-500 dark:text-slate-500 py-2">
        Windup &copy; 2026
      </footer>

    </div>
  );
}