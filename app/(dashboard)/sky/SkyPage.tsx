'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
import { Heart, CheckCircle2, FoldHorizontal, UserCheck } from 'lucide-react';
import { useLetters } from '@/app/providers';
import { ALL_MOCK_POOL, isPublicPlane, getPlaneLikes } from '@/lib/sky-planes';
import ViewLetterModal, { LetterModalAction } from '@/components/ViewLetterModal';
import { formatLetterDate } from '@/lib/format';
import { useIsClient, useLocalStorageItem, setLocalStorageItem } from '@/lib/hooks/useLocalStorage';

const PLANES_PER_CATCH = 7;

interface SkyPlane {
  id: string;
  title: string;
  content: string;
  mood: string;
  likes: number;
  createdAt: string;
  isUserOwner: boolean;
}

interface PlanePlacement {
  left: string;
  top: string;
  duration: string;
  delay: string;
}

const READ_PLANES_KEY = 'sky_read_planes';
/** Ids of planes the current reader has liked (per-reader flag, so a like can be toggled off). */
const LIKED_PLANES_KEY = 'sky_liked_planes';
const COMPACT_QUERY = '(max-width: 639px)';

/** Small deterministic PRNG (mulberry32) so the sky is a pure function of its seed. */
const createRandom = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Scatter helper: jittered grid, cells picked at random.
 * Phones (compact) use 2 columns x 4 rows so 96px planes never overlap; larger screens use 4 x 2.
 */
const buildRandomLayout = (count: number, compact: boolean, random: () => number): PlanePlacement[] => {
  const cols = compact ? 2 : 4;
  const rows = compact ? 4 : 2;
  const cells = shuffle(
    Array.from({ length: cols * rows }, (_, i) => ({ col: i % cols, row: Math.floor(i / cols) })),
    random
  ).slice(0, count);

  return cells.map(({ col, row }) => ({
    left: compact ? `${col * 46 + 2 + random() * 6}%` : `${col * 21 + 1 + random() * 6}%`,
    top: compact ? `${row * 24 + 2 + random() * 8}%` : `${row * 40 + 4 + random() * 16}%`,
    duration: `${(5 + random() * 3.5).toFixed(1)}s`,
    delay: `${(random() * 2).toFixed(1)}s`,
  }));
};

const parseIds = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

const subscribeCompact = (onChange: () => void) => {
  const mq = window.matchMedia(COMPACT_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};

export default function SkyPage() {
  const { letters, updateLetter } = useLetters();
  // Store only the id; the plane itself is derived from live data so counts never go stale.
  const [selectedPlaneId, setSelectedPlaneId] = useState<string | null>(null);
  // The whole sky is derived from this seed; "Catch More Planes" just rolls a new one.
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));

  // Planes depend on a client-made seed, so only draw them after hydration (keeps SSR markup identical).
  const isClient = useIsClient();

  // Phone breakpoint (also reacts to rotation) so the sky re-scatters to fit
  const isCompact = useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false
  );

  const rawReadIds = useLocalStorageItem(READ_PLANES_KEY);
  const readPlaneIds = useMemo(() => parseIds(rawReadIds), [rawReadIds]);

  const rawLikedIds = useLocalStorageItem(LIKED_PLANES_KEY);
  const likedIds = useMemo(() => parseIds(rawLikedIds), [rawLikedIds]);

  const masterPool: SkyPlane[] = useMemo(() => {
    const userPlanes: SkyPlane[] = letters.filter(isPublicPlane).map((l) => ({
      id: l.id,
      title: l.title || 'Untitled Thought',
      content: l.content,
      mood: l.mood || 'peaceful',
      likes: getPlaneLikes(l), // your own planes: the count stored on the letter
      createdAt: l.createdAt,
      isUserOwner: true,
    }));
    // Sample planes have no stored letter, so a reader's like is layered on top of the base count.
    const samplePlanes: SkyPlane[] = ALL_MOCK_POOL.map((p) => ({
      ...p,
      likes: p.likes + (likedIds.includes(p.id) ? 1 : 0),
    }));
    return [...userPlanes, ...samplePlanes];
  }, [letters, likedIds]);

  const selectedPlane = selectedPlaneId ? masterPool.find((p) => p.id === selectedPlaneId) ?? null : null;
  const isLiked = !!selectedPlane && likedIds.includes(selectedPlane.id);

  const totalPlanesCount = masterPool.length;
  
  const todayStr = new Date().toDateString();
  const newTodayCount = masterPool.filter((p) => {
    try {
      return new Date(p.createdAt).toDateString() === todayStr;
    } catch {
      return false;
    }
  }).length;

  const handleCatchMore = () => {
    setSeed(Math.floor(Math.random() * 2 ** 31));
  };

  const batch = useMemo(
    () => shuffle(masterPool, createRandom(seed)).slice(0, PLANES_PER_CATCH),
    [masterPool, seed]
  );

  // Offset the seed so placement doesn't mirror the shuffle that picked the planes
  const placements = useMemo(
    () => buildRandomLayout(batch.length, isCompact, createRandom(seed + 1)),
    [batch.length, isCompact, seed]
  );

  const handleToggleLike = (plane: SkyPlane) => {
    const wasLiked = likedIds.includes(plane.id);
    const nextLikedIds = wasLiked ? likedIds.filter((id) => id !== plane.id) : [...likedIds, plane.id];
    setLocalStorageItem(LIKED_PLANES_KEY, JSON.stringify(nextLikedIds));

    // Your own plane: write the new count onto the letter so Sent Planes shows the exact same number.
    if (plane.isUserOwner) {
      updateLetter(plane.id, { likes: Math.max(0, plane.likes + (wasLiked ? -1 : 1)) });
    }
  };

  const handleOpenPlane = (plane: SkyPlane) => {
    setSelectedPlaneId(plane.id);

    if (!readPlaneIds.includes(plane.id)) {
      setLocalStorageItem(READ_PLANES_KEY, JSON.stringify([...readPlaneIds, plane.id]));
    }
  };

  const activePlanes = (isClient ? batch : []).map((plane, i) => ({
    ...plane,
    ...placements[i],
    isRead: readPlaneIds.includes(plane.id),
  }));

  return (
    <div className="relative w-full min-h-[calc(100dvh-65px)] overflow-hidden flex flex-col items-center justify-between p-3 sm:p-6">

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
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-2xl bg-amber-100/60 hover:bg-amber-200/70 text-amber-950 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 dark:text-amber-200 text-xs font-semibold border border-amber-200/60 dark:border-slate-700/60 shadow-2xs hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            Catch More Planes
          </button>
        </div>

        {/* Bottom Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/40 dark:border-slate-800/50 text-xs">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
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
          <div className="flex flex-wrap items-center gap-2">
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
      <div className="relative z-10 w-full flex-1 min-h-[560px] sm:min-h-[420px]">
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
        onClose={() => setSelectedPlaneId(null)}
        // "Refold Plane" already returns the plane to the sky, so no extra Close button
        showCloseButton={false}
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
                active={isLiked}
                icon={<Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />}
                onClick={() => handleToggleLike(selectedPlane)}
              >
                Like ({selectedPlane.likes})
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