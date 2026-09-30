'use client';

import { Letter } from '@/types/letter';
import { 
  Sparkles, 
  Feather, 
  BookOpen, 
  Clock, 
  CloudRain, 
  HeartHandshake,
  Lock,
  Calendar,
  Send,
  Edit3,
  Trash2,
  Eye
} from 'lucide-react';

interface LetterCardProps {
  letter: Letter;
  onClick?: () => void;
  onRelease?: (letter: Letter, e: React.MouseEvent) => void;
  onEdit?: (letter: Letter, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

const getMoodConfig = (moodString?: string) => {
  const normalized = moodString?.toLowerCase() || 'neutral';
  switch (normalized) {
    case 'neutral':
      return { label: 'Neutral', icon: Sparkles, badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/40' };
    case 'peaceful':
      return { label: 'Peaceful', icon: Feather, badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/40' };
    case 'reflective':
      return { label: 'Reflective', icon: BookOpen, badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/40' };
    case 'nostalgic':
      return { label: 'Nostalgic', icon: Clock, badgeClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/40' };
    case 'heavy':
      return { label: 'Heavy', icon: CloudRain, badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/40' };
    case 'hopeful':
      return { label: 'Hopeful', icon: HeartHandshake, badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/40' };
    default:
      return { label: 'Neutral', icon: Sparkles, badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/40' };
  }
};

export default function LetterCard({ letter, onClick, onRelease, onEdit, onDelete }: LetterCardProps) {
  const isSealed = letter.status === 'sealed';
  const isNotYetUnlocked = isSealed && letter.sealUntil && new Date().getTime() < new Date(letter.sealUntil).getTime();

  const moodCfg = getMoodConfig(letter.mood);
  const MoodIcon = moodCfg.icon;

  const handleClick = () => {
    if (isNotYetUnlocked) return;
    onClick?.();
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      onClick={handleClick}
      className={`group relative p-6 rounded-3xl border transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 bg-gradient-to-b from-[var(--card)] to-[var(--card)]/60 ${
        isNotYetUnlocked 
          ? 'border-amber-500/30 shadow-amber-500/5 opacity-95 cursor-not-allowed' 
          : 'border-[var(--border)] hover:border-[var(--primary)] hover:shadow-xl cursor-pointer hover:-translate-y-0.5'
      }`}
    >
      {/* Top Header: Mood Badge & Dates Info */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${moodCfg.badgeClass}`}>
          <MoodIcon className="w-3.5 h-3.5" />
          {moodCfg.label}
        </span>

        {/* Dates Section (Created Date & Seal/Unlock Date) */}
        <div className="flex flex-col items-end text-[11px] text-slate-400 dark:text-slate-500 font-medium space-y-0.5">
          {/* Created Date */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Created: {formatDate(letter.createdAt)}</span>
          </div>

          {/* Unlock / Seal Date kung sealed man */}
          {isNotYetUnlocked && letter.sealUntil && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              <Lock className="w-3 h-3" />
              <span>Unlocks: {formatDate(letter.sealUntil)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Details */}
      <div className="space-y-2 flex-1">
        <h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors flex items-center gap-2">
          {isNotYetUnlocked && <Lock className="w-4 h-4 text-amber-500 shrink-0" />}
          <span>{letter.title || 'Untitled Letter'}</span>
        </h3>
        
        {/* Kung sealed at hindi pa pwedeng buksan, lock message ang ipapakita sa halip na preview */}
        {isNotYetUnlocked ? (
          <div className="py-4 px-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-700/80 dark:text-amber-300/80 text-xs italic flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            <span>This letter is safely locked in the jar. It will unlock on {formatDate(letter.sealUntil)}.</span>
          </div>
        ) : (
          <p className="text-xs font-serif italic leading-relaxed text-[var(--muted-foreground)] line-clamp-3">
            "{letter.content}"
          </p>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-[var(--border)]/60 flex items-center justify-between">
        {/* Release Button kung available */}
        {((letter.status === 'kept' || letter.status === 'sealed') && !isNotYetUnlocked && onRelease) ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRelease(letter, e);
            }}
            title="Release to Sky"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-300/40 text-xs font-semibold hover:bg-sky-500/20 active:scale-95 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Release</span>
          </button>
        ) : (
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-600">
            {letter.status}
          </span>
        )}

        {/* Action Buttons (View, Edit, Delete) */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isNotYetUnlocked ? (
            <div className="p-2 rounded-xl text-amber-500 bg-amber-500/10 border border-amber-500/20" title="Locked until set date">
              <Lock className="w-4 h-4" />
            </div>
          ) : (
            <button
              onClick={() => onClick?.()}
              title="View Letter"
              className="p-2 rounded-xl text-slate-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {letter.status === 'draft' && onEdit && (
            <button
              onClick={(e) => onEdit(letter, e)}
              title="Edit Draft"
              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => onDelete(letter.id, e)}
              title="Delete Letter"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}