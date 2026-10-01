'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-6 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* 5-Frame Stop-Motion Background (Walang opacity fading, pure frame switch) */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 animate-windup-bg" />

      {/* Napaka-manipis na dark/light tint para lumutang nang maayos ang card pero hindi kumupas ang kulay */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/40 pointer-events-none z-1" />

      <div></div>

      {/* Main Centered Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-amber-200/80 dark:border-slate-800 shadow-2xl shadow-amber-900/20 backdrop-blur-md text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 ease-out">
        
        {/* Top Badge / Pill */}
        <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/50 text-[11px] font-medium text-rose-600 dark:text-rose-300 shadow-xs">
          <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Your quiet digital keepsake</span>
        </div>

        {/* Logo Header */}
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Windup logo"
            width={80}
            height={80}
            priority
            className="w-20 h-20 object-contain drop-shadow-md transition-transform hover:scale-105 duration-300"
          />
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
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-200 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-amber-300/80 dark:border-slate-600 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Sign In to your account</span>
          </button>

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
      <footer className="relative z-10 text-[11px] text-slate-600 dark:text-slate-400 py-2 font-medium drop-shadow-sm">
        Windup &copy; 2026
      </footer>

      {/* True Stop-Motion Keyframes (Walang Fade/Opacity, diretso palit ng frame para laging matingkad) */}
      <style jsx>{`
        @keyframes windupAnimation {
          0% { background-image: url('/landing1.png'); }
          20% { background-image: url('/landing2.png'); }
          40% { background-image: url('/landing3.png'); }
          60% { background-image: url('/landing4.png'); }
          80%, 100% { background-image: url('/landing5.png'); }
        }

        .animate-windup-bg {
          animation: windupAnimation 2.5s infinite steps(1);
        }
      `}</style>

    </div>
  );
}