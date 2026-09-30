'use client';

import { Letter } from '@/types/letter';
import { 
  Sparkles, 
  Feather, 
  BookOpen, 
  Clock, 
  CloudRain, 
  HeartHandshake 
} from 'lucide-react';

interface LetterCardProps {
  letter: Letter;
  onClick?: () => void;
}

// ✅ Idinagdag ang getMoodConfig para sa consistent na styling at icon ng bawat mood (kasama ang neutral)
const getMoodConfig = (moodString?: string) => {
  const normalized = moodString?.toLowerCase() || 'neutral';
  switch (normalized) {
    case 'neutral':
      return { label: 'Neutral', icon: Sparkles, badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/50' };
    case 'peaceful':
      return { label: 'Peaceful', icon: Feather, badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/50' };
    case 'reflective':
      return { label: 'Reflective', icon: BookOpen, badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/50' };
    case 'nostalgic':
      return { label: 'Nostalgic', icon: Clock, badgeClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/50' };
    case 'heavy':
      return { label: 'Heavy', icon: CloudRain, badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/50' };
    case 'hopeful':
      return { label: 'Hopeful', icon: HeartHandshake, badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/50' };
    default:
      return { label: 'Neutral', icon: Sparkles, badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/50' };
  }
};

export default function LetterCard({ letter, onClick }: LetterCardProps) {
  const isSealed = letter.status === 'sealed';

  // Kunin ang config base sa mood ng letter (o mag-fallback sa neutral kapag wala)
  const moodCfg = getMoodConfig(letter.mood);
  const MoodIcon = moodCfg.icon;

  // Prevent opening sealed letters
  const handleClick = () => {
    if (isSealed) return;
    onClick?.();
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-5 rounded-lg border border-[var(--border)] bg-[var(--card)] transition-all shadow-sm ${
        isSealed 
          ? 'opacity-75 cursor-not-allowed' 
          : 'hover:border-[var(--primary)] hover:shadow-md cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-[var(--foreground)]">
          {letter.title || 'Untitled Letter'}
        </h3>
        
        {/* ✅ Ginamit na ang moodConfig para lumitaw ang tamang badge at icon kahit neutral o walang mood */}
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${moodCfg.badgeClass}`}>
          <MoodIcon className="w-3.5 h-3.5" />
          {moodCfg.label}
        </span>
      </div>

      {/* Hide content preview if sealed */}
      <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 mb-4 leading-relaxed">
        {isSealed ? 'This letter is sealed until its specified date.' : letter.content}
      </p>

      {/* Card footer details */}
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3">
        <span>
          {isSealed && letter.sealUntil
            ? `Sealed until ${new Date(letter.sealUntil).toLocaleDateString()}`
            : new Date(letter.createdAt).toLocaleDateString()}
        </span>
        <span className="capitalize font-medium text-[var(--primary)]">
          {letter.status}
        </span>
      </div>
    </div>
  );
}