'use client';

import { MailOpen } from 'lucide-react';
import type { Letter } from '@/types/letter';
import { useNow } from '@/lib/hooks/useNow';

interface SealedReadyBannerProps {
  /** The user's private jar letters */
  letters: Letter[];
  /** Called with the letter to unseal (the parent shows its confirmation modal) */
  onOpen: (letter: Letter) => void;
}

/**
 * Slim, centered in-app notice for sealed time capsules that have reached their unlock date.
 * Re-checks every 30s (via useNow) and disappears once the letter is opened (status becomes "kept").
 */
export default function SealedReadyBanner({ letters, onOpen }: SealedReadyBannerProps) {
  const now = useNow();

  // Oldest unlock first, so the capsule that has been waiting longest is offered first
  const ready = letters
    .filter((l) => l.status === 'sealed' && !!l.sealUntil && new Date(l.sealUntil).getTime() <= now)
    .sort((a, b) => new Date(a.sealUntil!).getTime() - new Date(b.sealUntil!).getTime());

  if (ready.length === 0) return null;

  const first = ready[0];
  const title = first.title?.trim() || 'Untitled Letter';

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-xl items-center gap-2.5 rounded-2xl border border-amber-300/60 bg-amber-50/70 py-1.5 pl-3 pr-1.5 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <MailOpen className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-300" />

      <p className="min-w-0 flex-1 truncate font-medium">
        {ready.length === 1 ? (
          <>
            1 sealed time capsule (<span className="font-serif italic">&ldquo;{title}&rdquo;</span>) is ready to open
          </>
        ) : (
          <>{ready.length} sealed time capsules are ready to open</>
        )}
      </p>

      <button
        type="button"
        onClick={() => onOpen(first)}
        className="shrink-0 cursor-pointer rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-white transition-all hover:bg-amber-600 active:scale-95 dark:text-amber-950 dark:hover:bg-amber-400"
      >
        Unseal
      </button>
    </div>
  );
}