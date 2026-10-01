'use client';

import { Visibility } from '@/types/letter';
import { Lock, Send } from 'lucide-react';

interface PrivacySelectorProps {
  selectedVisibility: Visibility;
  onSelectVisibility: (visibility: Visibility) => void;
}

export default function PrivacySelector({
  selectedVisibility,
  onSelectVisibility,
}: PrivacySelectorProps) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-3">Letter Visibility</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelectVisibility('private')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-medium border transition-all ${
            selectedVisibility === 'private'
              ? 'bg-sky-100 dark:bg-sky-300 text-sky-900 dark:text-sky-950 border-sky-300 dark:border-sky-200 shadow-xs'
              : 'bg-stone-50 dark:bg-slate-800/60 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Private in Jar</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectVisibility('anonymous_public')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-medium border transition-all ${
            selectedVisibility === 'anonymous_public'
              ? 'bg-sky-100 dark:bg-sky-300 text-sky-900 dark:text-sky-950 border-sky-300 dark:border-sky-200 shadow-xs'
              : 'bg-stone-50 dark:bg-slate-800/60 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4 -rotate-12" />
          <span>Public Paper Plane</span>
        </button>
      </div>
    </div>
  );
}