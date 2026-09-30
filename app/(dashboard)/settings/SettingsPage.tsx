'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Moon, Sun, Database, Download, CheckCircle, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('Anonymous Scribe');
  const [email, setEmail] = useState('scribe@windup.app');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync theme status on page mount & update document root class
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      
      {/* Settings Header Banner */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold tracking-wide uppercase">
            <Settings className="w-3.5 h-3.5" />
            Preferences
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Settings & Preferences
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your personal profile, sanctuary appearance, and data exports.
          </p>
        </div>
      </div>

      {/* 1. Profile Details Card */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-sky-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Profile Details
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {savedSuccess && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5" /> Changes saved!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Appearance Card (Dynamic Light / Dark Theme) */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Moon className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Appearance
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Interface Theme
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Choose your preferred visual theme for the sanctuary.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => toggleTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Light Mode
            </button>

            <button
              type="button"
              onClick={() => toggleTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Dark Mode
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sanctuary Data Export Card */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Sanctuary Data
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Export All Letters & Notes
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Download a JSON backup copy of all your private notes and sent paper planes.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
        </div>
      </div>

    </div>
  );
}