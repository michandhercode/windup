'use client';

import { Letter } from '@/types/letter';
import { getMoodConfig } from '@/lib/mood';
import { formatLetterDate } from '@/lib/format';
import { useNow } from '@/lib/hooks/useNow';
import { Lock, Calendar, Edit3, Trash2, Eye, PenLine, BookmarkCheck, MailOpen, Send } from 'lucide-react';

interface LetterCardProps {
  letter: Letter;
  onClick?: () => void;
  onRelease?: (letter: Letter, e: React.MouseEvent) => void;
  onEdit?: (letter: Letter, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  /** Plays the "fly away" animation (used right after releasing to the sky) */
  isLeaving?: boolean;
}

const STATUS_META: Record<string, { label: string; icon: typeof Lock }> = {
  draft: { label: 'Draft', icon: PenLine },
  kept: { label: 'Kept', icon: BookmarkCheck },
  sealed: { label: 'Sealed', icon: Lock },
  opened: { label: 'Opened', icon: MailOpen },
  released: { label: 'Released', icon: Send },
};

const iconBtn =
  'p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors cursor-pointer';

export default function LetterCard({ letter, onClick, onRelease, onEdit, onDelete, isLeaving = false }: LetterCardProps) {
  const now = useNow();
  const isNotYetUnlocked =
    letter.status === 'sealed' && !!letter.sealUntil && now < new Date(letter.sealUntil).getTime();

  const moodCfg = getMoodConfig(letter.mood);
  const MoodIcon = moodCfg.icon;
  const status = STATUS_META[letter.status] ?? STATUS_META.kept;
  const StatusIcon = status.icon;

  const canRelease =
    !!onRelease && !isNotYetUnlocked && (letter.status === 'kept' || letter.status === 'sealed' || letter.status === 'opened');

  const handleClick = () => {
    if (isNotYetUnlocked) return;
    onClick?.();
  };

  return (
    <article
      onClick={handleClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-xs transition-all duration-300 ${moodCfg.paperClass} ${
        isNotYetUnlocked ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
      } ${isLeaving ? '-translate-y-12 scale-95 opacity-0 pointer-events-none duration-700' : ''}`}
    >
      {/* Margin-line accent */}
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${moodCfg.accentClass}`} />

      <div className="flex flex-1 flex-col gap-3 p-5 pl-6">
        {/* Header: mood badge + status */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${moodCfg.badgeClass}`}>
            <MoodIcon className="h-3.5 w-3.5" />
            {moodCfg.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>

        {/* Title + preview */}
        <div className="flex-1 space-y-2">
          <h3 className="line-clamp-1 font-serif text-base font-semibold leading-snug text-slate-900 dark:text-slate-50">
            {letter.title || 'Untitled Letter'}
          </h3>

          {isNotYetUnlocked ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <Lock className="h-4 w-4 shrink-0 animate-pulse" />
              <span>Safely locked in the jar until {formatLetterDate(letter.sealUntil)}.</span>
            </div>
          ) : (
            <p className="line-clamp-3 font-serif text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
              {letter.content}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatLetterDate(letter.createdAt)}
          </span>
          {isNotYetUnlocked && letter.sealUntil && (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
              <Lock className="h-3 w-3" />
              Unlocks {formatLetterDate(letter.sealUntil)}
            </span>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 border-t border-dashed border-slate-300/70 pt-3 dark:border-slate-700">
          {canRelease ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRelease?.(letter, e);
              }}
              title="Release to Sky"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 py-1 pl-2 pr-3 text-xs font-semibold text-sky-800 transition-all hover:bg-sky-100 active:scale-95 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200 dark:hover:bg-sky-900"
            >
              <img src="/logo_and_icons/my_plane.webp" alt="" className="h-5 w-5 object-contain" draggable={false} />
              <span>Release</span>
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            {isNotYetUnlocked ? (
              <span className="p-2 text-amber-700 dark:text-amber-300" title="Locked until set date">
                <Lock className="h-4 w-4" />
              </span>
            ) : (
              <button type="button" onClick={() => onClick?.()} title="View Letter" className={`${iconBtn} hover:text-sky-700`}>
                <Eye className="h-4 w-4" />
              </button>
            )}

            {letter.status === 'draft' && onEdit && (
              <button type="button" onClick={(e) => onEdit(letter, e)} title="Edit Draft" className={`${iconBtn} hover:text-blue-700`}>
                <Edit3 className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button type="button" onClick={(e) => onDelete(letter.id, e)} title="Delete Letter" className={`${iconBtn} hover:text-rose-700`}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}