'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Calendar } from 'lucide-react';
import { getMoodConfig } from '@/lib/mood';

export interface ViewableLetter {
  title?: string;
  content: string;
  mood?: string;
  /** Already-formatted date string, e.g. "Oct 2, 2026" */
  dateLabel?: string;
}

interface ViewLetterModalProps {
  /** Pass `null` to keep the modal closed. */
  letter: ViewableLetter | null;
  onClose: () => void;
  /** Small line under the title, e.g. "Your letter" / "Anonymous plane". */
  byline?: ReactNode;
  /** Page-specific actions, rendered on the left of the footer. Can be a function to get the animated close handler. */
  actions?: ReactNode | ((requestClose: () => void) => ReactNode);
  /**
   * Show the footer "Close" button (default true). Pages whose own action already dismisses the
   * modal (e.g. The Sky's "Refold Plane") pass `false`. Backdrop click and ESC always close.
   */
  showCloseButton?: boolean;
}

/**
 * The single "read a letter" popup used by My Jar, The Sky and Sent Planes.
 * Layout: [date | mood] -> title -> scrollable letter -> [page actions | optional Close]
 */
export default function ViewLetterModal({ letter, onClose, byline, actions, showCloseButton = true }: ViewLetterModalProps) {
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpen = !!letter;

  const requestClose = useCallback(() => {
    if (timerRef.current) return;
    setClosing(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setClosing(false);
      onClose();
    }, 180);
  }, [onClose]);

  // ESC to close + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      // Let a confirmation dialog stacked on top handle ESC first
      if (e.key === 'Escape' && !document.querySelector('[role="alertdialog"]')) requestClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, requestClose]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  if (!letter) return null;

  const mood = getMoodConfig(letter.mood);
  const MoodIcon = mood.icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200 ${
        closing ? 'opacity-0' : 'animate-in fade-in duration-150'
      }`}
      onClick={requestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-letter-title"
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[88dvh] w-[92vw] max-w-2xl flex-col overflow-hidden rounded-3xl border shadow-2xl transition-all duration-200 ${mood.paperClass} ${
          closing ? 'scale-95 opacity-0' : 'animate-in zoom-in-95 duration-150'
        }`}
      >
        {/* Margin-line accent */}
        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${mood.accentClass}`} />

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 pl-6 sm:p-8 sm:pl-10 [@media(max-height:480px)]:gap-2 [@media(max-height:480px)]:py-3">
          {/* Header: date + mood */}
          <div className="flex shrink-0 items-center justify-between gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              {letter.dateLabel || '—'}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${mood.badgeClass}`}>
              <MoodIcon className="h-3.5 w-3.5" />
              {mood.label}
            </span>
          </div>

          {/* Title */}
          <div className="shrink-0 space-y-1">
            <h2 id="view-letter-title" className="font-serif text-xl font-bold leading-snug text-slate-900 dark:text-slate-50 sm:text-2xl">
              {letter.title || 'Untitled Letter'}
            </h2>
            {byline && <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{byline}</div>}
          </div>

          {/* Letter body */}
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain border-y border-dashed border-slate-300/70 py-4 pr-2 sm:py-5 [@media(max-height:480px)]:py-2 dark:border-slate-700">
            <p className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 sm:text-base">
              {letter.content}
            </p>
          </div>

          {/* Footer: page actions + optional Close */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {typeof actions === 'function' ? actions(requestClose) : actions}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={requestClose}
                className="max-sm:w-full sm:ml-auto cursor-pointer rounded-xl bg-slate-800 px-6 py-2.5 sm:py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 active:scale-95 dark:bg-slate-100 dark:text-slate-900"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Shared action buttons for the modal footer ---------- */

type ActionTone = 'neutral' | 'sky' | 'blue' | 'rose';

const TONES: Record<ActionTone, string> = {
  neutral: 'bg-white/70 text-slate-700 border-slate-200 hover:bg-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
  sky: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800 dark:hover:bg-sky-900',
  blue: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800 dark:hover:bg-blue-900',
  rose: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800 dark:hover:bg-rose-900',
};

const ACTION_BASE = 'inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 sm:py-2 text-xs font-semibold transition-all';

interface LetterModalActionProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  tone?: ActionTone;
  /** Filled state (e.g. a liked heart) */
  active?: boolean;
}

export function LetterModalAction({ icon, children, onClick, tone = 'neutral', active = false }: LetterModalActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${ACTION_BASE} cursor-pointer active:scale-95 ${
        active ? 'border-rose-500 bg-rose-500 text-white hover:bg-rose-600 dark:border-rose-500 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-600' : TONES[tone]
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

/** Non-interactive stat pill (e.g. "12 Resonated") with the same footprint as an action. */
export function LetterModalChip({ icon, children, tone = 'rose' }: { icon?: ReactNode; children: ReactNode; tone?: ActionTone }) {
  return (
    <span className={`${ACTION_BASE} ${TONES[tone]}`}>
      {icon}
      {children}
    </span>
  );
}