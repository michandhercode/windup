'use client';

import { useState } from 'react';
import PaperPlaneCard from '@/components/PaperPlaneCard';
import { Cloud, Sparkles, Heart, Flag, RefreshCw } from 'lucide-react';

// Sample mock floating paper planes
const MOCK_PLANES = [
  {
    id: '1',
    title: 'The sun felt like ...',
    content: 'It has been a strange week. I finally decided to let go of that old resentment. Walking in the park today, I saw a child laughing and realized how much joy I have missed holding onto anger. Be kind to yourself. A new chapter begins.',
    mood: 'Hopeful',
    likes: 14,
    top: '22%',
    left: '28%',
    animationDelay: '0s',
    duration: '6s',
  },
  {
    id: '2',
    title: 'Stargazing thought...',
    content: 'Looking at the night sky always reminds me how small our problems are in the vast universe. Take a deep breath tonight.',
    mood: 'Reflective',
    likes: 29,
    top: '32%',
    left: '48%',
    animationDelay: '2s',
    duration: '7s',
  },
  {
    id: '3',
    title: 'Quiet rainy evenin...',
    content: 'Listening to the rain fall outside while drinking hot tea. Sending warm thoughts to anyone who needs comfort today.',
    mood: 'Peaceful',
    likes: 42,
    top: '40%',
    left: '64%',
    animationDelay: '1s',
    duration: '5.5s',
  },
  {
    id: '4',
    title: 'To whoever needs a...',
    content: 'You are capable of far more than you think. Keep going, even if progress feels small right now.',
    mood: 'Hopeful',
    likes: 18,
    top: '65%',
    left: '34%',
    animationDelay: '3s',
    duration: '6.5s',
  },
  {
    id: '5',
    title: 'Brewing chamomile...',
    content: 'Unwinding after a long work day. Hope everyone gets a restful sleep tonight.',
    mood: 'Calm',
    likes: 8,
    top: '70%',
    left: '58%',
    animationDelay: '1.5s',
    duration: '8s',
  },
];

export default function SkyPage() {
  const [selectedPlane, setSelectedPlane] = useState<typeof MOCK_PLANES[0] | null>(null);
  const [liked, setLiked] = useState(false);

  const handleOpenPlane = (plane: typeof MOCK_PLANES[0]) => {
    setSelectedPlane(plane);
    setLiked(false);
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex flex-col items-center justify-between p-4 sm:p-6 transition-colors">
      
      {/* Floating Background Clouds */}
      <Cloud className="absolute top-10 left-12 w-20 h-20 text-white/40 dark:text-slate-700/30 blur-[1px] animate-pulse" />
      <Cloud className="absolute top-28 right-16 w-28 h-28 text-white/50 dark:text-slate-700/30 blur-[1px] animate-pulse" />
      <Cloud className="absolute bottom-20 left-1/4 w-24 h-24 text-white/30 dark:text-slate-700/20 blur-[1px]" />

      {/* Sky Header Banner */}
      <div className="z-10 w-full max-w-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-500">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              The Sky <span className="font-normal text-xs text-slate-500 dark:text-slate-400">(Public Ocean)</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Catch anonymous paper planes drifting from souls around the world.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
            Planes in Sky: <strong className="font-bold">345</strong>
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:shadow-md border border-sky-100 dark:border-slate-700 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Catch More Planes
          </button>
        </div>
      </div>

      {/* Floating Planes Container Area */}
      <div className="relative w-full flex-1">
        {MOCK_PLANES.map((plane) => (
          <div
            key={plane.id}
            className="absolute animate-float"
            style={{
              top: plane.top,
              left: plane.left,
              animationDuration: plane.duration,
              animationDelay: plane.animationDelay,
            }}
          >
            <PaperPlaneCard plane={plane} onClick={() => handleOpenPlane(plane)} />
          </div>
        ))}
      </div>

      {/* CSS Animation Keyframes for Smooth Floating */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-12px) translateX(6px);
          }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
      `}</style>

      {/* Modal Popup when Clicking a Paper Plane */}
      {selectedPlane && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-amber-50/95 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 space-y-4">
            
            {/* Modal Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">Anonymous Paper Plane #{selectedPlane.id}</span>
                {selectedPlane.mood && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">
                    ☀️ {selectedPlane.mood}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 pt-1">
                {selectedPlane.title}
              </h2>
            </div>

            {/* Content Body */}
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-b border-amber-200/50 dark:border-slate-800 py-4 font-serif">
              {selectedPlane.content}
            </p>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    liked
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                  Like ({selectedPlane.likes + (liked ? 1 : 0)})
                </button>

                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <Flag className="w-3.5 h-3.5" />
                  Report
                </button>
              </div>

              {/* Refold Plane button serves as the main close action */}
              <button
                onClick={() => setSelectedPlane(null)}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refold Plane
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}