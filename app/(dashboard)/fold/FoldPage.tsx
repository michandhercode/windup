'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Send, 
  Lock, 
  Eye, 
  ChevronDown, 
  Sparkles, 
  Feather, 
  CloudRain, 
  HeartHandshake, 
  Clock, 
  Bot, 
  BookOpen, 
  Lightbulb,
  Archive,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useLetters } from '@/app/providers';
import { Visibility } from '@/types/letter';

import SealDatePicker from '@/components/SealDatePicker';

const MAX_WORDS = 1000;

const MOODS = [
  { id: 'peaceful', label: 'Peaceful', color: 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/50', activeBg: 'bg-emerald-300 dark:bg-emerald-300 text-emerald-950 dark:text-emerald-950 border-emerald-400 dark:border-emerald-200 shadow-sm', icon: Feather },
  { id: 'reflective', label: 'Reflective', color: 'bg-sky-100/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800/60 hover:bg-sky-200/60 dark:hover:bg-sky-900/50', activeBg: 'bg-sky-300 dark:bg-sky-300 text-sky-950 dark:text-sky-950 border-sky-400 dark:border-sky-200 shadow-sm', icon: BookOpen },
  { id: 'nostalgic', label: 'Nostalgic', color: 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/60 hover:bg-amber-200/60 dark:hover:bg-amber-900/50', activeBg: 'bg-amber-300 dark:bg-amber-300 text-amber-950 dark:text-amber-950 border-amber-400 dark:border-amber-200 shadow-sm', icon: Clock },
  { id: 'heavy', label: 'Heavy', color: 'bg-purple-100/70 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800/60 hover:bg-purple-200/60 dark:hover:bg-purple-900/50', activeBg: 'bg-purple-300 dark:bg-purple-300 text-purple-950 dark:text-purple-950 border-purple-400 dark:border-purple-200 shadow-sm', icon: CloudRain },
  { id: 'hopeful', label: 'Hopeful', color: 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800/60 hover:bg-rose-200/60 dark:hover:bg-rose-900/50', activeBg: 'bg-rose-300 dark:bg-rose-300 text-rose-950 dark:text-rose-950 border-rose-400 dark:border-rose-200 shadow-sm', icon: HeartHandshake },
];

function FoldContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const { letters, addLetter } = useLetters();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string>('neutral');

  const [visibility, setVisibility] = useState<Visibility>('private');
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);
  const [animType, setAnimType] = useState<'fly' | 'fold' | 'seal' | 'draft' | null>(null);

  const loadedDraftIdRef = useRef<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;

  useEffect(() => {
    if (draftId && letters && letters.length > 0 && loadedDraftIdRef.current !== draftId) {
      const existingDraft = letters.find((l) => l.id === draftId);
      if (existingDraft) {
        setTitle(existingDraft.title || '');
        setContent(existingDraft.content || '');
        setMood(existingDraft.mood || 'neutral');
        setVisibility(existingDraft.visibility || 'private');
        loadedDraftIdRef.current = draftId;
      }
    }
  }, [draftId, letters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVisibilityOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisibilityOpen(false);
      }
    };

    if (isVisibilityOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisibilityOpen]);

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const handleFoldAndRelease = (
    targetStatus: 'kept' | 'sealed' | 'released' = 'kept', 
    customSealDate?: string
  ) => {
    if (!content.trim()) {
      setErrorMessage('Please write something in your letter before submitting.');
      return;
    }

    if (wordCount > MAX_WORDS) {
      setErrorMessage(`Your letter exceeds the 1000-word limit (${wordCount} words). Please shorten it.`);
      return;
    }

    setErrorMessage('');
    if (isAnimating) return;

    const actualVisibility = visibility;
    const finalStatus = targetStatus === 'released' ? 'released' : (actualVisibility === 'anonymous_public' ? 'released' : targetStatus);

    addLetter({
      ...(draftId ? { id: draftId } : {}),
      title: title.trim() || 'Untitled Thought',
      content,
      mood, 
      status: finalStatus,
      visibility: actualVisibility,
      sealUntil: customSealDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any);

    setIsAnimating(true);
    if (finalStatus === 'sealed') {
      setAnimType('seal');
    } else {
      setAnimType(actualVisibility === 'anonymous_public' ? 'fly' : 'fold');
    }

    animTimeoutRef.current = setTimeout(() => {
      if (actualVisibility === 'anonymous_public') {
        setSuccessMessage('Your paper plane has drifted softly into the sky.');
      } else if (finalStatus === 'sealed') {
        setSuccessMessage('Your letter is securely sealed.');
      } else {
        setSuccessMessage('Your letter has been safely folded and kept in your jar.');
      }
      
      setTitle('');
      setContent('');
      setMood('neutral');
      setIsAnimating(false);
      setAnimType(null);

      redirectTimeoutRef.current = setTimeout(() => {
        setSuccessMessage('');
        router.push(actualVisibility === 'anonymous_public' ? '/sky' : '/jar');
      }, 1500);
    }, 800);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStatus = visibility === 'anonymous_public' ? 'released' : 'kept';
    handleFoldAndRelease(targetStatus);
  };

  const handleSaveAsDraft = () => {
    if (!content.trim()) {
      setErrorMessage('Cannot save an empty draft. Please write something first.');
      return;
    }

    if (wordCount > MAX_WORDS) {
      setErrorMessage(`Your draft exceeds the 1000-word limit (${wordCount} words). Please shorten it.`);
      return;
    }

    setErrorMessage('');
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimType('draft');

    addLetter({
      ...(draftId ? { id: draftId } : {}),
      title: title.trim() || 'Untitled Draft',
      content,
      mood,
      status: 'draft',
      visibility,
    } as any);

    animTimeoutRef.current = setTimeout(() => {
      setSuccessMessage('Draft saved successfully to your jar!');
      setTitle('');
      setContent('');
      setMood('neutral');
      setIsAnimating(false);
      setAnimType(null);

      redirectTimeoutRef.current = setTimeout(() => {
        setSuccessMessage('');
        router.push('/jar');
      }, 1200);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      
      {successMessage && (
        <div className="bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-300 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-300 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="p-6 rounded-3xl border border-teal-200/60 dark:border-teal-900/30 bg-teal-50/70 dark:bg-teal-950/20 text-teal-950 dark:text-teal-100 shadow-xs space-y-2 backdrop-blur-xs transition-colors duration-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-200/60 dark:bg-teal-900/50 border border-teal-300/50 text-[11px] font-bold tracking-wide uppercase text-teal-800 dark:text-teal-200">
          <Sparkles className="w-3.5 h-3.5" />
          Sanctuary Journal
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-teal-950 dark:text-teal-50">
          {draftId ? 'Edit your draft thought' : 'Fold a quiet thought'}
        </h1>
        <p className="text-xs font-medium max-w-2xl leading-relaxed opacity-90 text-teal-800/80 dark:text-teal-200/80">
          Capture raw reflections in your personal space. Keep them tucked in your jar, seal them with a timer, or release them softly into the open sky.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-8">
          <form
            onSubmit={handleFormSubmit}
            className={`rounded-3xl border border-teal-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 text-stone-800 dark:text-stone-100 shadow-lg p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-500 overflow-hidden ${
              animType === 'fold' ? 'scale-90 opacity-30 rotate-1 blur-xs' : ''
            } ${animType === 'draft' ? 'animate-pulse opacity-70' : ''} ${
              animType === 'seal' ? 'scale-95 brightness-90 animate-bounce' : ''
            }`}
          >
            <div className={`space-y-4 transition-all duration-500 ${animType === 'fly' ? '-translate-y-12 opacity-0 blur-xs' : ''}`}>
              <input
                type="text"
                placeholder="Give your thought a title (optional)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isAnimating}
                maxLength={100}
                className="w-full text-lg font-semibold placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none bg-transparent border-b pb-3 border-teal-100 dark:border-zinc-800 focus:border-teal-300 dark:focus:border-teal-600 transition-colors"
              />

              <div className="relative">
                <textarea
                  rows={14}
                  placeholder="Write your unfiltered thoughts freely here..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isAnimating}
                  className="w-full text-sm placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none bg-transparent resize-none leading-relaxed font-normal min-h-[280px]"
                />
                <div className={`flex justify-end text-[11px] mt-1 font-mono transition-colors ${
                  wordCount > MAX_WORDS ? 'text-rose-500 font-bold' : wordCount >= MAX_WORDS * 0.9 ? 'text-amber-500' : 'text-stone-400 dark:text-stone-500'
                }`}>
                  {wordCount} / {MAX_WORDS} words
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-teal-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsVisibilityOpen(!isVisibilityOpen)}
                  disabled={isAnimating}
                  aria-expanded={isVisibilityOpen}
                  aria-haspopup="menu"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                    visibility === 'anonymous_public'
                      ? 'bg-sky-100/80 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800/60'
                      : 'bg-purple-100/80 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800/60'
                  }`}
                >
                  {visibility === 'anonymous_public' ? (
                    <>
                      <Eye className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-300" /> Anonymous Public (Sky)
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 shrink-0 text-purple-600 dark:text-purple-300" /> Private (Jar)
                    </>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1" />
                </button>

                {isVisibilityOpen && (
                  <div 
                    role="menu"
                    className="absolute left-0 bottom-full mb-2 w-64 border border-teal-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setVisibility('private');
                        setIsVisibilityOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors text-left cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-purple-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-stone-800 dark:text-stone-100">Private (Jar)</div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400">Keep safely inside your personal jar</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setVisibility('anonymous_public');
                        setIsVisibilityOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors text-left border-t border-teal-100 dark:border-zinc-800 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-sky-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-stone-800 dark:text-stone-100">Anonymous Public (Sky)</div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400">Release as a paper plane into the sky</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {visibility !== 'anonymous_public' && (
                  <button
                    type="button"
                    onClick={handleSaveAsDraft}
                    disabled={isAnimating}
                    className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all duration-150 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <FileText className={`w-3.5 h-3.5 opacity-80 ${animType === 'draft' ? 'animate-spin' : ''}`} />
                    <span>{animType === 'draft' ? 'Saving...' : 'Save Draft'}</span>
                  </button>
                )}

                {visibility === 'private' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!content.trim()) {
                        setErrorMessage('Please write something before sealing your letter.');
                        return;
                      }
                      if (wordCount > MAX_WORDS) {
                        setErrorMessage(`Your letter exceeds the 1000-word limit (${wordCount} words). Please shorten it.`);
                        return;
                      }
                      setErrorMessage('');
                      setIsSealModalOpen(true);
                    }}
                    disabled={isAnimating}
                    className="px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-semibold hover:bg-amber-200/60 transition-all duration-150 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Seal Letter</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isAnimating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 overflow-hidden group cursor-pointer"
                >
                  {visibility === 'anonymous_public' ? (
                    <Send className={`w-3.5 h-3.5 transition-transform duration-500 ${
                      animType === 'fly' ? 'translate-x-12 -translate-y-12 scale-125 opacity-0' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                    }`} />
                  ) : (
                    <Archive className={`w-3.5 h-3.5 transition-transform duration-500 ${
                      animType === 'fold' ? 'scale-0 rotate-180 opacity-0' : 'group-hover:scale-110'
                    }`} />
                  )}
                  <span>
                    {isAnimating 
                      ? (visibility === 'anonymous_public' ? 'Releasing...' : 'Folding...') 
                      : (visibility === 'anonymous_public' ? 'Release Plane' : 'Fold & Keep')
                    }
                  </span>
                </button>
              </div>

            </div>
          </form>
        </div>

        <div className="lg:col-span-4 space-y-5">

          <div className="rounded-3xl border border-teal-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 shadow-md p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                CURRENT MOOD / VIBE
              </label>
              <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">Optional</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMood('neutral')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border active:scale-95 cursor-pointer ${
                  mood === 'neutral' 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600 shadow-xs' 
                    : 'bg-stone-100/60 dark:bg-stone-800/40 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-200/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                <span>Neutral / None</span>
              </button>

              {MOODS.map((m) => {
                const Icon = m.icon;
                const isSelected = mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border active:scale-95 cursor-pointer ${
                      isSelected ? m.activeBg : m.color
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <h2 className="text-xs font-bold tracking-wider uppercase text-sky-950 dark:text-sky-100">ASK MIMI</h2>
              </div>
              <span className="text-[10px] bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 px-2.5 py-0.5 rounded-full font-bold">
                Companion
              </span>
            </div>
            
            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-xs space-y-2">
              <p className="font-bold text-sky-900 dark:text-sky-200">Mimi&apos;s Companion Space</p>
              <p className="text-[11px] leading-relaxed text-sky-800/80 dark:text-sky-300/80">
                Dedicated slot for your custom Mimi agent appearance, interactive companion chat widget, or reflection prompts.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-900/50 px-2 py-0.5 rounded-md inline-block">
                  REFLECTION PROMPT
                </span>
              </div>
              <p className="text-[11px] italic font-medium leading-relaxed text-amber-950 dark:text-amber-200/90 opacity-90">
                &quot;What is one small thing that made you pause and feel grateful today?&quot;
              </p>
            </div>
          </div>

        </div>

      </div>

      <SealDatePicker
        isOpen={isSealModalOpen}
        onClose={() => setIsSealModalOpen(false)}
        onConfirm={(sealUntilISO) => {
          setIsSealModalOpen(false);
          handleFoldAndRelease('sealed', sealUntilISO);
        }}
      />

    </div>
  );
}

export default function FoldPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs opacity-60">Loading sanctuary journal...</div>}>
      <FoldContent />
    </Suspense>
  );
}