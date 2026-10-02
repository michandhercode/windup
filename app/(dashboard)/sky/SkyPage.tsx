'use client';

import { useState, useEffect } from 'react';
import { Heart, CheckCircle2, FoldHorizontal, UserCheck } from 'lucide-react';
import { useLetters } from '@/app/providers';
import { ALL_MOCK_POOL, isPublicPlane } from '@/lib/sky-planes';
import ViewLetterModal, { LetterModalAction } from '@/components/ViewLetterModal';
import { formatLetterDate } from '@/lib/format';

const PLANES_PER_CATCH = 7;

// Scatter helper: jittered 4x2 grid (8 cells), 7 cells picked at random
const buildRandomLayout = (count: number) => {
  const cells = Array.from({ length: 8 }, (_, i) => ({ col: i % 4, row: Math.floor(i / 4) }))
    .sort(() => 0.5 - Math.random())
    .slice(0, count);

  return cells.map(({ col, row }) => ({
    left: `${col * 21 + 1 + Math.random() * 6}%`,
    top: `${row * 40 + 4 + Math.random() * 16}%`,
    duration: `${(5 + Math.random() * 3.5).toFixed(1)}s`,
    delay: `${(Math.random() * 2).toFixed(1)}s`,
  }));
};

export default function SkyPage() {
  const { letters } = useLetters();
  const [selectedPlane, setSelectedPlane] = useState<any | null>(null);
  const [liked, setLiked] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<any[]>([]);
  
  const [readPlaneIds, setReadPlaneIds] = useState<string[]>([]);

  useEffect(() => {
    const savedReads = localStorage.getItem('sky_read_planes');
    if (savedReads) {
      try {
        setReadPlaneIds(JSON.parse(savedReads));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const userLettersFormatted = letters
    .filter(isPublicPlane)
    .map((l) => ({
      id: l.id,
      title: l.title || 'Untitled Thought',
      content: l.content,
      mood: l.mood || 'peaceful',
      likes: (l as any).likes || 5,
      createdAt: (l as any).createdAt || new Date().toISOString(),
      isUserOwner: true,
    }));

  const masterPool = [...userLettersFormatted, ...ALL_MOCK_POOL];
  const totalPlanesCount = masterPool.length;
  
  const todayStr = new Date().toDateString();
  const newTodayCount = masterPool.filter((p) => {
    try {
      return new Date(p.createdAt).toDateString() === todayStr;
    } catch {
      return false;
    }
  }).length;

  const getRandomBatch = () => {
    const shuffled = [...masterPool].sort(() => 0.5 - Math.random()).slice(0, PLANES_PER_CATCH);
    const layout = buildRandomLayout(shuffled.length);
    return shuffled.map((plane, i) => ({ ...plane, ...layout[i] }));
  };

  useEffect(() => {
    setCurrentBatch(getRandomBatch());
  }, [letters]);

  const handleCatchMore = () => {
    setCurrentBatch(getRandomBatch());
  };

  const handleOpenPlane = (plane: any) => {
    setSelectedPlane(plane);
    setLiked(false);

    if (!readPlaneIds.includes(plane.id)) {
      const updatedReads = [...readPlaneIds, plane.id];
      setReadPlaneIds(updatedReads);
      localStorage.setItem('sky_read_planes', JSON.stringify(updatedReads));
    }
  };

  const activePlanes = currentBatch.map((plane) => ({
    ...plane,
    isRead: readPlaneIds.includes(plane.id),
  }));

  return (
    <div className="relative w-full min-h-[calc(100dvh-65px)] overflow-hidden flex flex-col items-center justify-between p-4 sm:p-6">

      {/* Full-viewport sky background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-[url('/sky_bg/daysky.webp')] dark:bg-[url('/sky_bg/nightsky.webp')] bg-cover bg-center bg-no-repeat bg-sky-200 dark:bg-slate-900"
      />

      {/* Semi-transparent Glassy Pastel Header Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/60 dark:border-slate-800/60 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <img
                src="/logo_and_icons/sky_icon.webp"
                alt=""
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 select-none"
                draggable={false}
              />
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                The Sky
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-sky-100/60 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/40">
                Public Ocean
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              A collection of paper planes drifting softly through the open sky.
            </p>
          </div>

          {/* Catch More Planes Button */}
          <button 
            onClick={handleCatchMore}
            className="px-4 py-2 rounded-2xl bg-amber-100/60 hover:bg-amber-200/70 text-amber-950 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 dark:text-amber-200 text-xs font-semibold border border-amber-200/60 dark:border-slate-700/60 shadow-2xs hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            Catch More Planes
          </button>
        </div>

        {/* Bottom Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/40 dark:border-slate-800/50 text-xs">
          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 ring-2 ring-white/60 dark:ring-slate-800 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              Unread
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-3 w-3 items-center justify-center rounded-full bg-slate-400/80 text-white ring-2 ring-white/60 dark:ring-slate-800">
                <CheckCircle2 className="h-2 w-2" />
              </span>
              Read
            </span>
          </div>

          {/* Pastel Stats */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-sky-100/50 dark:bg-slate-800/50 text-sky-900 dark:text-sky-300 border border-sky-200/50 dark:border-slate-700/50 text-[11px] font-medium">
              Total: <strong className="font-bold">{totalPlanesCount}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 text-[11px] font-medium">
              New Today: <strong className="font-bold">+{newTodayCount}</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Planes Floating Sky Area */}
      <div className="relative z-10 w-full flex-1 min-h-[420px]">
        {activePlanes.map((plane) => {
          return (
            <div
              key={plane.id}
              className="absolute animate-float"
              style={{
                top: plane.top,
                left: plane.left,
                animationDuration: plane.duration,
                animationDelay: plane.delay,
              }}
            >
              <button
                type="button"
                onClick={() => handleOpenPlane(plane)}
                title={plane.title}
                aria-label={`${plane.isUserOwner ? 'Your paper plane' : 'Paper plane'}: ${plane.title} (${plane.isRead ? 'read' : 'unread'})`}
                className="relative block cursor-pointer bg-transparent border-0 p-0 transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 rounded-2xl"
              >
                <img
                  src={plane.isUserOwner ? '/logo_and_icons/my_plane.webp' : '/logo_and_icons/users_plane.webp'}
                  alt={plane.isUserOwner ? 'Your paper plane' : 'Paper plane'}
                  draggable={false}
                  className={`w-24 h-24 sm:w-32 sm:h-32 object-contain select-none transition-all duration-300 ${
                    plane.isRead
                      ? 'opacity-60 saturate-50 drop-shadow-md'
                      : 'opacity-100 drop-shadow-[0_0_14px_rgba(255,255,255,0.95)]'
                  }`}
                />

                {/* Read / unread indicator */}
                {plane.isRead ? (
                  <span className="absolute top-3 right-3 sm:top-4 sm:right-4 flex h-5 w-5 items-center justify-center rounded-full bg-slate-400 text-white shadow-sm ring-2 ring-white/70">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 sm:top-4 sm:right-4 flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white/90 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </span>
                )}

                {/* Ownership marker */}
                {plane.isUserOwner && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-sm border border-indigo-300">
                    <UserCheck className="w-3 h-3" />
                    You
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-12px) translateX(6px); }
        }
        .animate-float { animation: float infinite ease-in-out; }
      `}</style>

      {/* Shared letter viewer */}
      <ViewLetterModal
        letter={
          selectedPlane && {
            title: selectedPlane.title,
            content: selectedPlane.content,
            mood: selectedPlane.mood,
            dateLabel: formatLetterDate(selectedPlane.createdAt),
          }
        }
        onClose={() => setSelectedPlane(null)}
        byline={
          selectedPlane?.isUserOwner ? (
            <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
              <UserCheck className="w-3.5 h-3.5" /> Your Letter
            </span>
          ) : (
            'Anonymous Plane'
          )
        }
        actions={(requestClose) =>
          selectedPlane && (
            <>
              <LetterModalAction
                tone="rose"
                active={liked}
                icon={<Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />}
                onClick={() => setLiked(!liked)}
              >
                Like ({selectedPlane.likes + (liked ? 1 : 0)})
              </LetterModalAction>
              <LetterModalAction icon={<FoldHorizontal className="w-4 h-4" />} onClick={requestClose}>
                Refold Plane
              </LetterModalAction>
            </>
          )
        }
      />

    </div>
  );
}