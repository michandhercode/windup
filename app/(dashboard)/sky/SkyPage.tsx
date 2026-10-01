'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sparkles, Heart, Feather, BookOpen, Clock, CloudRain, HeartHandshake, CheckCircle2, FoldHorizontal, UserCheck, Send } from 'lucide-react';
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

  const getRandomFive = () => {
    const shuffled = [...masterPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };

  useEffect(() => {
    setCurrentBatch(getRandomFive());
  }, [letters]);

  const handleCatchMore = () => {
    setCurrentBatch(getRandomFive());
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

  const positions = [
    { top: '20%', left: '15%', duration: '6s', delay: '0s' },
    { top: '35%', left: '65%', duration: '7s', delay: '1s' },
    { top: '55%', left: '30%', duration: '5.5s', delay: '0.5s' },
    { top: '70%', left: '70%', duration: '6.5s', delay: '2s' },
    { top: '25%', left: '45%', duration: '8s', delay: '1.5s' },
  ];

  const activePlanes = currentBatch.map((plane, index) => ({
    ...plane,
    ...positions[index % positions.length],
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
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Catching 5 random paper planes drifting around.</p>
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
          return (
            <div
              key={plane.id}
              className={`absolute animate-float transition-all duration-300 ${
                plane.isRead ? 'opacity-70 grayscale-[20%]' : 'opacity-100'
              }`}
              style={{
                top: plane.top,
                left: plane.left,
                animationDuration: plane.duration,
                animationDelay: plane.delay,
              }}
            >
              <div className="relative group">
                {/* Badges para sa User Owner o Read status */}
                {plane.isUserOwner ? (
                  <span className="absolute -top-2.5 -right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-sm border border-indigo-300">
                    <UserCheck className="w-3 h-3" />
                    You
                  </span>
                ) : plane.isRead ? (
                  <span className="absolute -top-2 -right-2 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                ) : null}

                {/* Pinagandang Custom Paper Airplane Card (inalis ang search icon, ginawang parang tunay na eroplanong papel) */}
                <div 
                  onClick={() => handleOpenPlane(plane)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl cursor-pointer backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 shadow-md border ${
                    plane.isUserOwner
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-400/50'
                      : plane.isRead
                      ? 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      : 'bg-white/90 dark:bg-slate-900/90 border-white/80 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${plane.isUserOwner ? 'bg-indigo-500 text-white' : 'bg-sky-500 text-white'} shadow-sm`}>
                    <Send className="w-3.5 h-3.5 transform -rotate-45" />
                  </div>
                  <div className="flex flex-col max-w-[140px] sm:max-w-[180px]">
                    <span className="text-xs font-semibold truncate font-serif">{plane.title}</span>
                    <span className="text-[10px] opacity-70 capitalize">{plane.mood}</span>
                  </div>
                </div>

              </div>
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