'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (trimmedName.includes(' ')) {
      setError('Please enter a single display name only (no spaces).');
      return;
    }

    if (!trimmedName) {
      setError('Display name is required.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      localStorage.setItem('windup_display_name', trimmedName);
      localStorage.setItem('windup_user_email', email.trim());
      localStorage.setItem('windup_user', JSON.stringify({ name: trimmedName, email: email.trim() }));

      window.dispatchEvent(new Event('windup_profile_updated'));

      router.push('/jar');
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-[url('/daybg.png')] bg-cover bg-center bg-no-repeat text-slate-800 dark:text-slate-100 transition-colors">
      
      <div></div>

      {/* Main Centered Card matching the exact Landing Page and Login style */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 shadow-xl shadow-amber-900/15 backdrop-blur-md space-y-6 animate-in fade-in zoom-in-95 duration-500 ease-out">
        
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
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">
            Create Sanctuary in <span className="text-rose-600 dark:text-rose-400">Windup</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2 font-normal">
            Join Windup to fold memories and release paper planes.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <span className="text-[10px] text-slate-400">Single name only</span>
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                disabled={isLoading}
                value={name}
                onChange={(e) => {
                  setName(e.target.value.replace(/\s+/g, ''));
                }}
                placeholder="Scribe"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-amber-200/80 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-800/50 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 focus:outline-hidden transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scribe@windup.app"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-amber-200/80 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-800/50 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 focus:outline-hidden transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-amber-200/80 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-800/50 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 focus:outline-hidden transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-200 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-amber-300/80 dark:border-slate-600 shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 cursor-pointer pt-3.5"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-700 dark:text-amber-400" />
                <span>Creating sanctuary...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              </>
            )}
          </button>
        </form>

        {/* Divider OR */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">or</span>
          <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-1">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>

      </div>

      {/* Footer Copyright */}
      <footer className="text-[11px] text-slate-500 dark:text-slate-500 py-2">
        Windup &copy; 2026
      </footer>

    </div>
  );
}