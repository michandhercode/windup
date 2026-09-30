'use client';

import { useState } from 'react';
import { Send, Calendar, Heart, Trash2, Inbox, Cloud, Feather, BookOpen, Clock, CloudRain, HeartHandshake, BookmarkCheck, AlertCircle } from 'lucide-react';
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
      return { label: 'Hopeful', icon: HeartHandshake, badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300/50 dark:border-rose-800/60' };
  }
};

export default function SentPlanesPage() {
  const { letters, setLetters } = useLetters();
  const [selectedPlane, setSelectedPlane] = useState<any | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
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

  const selectedCfg = selectedPlane ? getMoodConfig(selectedPlane.mood) : null;
  const SelectedMoodIcon = selectedCfg?.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      
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

      {sentPlanes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sentPlanes.map((plane) => {
            const cfg = getMoodConfig(plane.mood);
            const MoodIcon = cfg.icon;

            return (
              <div
                key={plane.id}
                onClick={() => setSelectedPlane(plane)}
                className="group relative flex flex-col justify-between p-5 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${cfg.badgeClass}`}>
                    <MoodIcon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </span>

                  <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {plane.createdAt}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  {plane.title && (
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {plane.title}
                    </h3>
                  )}
                  <p className="text-xs font-serif italic leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-4">
                    "{plane.content}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 text-xs font-bold">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{plane.resonated} Resonated</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleKeepInJar(plane.id, e)}
                      title="Keep in Jar (Make Private)"
                      className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
                    >
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(plane.id, e)}
                      title="Recall / Delete Plane"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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

      {selectedPlane && selectedCfg && SelectedMoodIcon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Pinalawak ang max-width to max-w-4xl at pinalaki ang padding */}
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col p-8 sm:p-10 rounded-3xl bg-amber-50/95 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {selectedPlane.createdAt}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${selectedCfg.badgeClass}`}>
                <SelectedMoodIcon className="w-3.5 h-3.5" />
                {selectedCfg.label}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 shrink-0">
              {selectedPlane.title}
            </h2>
            
            <div className="overflow-y-auto max-h-[50vh] pr-2 border-t border-b border-amber-200/50 py-5 font-serif custom-scrollbar">
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                "{selectedPlane.content}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-bold">
                <Heart className="w-4 h-4 fill-current" />
                <span>{selectedPlane.resonated} Resonated</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleKeepInJar(selectedPlane.id, e)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 text-xs font-semibold hover:bg-sky-200 transition-colors"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  Keep in Jar
                </button>
                <button
                  onClick={() => setSelectedPlane(null)}
                  className="px-6 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{confirmConfig.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Confirmation required</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmConfig.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}