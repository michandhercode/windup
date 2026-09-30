'use client';

import { Mood } from '@/types/letter';
import { Sparkles, Feather, BookOpen, Clock, CloudRain, HeartHandshake } from 'lucide-react';

interface MoodPickerProps {
  selectedMood?: Mood | string;
  onSelectMood: (mood: Mood | string) => void;
}

const MOOD_OPTIONS = [
  { id: 'peaceful', label: 'Peaceful', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-800/60 hover:bg-emerald-500/20', activeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20', icon: Feather },
  { id: 'reflective', label: 'Reflective', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/50 dark:border-sky-800/60 hover:bg-sky-500/20', activeBg: 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20', icon: BookOpen },
  { id: 'nostalgic', label: 'Nostalgic', color: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/50 dark:border-amber-800/60 hover:bg-amber-500/20', activeBg: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20', icon: Clock },
  { id: 'heavy', label: 'Heavy', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/50 dark:border-purple-800/60 hover:bg-purple-500/20', activeBg: 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20', icon: CloudRain },
  { id: 'hopeful', label: 'Hopeful', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300/50 dark:border-rose-800/60 hover:bg-rose-500/20', activeBg: 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20', icon: HeartHandshake },
];

export default function MoodPicker({ selectedMood, onSelectMood }: MoodPickerProps) {
  const currentMood = selectedMood || 'neutral';

  return (
    <div 
      className="rounded-3xl border shadow-md p-5 space-y-3.5 transition-colors duration-200"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
          Current Mood / Vibe
        </label>
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Optional</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectMood('neutral')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border active:scale-95 ${
            currentMood === 'neutral' 
              ? 'bg-slate-500 text-white border-slate-600 shadow-md shadow-slate-500/20' 
              : 'bg-stone-500/5 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-500/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Neutral / None</span>
        </button>

        {MOOD_OPTIONS.map((m) => {
          const Icon = m.icon;
          const isSelected = currentMood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMood(m.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border active:scale-95 ${
                isSelected ? m.activeBg : m.color
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}