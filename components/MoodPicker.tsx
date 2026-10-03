'use client';

import { Smile } from 'lucide-react';
import type { Mood } from '@/types/letter';
import { MOOD_ORDER, getMoodConfig } from '@/lib/mood';

interface MoodPickerProps {
  selectedMood?: Mood | string;
  onSelectMood: (mood: Mood) => void;
}

/** Mood selector. Icons, labels and colors all come from lib/mood.ts (single source of truth). */
export default function MoodPicker({ selectedMood, onSelectMood }: MoodPickerProps) {
  const currentMood = selectedMood || 'neutral';

  return (
    <div
      className="rounded-3xl border p-4 sm:p-5 space-y-4 shadow-xs transition-colors duration-200"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }}
    >
      <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <Smile className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs font-bold tracking-wider uppercase opacity-80">Current Mood / Vibe</h2>
        </div>
        <span className="text-[10px] font-medium opacity-50 shrink-0">Optional</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {MOOD_ORDER.map((id) => {
          const cfg = getMoodConfig(id);
          const Icon = cfg.icon;
          const isSelected = currentMood === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectMood(id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border active:scale-95 cursor-pointer ${
                isSelected ? cfg.chipActiveClass : cfg.chipClass
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}