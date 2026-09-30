'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/app/providers';
import { Letter, LetterStatus } from '@/types/letter';
import { 
  Archive, 
  Lock, 
  FileText, 
  Sparkles, 
  Box, 
  Layers, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  BookmarkCheck, 
  Feather, 
  BookOpen, 
  Clock, 
  CloudRain, 
  HeartHandshake,
  AlertTriangle,
  Send 
} from 'lucide-react';

const getMoodConfig = (moodString?: string) => {
  const normalized = moodString?.toLowerCase() || 'neutral';
  switch (normalized) {
    case 'neutral':
      return { label: 'Neutral', icon: Sparkles, badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/50' };
    case 'peaceful':
      return { label: 'Peaceful', icon: Feather, badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/50' };
    case 'reflective':
      return { label: 'Reflective', icon: BookOpen, badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/50' };
    case 'nostalgic':
      return { label: 'Nostalgic', icon: Clock, badgeClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/50' };
    case 'heavy':
      return { label: 'Heavy', icon: CloudRain, badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/50' };
    case 'hopeful':
      return { label: 'Hopeful', icon: HeartHandshake, badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/50' };
    default:
      return { label: 'Neutral', icon: Sparkles, badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/50' };
  }
};

const getShelfColorConfig = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return {
        cardBg: 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 hover:border-blue-400',
      };
    case 'kept':
      return {
        cardBg: 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400',
      };
    case 'sealed':
      return {
        cardBg: 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-400',
      };
    default:
      return {
        cardBg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400',
      };
  }
};

export default function JarPage() {
  const router = useRouter();
  const { letters, setLetters, displayName } = useLetters() as any; 
  
  const [filter, setFilter] = useState<'all' | LetterStatus>('all');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [letterToDelete, setLetterToDelete] = useState<string | null>(null);
  const [letterToRelease, setLetterToRelease] = useState<Letter | null>(null);
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
    const isSealed = letter.status === 'sealed';
    const isNotYetUnlocked = isSealed && letter.sealUntil && new Date().getTime() < new Date(letter.sealUntil).getTime();
    
    if (isNotYetUnlocked) {
      return;
    }
    
    setSelectedLetter(letter);
  };

  const confirmRelease = (letter: Letter, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLetterToRelease(letter);
  };

  const handleExecuteRelease = () => {
    if (letterToRelease) {
      const targetId = letterToRelease.id;
      setAnimatingLetterId(targetId);
      setLetterToRelease(null);

      setTimeout(() => {
        const updatedLetters = letters.map((l: Letter) => {
          if (l.id === targetId) {
            return {
              ...l,
              visibility: 'anonymous_public' as const,
              status: 'released' as const,
            };
          }
          return l;
        });
        setLetters(updatedLetters);
        if (selectedLetter?.id === targetId) {
          setSelectedLetter(null);
        }
        setAnimatingLetterId(null);
      }, 700);
    }
  };

  const selectedCfg = selectedLetter ? getMoodConfig(selectedLetter.mood) : null;
  const SelectedMoodIcon = selectedCfg?.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6 relative">
      
      <div className="p-6 rounded-3xl border border-pink-300/80 dark:border-pink-900/60 bg-gradient-to-r from-pink-100/90 via-pink-50/85 to-rose-100/90 dark:from-pink-950/40 dark:via-rose-950/30 dark:to-pink-900/30 text-pink-950 dark:text-pink-100 shadow-sm transition-colors duration-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-900 dark:text-pink-200 text-[11px] font-bold tracking-wide uppercase">
            <Archive className="w-3.5 h-3.5" />
            Private Vault
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-pink-950 dark:text-pink-50">
            {displayName ? `${displayName}'s Jar` : 'My Jar'}
          </h1>
          <p className="text-xs font-medium max-w-2xl leading-relaxed text-pink-800/90 dark:text-pink-200/80">
            Your private safe haven for drafts, kept thoughts, and sealed time-capsules. Select a category from your shelf to browse.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div 
          className="lg:col-span-4 rounded-3xl border p-5 space-y-4 shadow-xs transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderColor: 'var(--card-border)', 
            color: 'var(--text-main)' 
          }}
        >
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
            <Box className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xs font-bold tracking-wider uppercase opacity-80">The Memory Shelf</h2>
          </div>

          <div className="space-y-3">
            
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 ${
                  filter === 'all'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-200 font-bold shadow-xs'
                    : 'hover:bg-stone-500/5 border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ borderColor: filter === 'all' ? undefined : 'var(--card-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-700 dark:text-rose-300">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">All Entries</div>
                    <div className="text-[10px] opacity-60">Full collection</div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-500/10 border border-stone-500/20">
                  {countByStatus('all')}
                </span>
              </button>
              <div className="h-1 w-full bg-stone-300/40 dark:bg-stone-700/40 rounded-full" />
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setFilter('draft')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 ${
                  filter === 'draft'
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                    : 'hover:bg-stone-500/5 border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ borderColor: filter === 'draft' ? undefined : 'var(--card-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Drafts</div>
                    <div className="text-[10px] opacity-60">Unfinished reflections</div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-500/10 border border-stone-500/20">
                  {countByStatus('draft')}
                </span>
              </button>
              <div className="h-1 w-full bg-stone-300/40 dark:bg-stone-700/40 rounded-full" />
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setFilter('kept')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 ${
                  filter === 'kept'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                    : 'hover:bg-stone-500/5 border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ borderColor: filter === 'kept' ? undefined : 'var(--card-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <BookmarkCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Kept</div>
                    <div className="text-[10px] opacity-60">Safely stored entries</div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-500/10 border border-stone-500/20">
                  {countByStatus('kept')}
                </span>
              </button>
              <div className="h-1 w-full bg-stone-300/40 dark:bg-stone-700/40 rounded-full" />
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setFilter('sealed')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 ${
                  filter === 'sealed'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                    : 'hover:bg-stone-500/5 border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ borderColor: filter === 'sealed' ? undefined : 'var(--card-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Sealed</div>
                    <div className="text-[10px] opacity-60">Locked time-capsules</div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-500/10 border border-stone-500/20">
                  {countByStatus('sealed')}
                </span>
              </button>
              <div className="h-1 w-full bg-stone-300/40 dark:bg-stone-700/40 rounded-full" />
            </div>

          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          {filteredLetters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLetters.map((letter: Letter) => {
                const cfg = getMoodConfig(letter.mood);
                const MoodIcon = cfg.icon;
                const shelfColor = getShelfColorConfig(letter.status);
                const isAnimating = animatingLetterId === letter.id;
                
                const isSealed = letter.status === 'sealed';
                const isNotYetUnlocked = isSealed && letter.sealUntil && new Date().getTime() < new Date(letter.sealUntil).getTime();

                return (
                  <div
                    key={letter.id}
                    onClick={() => handleCardClick(letter)}
                    className={`group relative flex flex-col justify-between p-5 rounded-3xl border shadow-xs transition-all duration-700 space-y-4 ${
                      isNotYetUnlocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
                    } ${shelfColor.cardBg} ${
                      isAnimating ? 'transform -translate-y-16 opacity-0 scale-95 pointer-events-none' : ''
                    }`}
                  >
                    {/* Header - Mood Badge Only */}
                    <div className="flex items-center justify-between text-xs">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${cfg.badgeClass}`}>
                        <MoodIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Title & Body / Time-Capsule Banner */}
                    <div className="space-y-3 flex-1">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-rose-600 transition-colors flex items-center gap-2">
                        {isNotYetUnlocked && <Lock className="w-4 h-4 text-amber-500 shrink-0" />}
                        {letter.title || 'Untitled Thought'}
                      </h3>
                      
                      {isNotYetUnlocked ? (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Time-Capsule Locked</span>
                          </div>
                          <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 font-medium">
                            Opens on: <span className="font-semibold">{letter.sealUntil ? new Date(letter.sealUntil).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '10/1/2026'}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs font-serif italic leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                          "{letter.content}"
                        </p>
                      )}
                    </div>

                    {/* Divider Line */}
                    <div className="border-t border-slate-200/60 dark:border-slate-800/80" />

                    {/* Footer: Created date only */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Created: {letter.createdAt ? new Date(letter.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '9/30/2026'}
                      </span>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-800/60">
                      {((letter.status === 'kept' || letter.status === 'sealed') && !isNotYetUnlocked) ? (
                        <button
                          onClick={(e) => confirmRelease(letter, e)}
                          title="Release to Sky"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-300/40 text-[11px] font-semibold hover:bg-sky-500/20 active:scale-95 transition-all"
                        >
                          <Send className="w-3 h-3" />
                          <span>Release</span>
                        </button>
                      ) : <div />}

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {isNotYetUnlocked ? (
                          <div className="p-2 rounded-xl text-amber-500 bg-amber-500/10" title="Locked until set date">
                            <Lock className="w-4 h-4" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCardClick(letter)}
                            title="View Letter"
                            className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {letter.status === 'draft' && (
                          <button
                            onClick={() => router.push(`/fold?draftId=${letter.id}`)}
                            title="Edit Draft"
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={(e) => confirmDelete(letter.id, e)}
                          title="Delete Letter"
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
            <div 
              className="rounded-3xl border p-12 text-center flex flex-col items-center justify-center space-y-3"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                No letters found in this shelf category.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Landscape / Wide View Modal */}
      {selectedLetter && selectedCfg && SelectedMoodIcon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl sm:max-w-3xl max-h-[85vh] flex flex-col p-8 rounded-3xl bg-amber-50/95 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {selectedLetter.createdAt ? new Date(selectedLetter.createdAt).toLocaleDateString() : 'Sep 30, 2026'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${selectedCfg.badgeClass}`}>
                <SelectedMoodIcon className="w-3.5 h-3.5" />
                {selectedCfg.label}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 shrink-0">
              {selectedLetter.title || 'Untitled Letter'}
            </h2>
            
            <div className="overflow-y-auto max-h-[50vh] pr-2 border-t border-b border-amber-200/50 py-5 font-serif custom-scrollbar">
              <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                "{selectedLetter.content}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 shrink-0">
              {selectedLetter.status === 'draft' ? (
                <button
                  onClick={() => router.push(`/fold?draftId=${selectedLetter.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold hover:bg-blue-200 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Draft
                </button>
              ) : (selectedLetter.status === 'kept' || selectedLetter.status === 'sealed') ? (
                <button
                  onClick={(e) => confirmRelease(selectedLetter, e)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-300/40 text-xs font-semibold hover:bg-sky-500/25 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Release to Sky
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedLetter(null)}
                className="px-6 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {letterToRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm flex flex-col p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            
            <div className="mx-auto p-3 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 animate-bounce">
              <Send className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Release Letter to Sky?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This will make your letter anonymous and public so it can fly freely in the Sky page for others to see. Do you wish to continue?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setLetterToRelease(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRelease}
                className="flex-1 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors shadow-sm"
              >
                Release
              </button>
            </div>

          </div>
        </div>
      )}

      {letterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm flex flex-col p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            
            <div className="mx-auto p-3 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Delete Letter
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete this letter from your jar? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setLetterToDelete(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}