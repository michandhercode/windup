'use client';

import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-[#fbf9f5] dark:bg-[var(--bg-main)] text-slate-800 dark:text-slate-100 transition-colors">
      
      <div></div>

      {/* Main Centered Card with Smooth Fade-in & Scale Animation */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 shadow-xl shadow-amber-900/15 backdrop-blur-md text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 ease-out">
        
        {/* Top Badge / Pill */}
        <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/50 text-[11px] font-medium text-rose-600 dark:text-rose-300 shadow-xs">
          <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Your quiet digital keepsake</span>
        </div>

        {/* Logo / Icon Header */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-lg shadow-sm border border-rose-300/60 transition-transform hover:scale-105 duration-300">
            W
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">
            Welcome to <span className="text-rose-600 dark:text-rose-400">Windup</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-4 font-normal">
            A quiet space to fold your memories into paper planes and keep them safe in your jar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Sign In Button */}
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-200 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-amber-300/80 dark:border-slate-600 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Sign In to your account</span>
          </button>

          {/* Create Account Button */}
          <button
            onClick={() => router.push('/signup')}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-100/90 hover:bg-rose-200 text-rose-950 dark:bg-rose-950/70 dark:hover:bg-rose-900 dark:text-rose-200 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-rose-300/80 dark:border-rose-800 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            <span>Create a new space</span>
          </button>
        </div>

        {/* Divider OR */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">or</span>
          <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
        </div>

        {/* Clean Text-based Sky Link */}
        <div className="pt-1">
          <button
            onClick={() => router.push('/sky')}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors underline underline-offset-4"
          >
            Take a peek into the sky
          </button>
        </div>

      </div>

      {/* Footer Copyright */}
      <footer className="text-[11px] text-slate-500 dark:text-slate-500 py-2">
        Windup &copy; 2026
      </footer>

    </div>
  );
}