'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/app/providers';
import { Letter, LetterStatus } from '@/types/letter';
import { DAILY_LIMIT_MESSAGE, getDailyReleaseStatus, tryConsumeDailyRelease } from '@/lib/daily-release';
import AlertModal from '@/components/AlertModal';
import LetterCard from '@/components/LetterCard';
import SealedOpenConfirm from '@/components/SealedOpenConfirm';
import ViewLetterModal, { LetterModalAction } from '@/components/ViewLetterModal';
import { formatLetterDate } from '@/lib/format';
import { Box, Edit3, Trash2, AlertTriangle, Send, PenLine } from 'lucide-react';

const isReleasable = (l: Letter) => l.status === 'kept' || l.status === 'sealed' || l.status === 'opened';

const isStillLocked = (l: Letter) =>
  l.status === 'sealed' && !!l.sealUntil && Date.now() < new Date(l.sealUntil).getTime();

const SHELVES: {
  id: 'all' | LetterStatus;
  label: string;
  hint: string;
  icon: string;
  active: string;
}[] = [
  { id: 'all', label: 'All Entries', hint: 'Full collection', icon: 'jar_entries', active: 'bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-200' },
  { id: 'draft', label: 'Drafts', hint: 'Unfinished reflections', icon: 'jar_draft', active: 'bg-blue-500/15 border-blue-500/40 text-blue-900 dark:text-blue-200' },
  { id: 'kept', label: 'Kept', hint: 'Safely stored entries', icon: 'jar_kept', active: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200' },
  { id: 'sealed', label: 'Sealed', hint: 'Locked time-capsules', icon: 'jar_seal', active: 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200' },
];

export default function JarPage() {
  const router = useRouter();
  const { letters, setLetters, displayName } = useLetters();
  
  const [filter, setFilter] = useState<'all' | LetterStatus>('all');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [letterToDelete, setLetterToDelete] = useState<string | null>(null);
  const [letterToRelease, setLetterToRelease] = useState<Letter | null>(null);
  const [letterToOpen, setLetterToOpen] = useState<Letter | null>(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [animatingLetterId, setAnimatingLetterId] = useState<string | null>(null);

  const privateJarLetters = letters.filter((l: Letter) => l.visibility !== 'anonymous_public' && l.status !== 'released');

  const filteredLetters = privateJarLetters.filter((letter: Letter) => {
    if (filter === 'all') return true;
    return letter.status === filter;
  });

  const countByStatus = (status: 'all' | LetterStatus) => {
    if (status === 'all') return privateJarLetters.length;
    return privateJarLetters.filter((l: Letter) => l.status === status).length;
  };

  const confirmDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLetterToDelete(id);
  };

  const handleDelete = () => {
    if (letterToDelete) {
      setLetters(letters.filter((l: Letter) => l.id !== letterToDelete));
      if (selectedLetter?.id === letterToDelete) setSelectedLetter(null);
      setLetterToDelete(null);
    }
  };

  const handleCardClick = (letter: Letter) => {
    if (isStillLocked(letter)) return;

    // Sealed letters whose date has arrived need an explicit confirmation first
    if (letter.status === 'sealed') {
      setLetterToOpen(letter);
      return;
    }

    setSelectedLetter(letter);
  };

  const handleConfirmOpen = () => {
    if (!letterToOpen) return;
    const opened: Letter = { ...letterToOpen, status: 'opened' };
    setLetters(letters.map((l: Letter) => (l.id === opened.id ? opened : l)));
    setSelectedLetter(opened);
    setLetterToOpen(null);
    // TODO: send the real email notification here (e.g. POST to an email API route)
    // once an email backend is wired up.
  };

  const confirmRelease = (letter: Letter, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Don't ask for confirmation if the daily limit is already used up
    if (getDailyReleaseStatus().isLimitReached) {
      setIsLimitModalOpen(true);
      return;
    }
    setLetterToRelease(letter);
  };

  const handleExecuteRelease = () => {
    if (letterToRelease) {
      const targetId = letterToRelease.id;
      setLetterToRelease(null);

      // Authoritative check + count (also resets the counter on a new calendar day)
      if (!tryConsumeDailyRelease().allowed) {
        setIsLimitModalOpen(true);
        return;
      }

      setAnimatingLetterId(targetId);

      setTimeout(() => {
        setLetters((prev) =>
          prev.map((l) =>
            l.id === targetId
              ? { ...l, visibility: 'anonymous_public' as const, status: 'released' as const }
              : l
          )
        );
        if (selectedLetter?.id === targetId) {
          setSelectedLetter(null);
        }
        setAnimatingLetterId(null);
      }, 700);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[calc(100dvh-65px)] space-y-6 relative">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-3xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 text-slate-800 dark:text-slate-100 shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src="/logo_and_icons/jar_icon.webp"
            alt="Jar"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 drop-shadow-md select-none"
            draggable={false}
          />
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-300/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold tracking-wide uppercase">
              Private Vault
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {displayName ? `${displayName}'s Jar` : 'My Jar'}
            </h1>
            <p className="text-xs font-medium max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
              Your private safe haven for drafts, kept thoughts, and sealed time-capsules. Select a category from your shelf to browse.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar - The Memory Shelf */}
        <div 
          className="lg:col-span-4 rounded-3xl border p-4 sm:p-5 space-y-4 shadow-xs transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderColor: 'var(--card-border)', 
            color: 'var(--text-main)' 
          }}
        >
          {/* Shelf Header with subtle inline button */}
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase opacity-80">The Memory Shelf</h2>
            </div>

            {/* Small Compact Button */}
            <button
              type="button"
              onClick={() => router.push('/fold')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 text-[11px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Fold</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 pt-1">
            {SHELVES.map((shelf) => {
              const isActive = filter === shelf.id;
              return (
                <div key={shelf.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setFilter(shelf.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isActive
                        ? `${shelf.active} font-bold shadow-xs`
                        : 'hover:bg-stone-500/5 border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ borderColor: isActive ? undefined : 'var(--card-border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={`/logo_and_icons/${shelf.icon}.webp`} alt="" className="w-12 h-12 object-contain shrink-0 select-none" draggable={false} />
                      <div>
                        <div className="text-xs font-bold">{shelf.label}</div>
                        <div className="text-[10px] opacity-60">{shelf.hint}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-500/10 border border-stone-500/20">
                      {countByStatus(shelf.id)}
                    </span>
                  </button>
                  <div className="h-1 w-full bg-stone-300/40 dark:bg-stone-700/40 rounded-full" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Letters Section */}
        <div className="lg:col-span-8 space-y-4">
          {filteredLetters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredLetters.map((letter: Letter) => (
                <LetterCard
                  key={letter.id}
                  letter={letter}
                  isLeaving={animatingLetterId === letter.id}
                  onClick={() => handleCardClick(letter)}
                  onRelease={(l, e) => confirmRelease(l, e)}
                  onEdit={(l) => router.push(`/fold?draftId=${l.id}`)}
                  onDelete={(id, e) => confirmDelete(id, e)}
                />
              ))}
            </div>
          ) : (
            <div 
              className="rounded-3xl border p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <img
                src="/logo_and_icons/jar_empty.webp"
                alt=""
                className="w-20 h-20 object-contain select-none opacity-90 transition-transform duration-300 hover:scale-110 hover:-translate-y-1 animate-pulse"
                draggable={false}
              />
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                No letters found in this shelf category.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Shared letter viewer */}
      <ViewLetterModal
        letter={
          selectedLetter && {
            title: selectedLetter.title,
            content: selectedLetter.content,
            mood: selectedLetter.mood,
            dateLabel: formatLetterDate(selectedLetter.createdAt),
          }
        }
        onClose={() => setSelectedLetter(null)}
        actions={
          selectedLetter &&
          (selectedLetter.status === 'draft' ? (
            <LetterModalAction
              tone="blue"
              icon={<Edit3 className="w-4 h-4" />}
              onClick={() => router.push(`/fold?draftId=${selectedLetter.id}`)}
            >
              Edit Draft
            </LetterModalAction>
          ) : isReleasable(selectedLetter) ? (
            <LetterModalAction
              tone="sky"
              icon={<img src="/logo_and_icons/my_plane.webp" alt="" className="w-5 h-5 object-contain" draggable={false} />}
              onClick={(e) => confirmRelease(selectedLetter, e)}
            >
              Release to Sky
            </LetterModalAction>
          ) : null)
        }
      />

      {/* Open Sealed Letter Confirmation (shows logged-in email + notice) */}
      <SealedOpenConfirm
        isOpen={!!letterToOpen}
        onClose={() => setLetterToOpen(null)}
        onConfirm={handleConfirmOpen}
      />

      {/* Release Confirmation */}
      <AlertModal
        isOpen={!!letterToRelease}
        onClose={() => setLetterToRelease(null)}
        title="Release Letter to Sky?"
        subtitle="Confirmation required"
        icon={Send}
        variant="primary"
        confirmLabel="Release"
        confirmIcon={Send}
        onConfirm={handleExecuteRelease}
        description="This will make your letter anonymous and public so it can fly freely in the Sky page for others to see. Do you wish to continue?"
      />

      {/* Daily release limit reached */}
      <AlertModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        title="Daily limit reached"
        subtitle="Planes can fly again tomorrow"
        icon={Send}
        variant="warning"
        cancelLabel="Got it"
        description={DAILY_LIMIT_MESSAGE}
      />

      {/* Delete Confirmation */}
      <AlertModal
        isOpen={!!letterToDelete}
        onClose={() => setLetterToDelete(null)}
        title="Delete Letter?"
        subtitle="This cannot be undone"
        icon={AlertTriangle}
        variant="destructive"
        confirmLabel="Delete"
        confirmIcon={Trash2}
        onConfirm={handleDelete}
        description="Are you sure you want to delete this letter from your jar? This action cannot be undone."
      />

    </div>
  );
}