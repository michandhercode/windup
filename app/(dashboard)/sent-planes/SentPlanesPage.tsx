'use client';

import { useState } from 'react';
import { Calendar, Heart, Trash2, BookmarkCheck } from 'lucide-react';
import { useLetters } from '@/app/providers';
import AlertModal, { type AlertVariant } from '@/components/AlertModal';
import { getMoodConfig } from '@/lib/mood';
import ViewLetterModal, { LetterModalAction, LetterModalChip } from '@/components/ViewLetterModal';

export default function SentPlanesPage() {
  const { letters, setLetters } = useLetters();
  const [selectedPlane, setSelectedPlane] = useState<any | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: AlertVariant;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'primary',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  const sentPlanes = letters
    .filter((l) => l.visibility === 'anonymous_public' || l.status === 'released')
    .map((l) => ({
      id: l.id,
      title: l.title || 'Untitled Thought',
      content: l.content,
      mood: l.mood || 'peaceful',
      resonated: (l as any).resonated || (l as any).likes || 12,
      createdAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sep 28, 2026',
    }));

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: 'Recall Paper Plane',
      message: 'Are you sure you want to recall/delete this paper plane from the sky?',
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: () => {
        if (setLetters) {
          setLetters(letters.filter((l) => l.id !== id));
        }
        if (selectedPlane?.id === id) setSelectedPlane(null);
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleKeepInJar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: 'Keep in Jar',
      message: 'Move this plane back to your private jar? It will no longer be visible in the public sky.',
      variant: 'primary',
      confirmLabel: 'Keep in Jar',
      onConfirm: () => {
        if (setLetters) {
          setLetters(
            letters.map((l) => 
              l.id === id 
                ? { ...l, visibility: 'private', status: 'kept', isKept: true } 
                : l
            )
          );
        }
        if (selectedPlane?.id === id) setSelectedPlane(null);
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const totalResonated = sentPlanes.reduce((acc, item) => acc + item.resonated, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      
      {/* Header Banner - Sky Theme (Matched exact structure with FoldPage) */}
      <div className="p-6 rounded-3xl border border-sky-200/60 dark:border-sky-900/40 bg-sky-50/40 dark:bg-sky-950/20 text-slate-800 dark:text-slate-100 shadow-xs transition-colors duration-200 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
          <img
            src="/logo_and_icons/sentplanes_icon.webp"
            alt="Sent Planes"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 drop-shadow-md select-none"
            draggable={false}
          />
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-300/40 text-sky-700 dark:text-sky-300 text-[10px] font-bold tracking-wide uppercase">
              Your Public Echoes
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Sent Planes
            </h1>
            <p className="text-xs font-medium max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
              A record of anonymous paper planes you have released into the sky. Softly resonating with strangers around the world.
            </p>
          </div>
        </div>

        {/* Header Stats Counter */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-slate-800 backdrop-blur-xs flex items-center gap-3 shadow-xs">
            <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <img src="/logo_and_icons/my_plane.webp" alt="" className="w-4 h-4 object-contain" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Sent</div>
              <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{sentPlanes.length}</div>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-slate-800 backdrop-blur-xs flex items-center gap-3 shadow-xs">
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resonated</div>
              <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{totalResonated}</div>
            </div>
          </div>
        </div>
      </div>

      {sentPlanes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sentPlanes.map((plane) => {
            const cfg = getMoodConfig(plane.mood);
            const MoodIcon = cfg.icon;

            return (
              <article
                key={plane.id}
                onClick={() => setSelectedPlane(plane)}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-xs transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${cfg.paperClass}`}
              >
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${cfg.accentClass}`} />

                <div className="flex flex-1 flex-col gap-3 p-5 pl-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.badgeClass}`}>
                      <MoodIcon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {plane.createdAt}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="line-clamp-1 font-serif text-base font-semibold leading-snug text-slate-900 dark:text-slate-50">
                      {plane.title}
                    </h3>
                    <p className="line-clamp-4 font-serif text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {plane.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-dashed border-slate-300/70 pt-3 dark:border-slate-700">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
                      <Heart className="h-3.5 w-3.5 fill-current" />
                      {plane.resonated} Resonated
                    </span>

                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleKeepInJar(plane.id, e)}
                        title="Keep in Jar (Make Private)"
                        className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-white/10"
                      >
                        <BookmarkCheck className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(plane.id, e)}
                        title="Recall / Delete Plane"
                        className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-sky-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-3 bg-sky-50/30 dark:bg-slate-900/30">
          <img
            src="/logo_and_icons/plane_empty.webp"
            alt=""
            className="w-20 h-20 object-contain select-none opacity-90 transition-transform duration-300 hover:scale-110 hover:-translate-y-1"
            draggable={false}
          />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No sent paper planes yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Fold a new thought and release it into the sky to start resonating with others!
            </p>
          </div>
        </div>
      )}

      {/* Shared letter viewer */}
      <ViewLetterModal
        letter={
          selectedPlane && {
            title: selectedPlane.title,
            content: selectedPlane.content,
            mood: selectedPlane.mood,
            dateLabel: selectedPlane.createdAt,
          }
        }
        onClose={() => setSelectedPlane(null)}
        actions={
          selectedPlane && (
            <>
              <LetterModalChip icon={<Heart className="w-4 h-4 fill-current" />}>
                {selectedPlane.resonated} Resonated
              </LetterModalChip>
              <LetterModalAction
                tone="sky"
                icon={<BookmarkCheck className="w-4 h-4" />}
                onClick={(e) => handleKeepInJar(selectedPlane.id, e)}
              >
                Keep in Jar
              </LetterModalAction>
            </>
          )
        }
      />

      {/* Confirmation Dialog */}
      <AlertModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        title={confirmConfig.title}
        subtitle="Confirmation required"
        icon={confirmConfig.variant === 'destructive' ? Trash2 : BookmarkCheck}
        variant={confirmConfig.variant}
        confirmLabel={confirmConfig.confirmLabel}
        onConfirm={confirmConfig.onConfirm}
        description={confirmConfig.message}
      />

    </div>
  );
}