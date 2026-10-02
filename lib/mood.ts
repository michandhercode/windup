import { Sparkles, Feather, BookOpen, Clock, CloudRain, HeartHandshake, type LucideIcon } from 'lucide-react';
import type { Mood } from '@/types/letter';

export interface MoodConfig {
  label: string;
  icon: LucideIcon;
  /** Soft pastel pill for the mood badge */
  badgeClass: string;
  /** Paper-like surface: warm off-white that fades into a faint mood tint, with a soft border */
  paperClass: string;
  /** Thin "margin line" accent on the left edge of a card / modal */
  accentClass: string;
}

const MOODS: Record<Mood, MoodConfig> = {
  neutral: {
    label: 'Neutral',
    icon: Sparkles,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    paperClass:
      'bg-gradient-to-br from-[#fffdf8] to-stone-100 border-stone-200 hover:border-stone-300 dark:from-slate-900 dark:to-slate-800/60 dark:border-slate-700 dark:hover:border-slate-600',
    accentClass: 'bg-slate-300 dark:bg-slate-500',
  },
  peaceful: {
    label: 'Peaceful',
    icon: Feather,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
    paperClass:
      'bg-gradient-to-br from-[#fffdf8] to-emerald-50 border-emerald-200/80 hover:border-emerald-300 dark:from-slate-900 dark:to-emerald-950/40 dark:border-emerald-900 dark:hover:border-emerald-700',
    accentClass: 'bg-emerald-300 dark:bg-emerald-600',
  },
  reflective: {
    label: 'Reflective',
    icon: BookOpen,
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800',
    paperClass:
      'bg-gradient-to-br from-[#fffdf8] to-sky-50 border-sky-200/80 hover:border-sky-300 dark:from-slate-900 dark:to-sky-950/40 dark:border-sky-900 dark:hover:border-sky-700',
    accentClass: 'bg-sky-300 dark:bg-sky-600',
  },
  nostalgic: {
    label: 'Nostalgic',
    icon: Clock,
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
    paperClass:
      'bg-gradient-to-br from-[#fffdf8] to-amber-50 border-amber-200/80 hover:border-amber-300 dark:from-slate-900 dark:to-amber-950/40 dark:border-amber-900 dark:hover:border-amber-700',
    accentClass: 'bg-amber-300 dark:bg-amber-600',
  },
  heavy: {
    label: 'Heavy',
    icon: CloudRain,
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800',
    paperClass:
      'bg-gradient-to-br from-[#fffdf8] to-purple-50 border-purple-200/80 hover:border-purple-300 dark:from-slate-900 dark:to-purple-950/40 dark:border-purple-900 dark:hover:border-purple-700',
    accentClass: 'bg-purple-300 dark:bg-purple-600',
  },
  hopeful: {
    label: 'Hopeful',
    icon: HeartHandshake,
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
    paperClass:
      'bg-gradient-to-br from-[#fffdf8] to-rose-50 border-rose-200/80 hover:border-rose-300 dark:from-slate-900 dark:to-rose-950/40 dark:border-rose-900 dark:hover:border-rose-700',
    accentClass: 'bg-rose-300 dark:bg-rose-600',
  },
};

export const getMoodConfig = (mood?: string): MoodConfig => {
  const key = mood?.toLowerCase() as Mood | undefined;
  return key && key in MOODS ? MOODS[key] : MOODS.neutral;
};