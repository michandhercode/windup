'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { Mail, MailOpen } from 'lucide-react';
import {
  changeThoughtStatus,
  getSealedCapsules,
  getUserJarThoughts,
  type SealedCapsule,
} from '@/app/actions/thoughts';
import { thoughtToLetter } from '@/lib/thoughts';
import { useNow } from '@/lib/hooks/useNow';
import { useIsClient } from '@/lib/hooks/useLocalStorage';
import { formatLetterDate } from '@/lib/format';
import { useToast } from '@/components/Toast';
import SealedOpenConfirm from '@/components/SealedOpenConfirm';
import ViewLetterModal from '@/components/ViewLetterModal';
import type { Letter } from '@/types/letter';

/** Header mail: lists sealed time capsules whose unlock date has arrived and opens them like a real letter. */
export default function MailButton() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const isClient = useIsClient();
  const now = useNow(); // ticks every 30s, so the dot appears the moment a capsule unlocks
  const rootRef = useRef<HTMLDivElement>(null);

  const [capsules, setCapsules] = useState<SealedCapsule[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<SealedCapsule | null>(null);
  const [viewing, setViewing] = useState<Letter | null>(null);

  // status === 'sealed' is guaranteed by the query; the date check runs here against the live clock
  const ready = capsules.filter((c) => new Date(c.sealUntil).getTime() <= now);

  const refresh = useCallback(async () => {
    try {
      setCapsules(await getSealedCapsules());
    } catch (error) {
      console.error('Could not load time capsules', error);
    }
  }, []);

  // Load on mount and after every page change
  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  // Close the popover on outside click / ESC
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const toggle = () => {
    if (!isOpen) void refresh();
    setIsOpen((open) => !open);
  };

  const startUnseal = (capsule: SealedCapsule) => {
    setIsOpen(false);
    setTarget(capsule);
  };

  /** Moves the capsule to Kept, then opens the full letter right away (like clicking a card in the Jar). */
  const confirmUnseal = async () => {
    if (!target) return;
    const capsule = target;
    setTarget(null);
    try {
      // Load the letter and update its status together, so the reader opens without a second wait
      const [result, rows] = await Promise.all([
        changeThoughtStatus(capsule.id, 'folded'),
        getUserJarThoughts(),
      ]);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setCapsules((prev) => prev.filter((c) => c.id !== capsule.id));
      router.refresh();

      const row = rows.find((r) => r.id === capsule.id);
      if (row) {
        setViewing({ ...thoughtToLetter(row), status: 'kept' });
      } else {
        toast.success('Letter opened and moved to your Kept shelf.');
      }
    } catch (error) {
      console.error(error);
      toast.error('We could not open this letter. Please try again.');
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={ready.length > 0 ? `Mail, ${ready.length} ready to open` : 'Mail'}
        title="Mail"
        className="relative p-2 rounded-full bg-rose-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100/70 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-rose-100/60 dark:border-transparent"
      >
        {ready.length > 0 ? <MailOpen className="w-4 h-4 text-rose-500 dark:text-rose-300" /> : <Mail className="w-4 h-4" />}
        {ready.length > 0 && (
          <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#fbf9f5] dark:ring-slate-900" />
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Time capsule mail"
          className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-4 py-2.5 border-b border-rose-50 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Mail</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Time capsules ready to open</p>
          </div>

          {ready.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <Mail className="w-5 h-5 mx-auto mb-2 text-rose-300 dark:text-slate-600" />
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                No time capsules are ready to open right now. Check back later!
              </p>
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto overscroll-contain p-1.5 space-y-1">
              {ready.map((capsule) => (
                <li
                  key={capsule.id}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-rose-50/70 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">
                      {capsule.title?.trim() || 'Untitled Letter'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Unlocked {formatLetterDate(capsule.sealUntil)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startUnseal(capsule)}
                    className="shrink-0 cursor-pointer rounded-full bg-rose-400 hover:bg-rose-500 px-3 py-1 text-[11px] font-bold text-white transition-all active:scale-95"
                  >
                    Unseal
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Rendered on <body>: the blurred sticky header would otherwise trap these fixed, full-screen modals */}
      {isClient &&
        createPortal(
          <>
            <SealedOpenConfirm
              isOpen={!!target}
              onClose={() => setTarget(null)}
              onConfirm={() => void confirmUnseal()}
            />
            <ViewLetterModal
              letter={
                viewing && {
                  title: viewing.title,
                  content: viewing.content,
                  mood: viewing.mood,
                  dateLabel: formatLetterDate(viewing.createdAt),
                }
              }
              onClose={() => setViewing(null)}
            />
          </>,
          document.body
        )}
    </div>
  );
}