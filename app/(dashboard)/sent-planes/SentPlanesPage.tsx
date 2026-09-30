'use client';

import { useState } from 'react';
import { Send, Calendar, Heart, Trash2, Sparkles, Inbox, Cloud } from 'lucide-react';

// Sample mock sent paper planes
const INITIAL_SENT_PLANES = [
  {
    id: '1',
    title: 'Got the job offer!',
    content: 'Got the job offer I was praying for! Sending some extra hope into the sky for anyone waiting on good news.',
    mood: 'Hopeful',
    resonated: 42,
    createdAt: 'Sep 28, 2026',
  },
  {
    id: '2',
    title: 'Healing is not linear',
    content: 'Reminding myself that healing is not linear. It is okay to rest today.',
    mood: 'Reflective',
    resonated: 18,
    createdAt: 'Sep 25, 2026',
  },
];

export default function SentPlanesPage() {
  const [sentPlanes, setSentPlanes] = useState(INITIAL_SENT_PLANES);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to recall/delete this paper plane from the sky?')) {
      setSentPlanes((prev) => prev.filter((plane) => plane.id !== id));
    }
  };

  const totalResonated = sentPlanes.reduce((acc, item) => acc + item.resonated, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      
      {/* Header Banner - Sky Blue Theme */}
      <div className="p-6 rounded-3xl border border-sky-200/70 dark:border-sky-800/50 bg-gradient-to-r from-sky-100/90 via-sky-50/70 to-indigo-50/80 dark:from-slate-900 dark:via-sky-950/40 dark:to-indigo-950/50 text-slate-800 dark:text-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-800 dark:text-sky-200 text-[11px] font-bold tracking-wide uppercase">
            <Send className="w-3.5 h-3.5" />
            Your Public Echoes
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Sent Planes
            <Cloud className="w-5 h-5 text-sky-400" />
          </h1>
          <p className="text-xs font-medium max-w-xl leading-relaxed text-slate-600 dark:text-slate-300">
            A record of anonymous paper planes you have released into the sky. Softly resonating with strangers around the world.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-slate-800 backdrop-blur-xs flex items-center gap-3 shadow-xs">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Sent</div>
              <div className="text-base font-extrabold text-slate-800 dark:text-slate-100">{sentPlanes.length}</div>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-slate-800 backdrop-blur-xs flex items-center gap-3 shadow-xs">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resonated</div>
              <div className="text-base font-extrabold text-slate-800 dark:text-slate-100">{totalResonated}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid List of Sent Planes */}
      {sentPlanes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sentPlanes.map((plane) => (
            <div
              key={plane.id}
              className="group relative flex flex-col justify-between p-5 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4"
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between text-xs">
                {plane.mood ? (
                  <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-[11px] tracking-wide">
                    {plane.mood}
                  </span>
                ) : <span />}

                <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {plane.createdAt}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5 flex-1">
                {plane.title && (
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {plane.title}
                  </h3>
                )}
                <p className="text-xs font-serif italic leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-4">
                  "{plane.content}"
                </p>
              </div>

              {/* Footer Actions & Analytics */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 text-xs font-bold">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{plane.resonated} Resonated</span>
                </div>

                <button
                  onClick={() => handleDelete(plane.id)}
                  title="Recall / Delete Plane"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-sky-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center space-y-3 bg-sky-50/30 dark:bg-slate-900/30">
          <div className="p-4 rounded-full bg-sky-500/10 text-sky-500">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No sent paper planes yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Fold a new thought and release it into the sky to start resonating with others!
            </p>
          </div>
        </div>
      )}

    </div>
  );
}