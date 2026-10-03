'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import FieldError, { getAuthInputClass } from '@/components/FieldError';
import { validateEmail, validatePassword } from '@/lib/validation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const router = useRouter();

  // Inline errors are derived: shown after blur/submit, and they clear as soon as the value is fixed.
  const emailError = touched.email ? validateEmail(email) : '';
  const passwordError = touched.password ? validatePassword(password) : '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setTouched({ email: true, password: true });
    if (validateEmail(email) || validatePassword(password)) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const cleanEmail = email.trim();
      const emailPrefix = cleanEmail.split('@')[0];
      const formattedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

      localStorage.setItem('windup_user_email', cleanEmail);
      localStorage.setItem('windup_display_name', formattedName);

      window.dispatchEvent(new Event('windup_profile_updated'));

      router.push('/jar');
    } catch {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-between p-4 sm:p-6 text-slate-800 dark:text-slate-100 transition-colors">
      
      <div></div>

      {/* Main Centered Card matching the exact Landing Page style */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 shadow-xl shadow-amber-900/15 backdrop-blur-md space-y-6 animate-in fade-in zoom-in-95 duration-500 ease-out">
        
        {/* Logo / Icon Header */}
        <div className="flex justify-center">
          <img
            src="/logo_and_icons/logo.webp"
            alt="Windup logo"
            className="w-16 h-16 rounded-2xl object-contain shadow-sm"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight">
            Welcome back to <span className="text-rose-600 dark:text-rose-400">Windup</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2 font-normal">
            Enter your credentials to access your private notes and jar.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'login-email-error' : undefined}
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="scribe@windup.app"
              className={getAuthInputClass(!!emailError, 'px-4')}
            />
            <FieldError id="login-email-error" message={emailError} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'login-password-error' : undefined}
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                className={getAuthInputClass(!!passwordError, 'px-4 pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <FieldError id="login-password-error" message={passwordError} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-200 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-amber-300/80 dark:border-slate-600 shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100 cursor-pointer pt-3.5"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Sign In to your account</span>
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
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline underline-offset-4">
              Create a new space
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