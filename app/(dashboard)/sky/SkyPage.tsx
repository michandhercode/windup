'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sparkles, Heart, Feather, BookOpen, Clock, CloudRain, HeartHandshake, FoldHorizontal, UserCheck } from 'lucide-react';
import { useLetters } from '@/app/providers';

const getMoodConfig = (moodString: string) => {
  const normalized = moodString?.toLowerCase() || 'peaceful';
  switch (normalized) {
    case 'peaceful':
      return { label: 'Peaceful', icon: Feather, badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-800/60' };
    case 'reflective':
      return { label: 'Reflective', icon: BookOpen, badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/50 dark:border-sky-800/60' };
    case 'nostalgic':
      return { label: 'Nostalgic', icon: Clock, badgeClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/50 border-amber-800/60' };
    case 'heavy':
      return { label: 'Heavy', icon: CloudRain, badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/50 dark:border-purple-800/60' };
    case 'hopeful':
    default:
      return { label: 'Hopeful', icon: HeartHandshake, badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300/50 border-rose-300/50' };
  }
};

const ALL_MOCK_POOL = [
  { id: 'm1', title: 'The morning sun...', content: 'Waking up early to watch the sunrise changed my entire mood today. Simple things matter.', mood: 'hopeful', likes: 12, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm2', title: 'A quiet reminder...', content: 'It is okay to rest when you are tired. You do not have to earn your right to breathe.', mood: 'peaceful', likes: 25, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm3', title: 'Midnight thoughts...', content: 'Wondering if someone on the other side of the world is looking at the same moon right now.', mood: 'reflective', likes: 19, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm4', title: 'Warm coffee cup...', content: 'Holding a warm mug on a chilly afternoon is a tiny piece of heaven.', mood: 'nostalgic', likes: 31, createdAt: new Date(Date.now() - 86400000).toISOString(), isUserOwner: false },
  { id: 'm5', title: 'To anyone lost...', content: 'Even the longest nights eventually lead to a bright morning. Keep going.', mood: 'hopeful', likes: 44, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm6', title: 'Little victories...', content: 'Today I managed to cook a good meal and finish my book. Celebrate small wins.', mood: 'peaceful', likes: 15, createdAt: new Date(Date.now() - 86400000).toISOString(), isUserOwner: false },
  { id: 'm7', title: 'Stargazing notes...', content: 'The universe is vast, and your presence in it matters more than you realize.', mood: 'reflective', likes: 27, createdAt: new Date().toISOString(), isUserOwner: false },
  { id: 'm8', title: 'Rainy afternoon...', content: 'Listening to the heavy rain while wrapped in a thick blanket. Pure comfort.', mood: 'heavy', likes: 38, createdAt: new Date().toISOString(), isUserOwner: false },
];

const PLANES_PER_CATCH = 7;
const GRID_COLS = 4;
const GRID_ROWS = 2;

const generateScatterLayout = (count: number) => {
  const cells: { col: number; row: number }[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      cells.push({ col, row });
    }
  }
  const shuffledCells = cells.sort(() => 0.5 - Math.random());

  return Array.from({ length: count }, (_, i) => {
    const cell = shuffledCells[i % shuffledCells.length];
    return {
      left: `${2 + cell.col * 22 + Math.random() * 6}%`,
      top: `${cell.row * 42 + Math.random() * 10}%`,
      duration: `${(5 + Math.random() * 3.5).toFixed(1)}s`,
      delay: `${(Math.random() * 2).toFixed(1)}s`,
    };
  });
};

export default function SkyPage() {
  const { letters } = useLetters();
  const [selectedPlane, setSelectedPlane] = useState<any | null>(null);
  const [liked, setLiked] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<any[]>([]);
  
  const [readPlaneIds, setReadPlaneIds] = useState<string[]>([]);
  const [isClosing, setIsClosing] = useState(false);

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
    .filter((l) => l.visibility === 'anonymous_public' || l.status === 'released')
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
    const shuffled = [...masterPool].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, PLANES_PER_CATCH);
    const layout = generateScatterLayout(picked.length);
    return picked.map((plane, i) => ({ ...plane, ...layout[i] }));
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
    setIsClosing(false);

    if (!readPlaneIds.includes(plane.id)) {
      const updatedReads = [...readPlaneIds, plane.id];
      setReadPlaneIds(updatedReads);
      localStorage.setItem('sky_read_planes', JSON.stringify(updatedReads));
    }
  };

  const handleRefoldPlane = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPlane(null);
      setIsClosing(false);
    }, 200);
  };

  const activePlanes = currentBatch.map((plane) => ({
    ...plane,
    isRead: readPlaneIds.includes(plane.id),
  }));

  const selectedMoodConfig = selectedPlane ? getMoodConfig(selectedPlane.mood) : null;
  const SelectedMoodIcon = selectedMoodConfig?.icon;

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex flex-col items-center justify-between p-4 sm:p-6 transition-colors">
      
      <Cloud className="absolute top-10 left-12 w-20 h-20 text-white/40 dark:text-slate-700/30 blur-[1px] animate-pulse" />
      <Cloud className="absolute top-28 right-16 w-28 h-28 text-white/50 dark:text-slate-700/30 blur-[1px] animate-pulse" />

      <div className="z-10 w-full max-w-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            The Sky <span className="font-normal text-xs text-slate-500 dark:text-slate-400">(Public Ocean)</span>
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Catching {PLANES_PER_CATCH} random paper planes drifting around.</p>
          <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_2px_rgba(251,191,36,0.6)]" />
              Unread
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-400/70" />
              Read
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:gap-2 text-sky-800 dark:text-sky-300 font-medium">
            <span>Total: <strong className="font-bold">{totalPlanesCount}</strong></span>
            <span className="hidden sm:inline">•</span>
            <span>New Today: <strong className="font-bold text-emerald-600 dark:text-emerald-400">+{newTodayCount}</strong></span>
          </div>
          <button 
            onClick={handleCatchMore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:shadow-md border border-sky-100 dark:border-slate-700 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Catch More Planes
          </button>
        </div>
      </div>

      <div className="relative w-full flex-1">
        {activePlanes.map((plane) => {
          const planeSrc = plane.isUserOwner ? '/my_plane.png' : '/users_plane.png';
          const planeAlt = plane.isUserOwner ? 'Your paper plane' : 'Paper plane';
          const statusLabel = plane.isRead ? 'Read' : 'Unread';
          const imageStateClass = plane.isRead
            ? 'opacity-60 grayscale-[35%] drop-shadow-md'
            : 'opacity-100 drop-shadow-[0_0_14px_rgba(251,191,36,0.75)]';

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
                aria-label={statusLabel + ' paper plane: ' + plane.title}
                title={statusLabel}
                className="relative block cursor-pointer bg-transparent border-0 p-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 rounded-2xl transition-transform duration-300 hover:scale-110 active:scale-95"
              >
                <img
                  src={planeSrc}
                  alt={planeAlt}
                  draggable={false}
                  className={'w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain select-none transition-all duration-300 ' + imageStateClass}
                />

                {/* Read / unread marker badge */}
                {plane.isRead ? (
                  <span className="absolute top-[16%] right-[16%] h-3 w-3 rounded-full bg-slate-400/70 dark:bg-slate-500/70 border border-white/70 dark:border-slate-800" />
                ) : (
                  <span className="absolute top-[16%] right-[16%] flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 shadow-[0_0_8px_2px_rgba(251,191,36,0.7)]" />
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

      {/* Modal Popup view */}
      {selectedPlane && selectedMoodConfig && SelectedMoodIcon && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'animate-in fade-in duration-200'}`}>
          <div className={`relative w-full max-w-md max-h-[85vh] flex flex-col p-6 rounded-3xl bg-amber-50/95 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 shadow-2xl space-y-4 transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'animate-in zoom-in-95 duration-200'}`}>
            
            <div className="flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="font-mono flex items-center gap-1">
                {selectedPlane.isUserOwner ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Your Letter
                  </span>
                ) : (
                  'Anonymous Plane'
                )}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${selectedMoodConfig.badgeClass}`}>
                <SelectedMoodIcon className="w-3.5 h-3.5" />
                {selectedMoodConfig.label}
              </span>
            </div>

            <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 shrink-0">{selectedPlane.title}</h2>
            
            <div className="overflow-y-auto max-h-[45vh] pr-1 border-t border-b border-amber-200/50 py-4 font-serif custom-scrollbar">
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {selectedPlane.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 shrink-0">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  liked ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                Like ({selectedPlane.likes + (liked ? 1 : 0)})
              </button>
              
              <button
                onClick={handleRefoldPlane}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <FoldHorizontal className="w-3.5 h-3.5" />
                Refold Plane
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}