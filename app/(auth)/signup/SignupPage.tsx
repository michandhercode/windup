'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import FieldError, { getAuthInputClass } from '@/components/FieldError';
import { validateDisplayName, validateEmail, validatePassword } from '@/lib/validation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const router = useRouter();

  // Inline errors are derived: shown after blur/submit, and they clear as soon as the value is fixed.
  const nameError = touched.name ? validateDisplayName(name) : '';
  const emailError = touched.email ? validateEmail(email) : '';
  const passwordError = touched.password ? validatePassword(password) : '';

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setTouched({ name: true, email: true, password: true });
    if (validateDisplayName(name) || validateEmail(email) || validatePassword(password)) return;

    const trimmedName = name.trim();

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      localStorage.setItem('windup_display_name', trimmedName);
      localStorage.setItem('windup_user_email', email.trim());
      localStorage.setItem('windup_member_since', new Date().toISOString());
      localStorage.setItem('windup_user', JSON.stringify({ name: trimmedName, email: email.trim() }));

      window.dispatchEvent(new Event('windup_profile_updated'));

      router.push('/jar');
    } catch {
      setError('Something went wrong while creating your account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-between p-4 sm:p-6 text-slate-800 dark:text-slate-100 transition-colors">
      
      <div></div>

      {/* Main Centered Card matching the exact Landing Page and Login style */}
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
        <form onSubmit={handleSignUp} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="signup-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <span className="text-[10px] text-slate-400">Single name only</span>
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="signup-name"
                type="text"
                autoComplete="username"
                aria-required="true"
                aria-invalid={!!nameError}
                aria-describedby={nameError ? 'signup-name-error' : undefined}
                disabled={isLoading}
                value={name}
                onChange={(e) => {
                  setName(e.target.value.replace(/\s+/g, ''));
                }}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Scribe"
                className={getAuthInputClass(!!nameError, 'pl-10 pr-4')}
              />
            </div>
            <FieldError id="signup-name-error" message={nameError} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'signup-email-error' : undefined}
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="scribe@windup.app"
                className={getAuthInputClass(!!emailError, 'pl-10 pr-4')}
              />
            </div>
            <FieldError id="signup-email-error" message={emailError} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'signup-password-error' : 'signup-password-hint'}
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                className={getAuthInputClass(!!passwordError, 'pl-10 pr-10')}
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
            {passwordError ? (
              <FieldError id="signup-password-error" message={passwordError} />
            ) : (
              <p id="signup-password-hint" className="text-[10px] text-slate-400">
                At least 8 characters.
              </p>
            )}
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