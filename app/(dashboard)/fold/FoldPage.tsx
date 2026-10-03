'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Send,
  Lock,
  Eye,
  ChevronDown,
  Sparkles,
  Lightbulb,
  Archive,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useLetters } from '@/app/providers';
import { Visibility } from '@/types/letter';

import SealDatePicker from '@/components/SealDatePicker';
import MoodPicker from '@/components/MoodPicker';

const MAX_WORDS = 1000;
const MAX_TITLE_LENGTH = 100;

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

    if (title.length > MAX_TITLE_LENGTH) {
      setErrorMessage(`Your title exceeds the ${MAX_TITLE_LENGTH}-character limit.`);
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

    if (title.length > MAX_TITLE_LENGTH) {
      setErrorMessage(`Your title exceeds the ${MAX_TITLE_LENGTH}-character limit.`);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[calc(100dvh-65px)] space-y-6 relative">
      
      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header Banner - Green Theme (Layout Matched with JarPage) */}
      <div className="p-4 sm:p-6 rounded-3xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-100 shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-4 sm:gap-5">
          <img
            src="/logo_and_icons/fold_icon.webp"
            alt="Fold"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 drop-shadow-md select-none"
            draggable={false}
          />
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-300/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold tracking-wide uppercase">
              Sanctuary Journal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {draftId ? 'Edit Draft Thought' : 'Fold a Quiet Thought'}
            </h1>
            <p className="text-xs font-medium max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
              Capture raw reflections in your personal space. Keep them tucked in your jar, seal them with a timer, or release them softly into the open sky.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Editor Section */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleFormSubmit}
            className={`rounded-3xl border p-4 sm:p-7 shadow-xs flex flex-col justify-between space-y-6 transition-all duration-500 overflow-hidden ${
              animType === 'fold' ? 'scale-90 opacity-30 rotate-1 blur-xs' : ''
            } ${animType === 'draft' ? 'animate-pulse opacity-70' : ''} ${
              animType === 'seal' ? 'scale-95 brightness-90 animate-bounce' : ''
            }`}
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--card-border)', 
              color: 'var(--text-main)' 
            }}
          >
            <div className={`space-y-4 transition-all duration-500 ${animType === 'fly' ? '-translate-y-12 opacity-0 blur-xs' : ''}`}>
              
              {/* Title Field */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Give your thought a title (optional)..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isAnimating}
                  maxLength={MAX_TITLE_LENGTH}
                  className="w-full text-base font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none bg-transparent border-b pb-3 pr-16 border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                />
                <span className={`absolute right-0 bottom-3 text-[11px] font-mono transition-colors ${
                  title.length >= MAX_TITLE_LENGTH 
                    ? 'text-rose-500 font-bold' 
                    : title.length >= MAX_TITLE_LENGTH * 0.9 
                    ? 'text-amber-500' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {title.length} / {MAX_TITLE_LENGTH}
                </span>
              </div>

              {/* Textarea Field */}
              <div className="relative">
                <textarea
                  rows={13}
                  placeholder="Write your unfiltered thoughts freely here..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isAnimating}
                  className="w-full text-xs sm:text-sm font-serif placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none bg-transparent resize-none leading-relaxed min-h-[260px]"
                />
                <div className={`flex justify-end text-[11px] mt-1 font-mono transition-colors ${
                  wordCount > MAX_WORDS ? 'text-rose-500 font-bold' : wordCount >= MAX_WORDS * 0.9 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {wordCount} / {MAX_WORDS} words
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Visibility Selector Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsVisibilityOpen(!isVisibilityOpen)}
                  disabled={isAnimating}
                  aria-expanded={isVisibilityOpen}
                  aria-haspopup="menu"
                  className={`flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 px-3.5 py-2.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                    visibility === 'anonymous_public'
                      ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/50'
                      : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/50'
                  }`}
                >
                  {visibility === 'anonymous_public' ? (
                    <>
                      <Eye className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400" /> Anonymous Public (Sky)
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 shrink-0 text-purple-600 dark:text-purple-400" /> Private (Jar)
                    </>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1" />
                </button>

                {isVisibilityOpen && (
                  <div 
                    role="menu"
                    className="absolute left-0 bottom-full mb-2 w-64 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
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
                        <div className="font-semibold text-slate-800 dark:text-slate-100">Private (Jar)</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Keep safely inside your personal jar</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setVisibility('anonymous_public');
                        setIsVisibilityOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors text-left border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-sky-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">Anonymous Public (Sky)</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Release as a paper plane into the sky</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                {visibility !== 'anonymous_public' && (
                  <button
                    type="button"
                    onClick={handleSaveAsDraft}
                    disabled={isAnimating}
                    className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all duration-150 flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
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
                      if (title.length > MAX_TITLE_LENGTH) {
                        setErrorMessage(`Your title exceeds the ${MAX_TITLE_LENGTH}-character limit.`);
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
                    className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 sm:py-2 rounded-xl border border-amber-300/50 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all duration-150 flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Seal Letter</span>
                  </button>
                )}

                {/* Primary Green Action Button */}
                <button
                  type="submit"
                  disabled={isAnimating}
                  className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {visibility === 'anonymous_public' ? (
                    <Send className={`w-3.5 h-3.5 transition-transform duration-500 ${
                      animType === 'fly' ? 'translate-x-12 -translate-y-12 scale-125 opacity-0' : ''
                    }`} />
                  ) : (
                    <Archive className={`w-3.5 h-3.5 transition-transform duration-500 ${
                      animType === 'fold' ? 'scale-0 rotate-180 opacity-0' : ''
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

        {/* Side Panels - Layout matched with JarPage Sidebar */}
        <div className="lg:col-span-4 space-y-6">

          {/* Current Mood Box (icons/colors from lib/mood.ts) */}
          <MoodPicker selectedMood={mood} onSelectMood={setMood} />

          {/* Ask Mimi Box */}
          <div 
            className="rounded-3xl border p-5 space-y-4 shadow-xs transition-colors duration-200"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--card-border)', 
              color: 'var(--text-main)' 
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
              <h2 className="text-xs font-bold tracking-wider uppercase opacity-80">Ask Mimi</h2>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 px-2.5 py-0.5 rounded-full font-bold">
                Companion
              </span>
            </div>

            <div className="flex justify-center py-2">
              <img
                src="/mimi/mimi_agent.webp"
                alt="Mimi companion"
                className="w-36 h-36 sm:w-40 sm:h-40 object-contain drop-shadow-md select-none"
                draggable={false}
              />
            </div>
            
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs space-y-1.5">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">Mimi&apos;s Companion Space</p>
              <p className="text-[11px] leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
                Dedicated slot for your custom Mimi agent appearance, interactive companion chat widget, or reflection prompts.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                  Reflection Prompt
                </span>
              </div>
              <p className="text-[11px] italic font-serif leading-relaxed text-slate-700 dark:text-slate-300">
                &quot;What is one small thing that made you pause and feel grateful today?&quot;
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Date Picker Modal */}
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