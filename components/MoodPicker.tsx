'use client';

import { Mood } from '@/types/letter';
import { Sun, Cloud, Sparkles, Anchor, Compass, Feather } from 'lucide-react';

interface MoodPickerProps {
  selectedMood?: Mood;
  onSelectMood: (mood: Mood) => void;
}

const MOOD_OPTIONS: { value: Mood; label: string; icon: React.ElementType }[] = [
  { value: 'peaceful', label: 'Peaceful', icon: Sun },
  { value: 'reflective', label: 'Reflective', icon: Compass },
  { value: 'nostalgic', label: 'Nostalgic', icon: Feather },
  { value: 'heavy', label: 'Heavy', icon: Anchor },
  { value: 'hopeful', label: 'Hopeful', icon: Sparkles },
  { value: 'quiet', label: 'Quiet', icon: Cloud },
];

export default function MoodPicker({ selectedMood, onSelectMood }: MoodPickerProps) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-700 mb-3">Select Mood</h3>
      <div className="grid grid-cols-3 gap-2">
        {MOOD_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedMood === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelectMood(item.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-sky-50 text-sky-700 border border-sky-300 shadow-xs'
                  : 'bg-stone-50 text-stone-600 border border-transparent hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}