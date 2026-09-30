'use client';

import { useState } from 'react';
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
  Archive
} from 'lucide-react';

export default function FoldPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('peaceful');
  const [visibility, setVisibility] = useState<'private' | 'anonymous_public'>('private');
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [animType, setAnimType] = useState<'fly' | 'fold' | null>(null);

  const moods = [
    { id: 'peaceful', label: 'Peaceful', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-800/60 hover:bg-emerald-500/20', activeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20', icon: Feather },
    { id: 'reflective', label: 'Reflective', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/50 dark:border-sky-800/60 hover:bg-sky-500/20', activeBg: 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20', icon: BookOpen },
    { id: 'nostalgic', label: 'Nostalgic', color: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300/50 dark:border-amber-800/60 hover:bg-amber-500/20', activeBg: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20', icon: Clock },
    { id: 'heavy', label: 'Heavy', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/50 dark:border-purple-800/60 hover:bg-purple-500/20', activeBg: 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20', icon: CloudRain },
    { id: 'hopeful', label: 'Hopeful', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300/50 dark:border-rose-800/60 hover:bg-rose-500/20', activeBg: 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20', icon: HeartHandshake },
  ];

  const handleFoldAndRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isAnimating) return;

    setIsAnimating(true);
    const currentType = visibility === 'anonymous_public' ? 'fly' : 'fold';
    setAnimType(currentType);

    setTimeout(() => {
      setSuccessMessage(
        visibility === 'anonymous_public'
          ? 'Your paper plane has drifted softly into the sky.'
          : 'Your letter has been safely folded and kept in your jar.'
      );
      
      setTitle('');
      setContent('');
      setIsAnimating(false);
      setAnimType(null);

      setTimeout(() => setSuccessMessage(''), 4000);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div 
        className="p-6 rounded-3xl border shadow-sm space-y-2 backdrop-blur-sm transition-colors duration-200"
        style={{ 
          backgroundColor: 'var(--banner-bg)', 
          borderColor: 'var(--banner-border)', 
          color: 'var(--banner-text)' 
        }}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Sanctuary Journal
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Fold a quiet thought
        </h1>
        <p className="text-xs font-medium max-w-2xl leading-relaxed opacity-90" style={{ color: 'var(--banner-sub)' }}>
          Capture raw reflections in your personal space. Keep them tucked in your jar or release them softly into the open sky.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Journal Workspace */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleFoldAndRelease}
            className={`rounded-3xl border shadow-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-500 overflow-hidden ${
              animType === 'fold' ? 'scale-90 opacity-30 rotate-1 blur-sm' : ''
            }`}
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--card-border)', 
              color: 'var(--text-main)' 
            }}
          >
            <div className={`space-y-4 transition-all duration-500 ${animType === 'fly' ? '-translate-y-12 opacity-0 blur-sm' : ''}`}>
              <input
                type="text"
                placeholder="Give your thought a title (optional)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isAnimating}
                className="w-full text-lg font-semibold placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none bg-transparent border-b pb-3 focus:border-amber-500 transition-colors"
                style={{ borderColor: 'var(--card-border)' }}
              />

              <textarea
                rows={14}
                placeholder="Write your unfiltered thoughts freely here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isAnimating}
                className="w-full text-sm placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none bg-transparent resize-none leading-relaxed font-normal min-h-[280px]"
                required
              />
            </div>

            <div className="pt-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3" style={{ borderColor: 'var(--card-border)' }}>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsVisibilityOpen(!isVisibilityOpen)}
                  disabled={isAnimating}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 active:scale-95 ${
                    visibility === 'anonymous_public'
                      ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/50 dark:border-sky-800/60'
                      : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/50 dark:border-purple-800/60'
                  }`}
                >
                  {visibility === 'anonymous_public' ? (
                    <>
                      <Eye className="w-3.5 h-3.5 shrink-0" /> Anonymous Public (Sky)
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 shrink-0" /> Private (Jar)
                    </>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1" />
                </button>

                {isVisibilityOpen && (
                  <div 
                    className="absolute left-0 bottom-full mb-2 w-64 border backdrop-blur-lg rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setVisibility('private');
                        setIsVisibilityOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-500/10 transition-colors text-left"
                    >
                      <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Private (Jar)</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Keep safely inside your personal jar</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVisibility('anonymous_public');
                        setIsVisibilityOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-500/10 transition-colors text-left border-t"
                      style={{ borderColor: 'var(--card-border)' }}
                    >
                      <Eye className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Anonymous Public (Sky)</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Release as a paper plane into the sky</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isAnimating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 overflow-hidden group"
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
          </form>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-5">
          
          <div 
            className="rounded-3xl border shadow-md p-5 space-y-3.5"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                Current Mood / Vibe
              </label>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Select one</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => {
                const Icon = m.icon;
                const isSelected = mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border active:scale-95 ${
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

          <div 
            className="rounded-3xl border shadow-md p-5 space-y-4"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h2 className="text-xs font-bold tracking-wider uppercase">Ask Mimi</h2>
              </div>
              <span className="text-[10px] bg-sky-500/20 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full font-bold">
                Companion
              </span>
            </div>
            
            <div className="p-4 rounded-2xl bg-stone-500/5 border text-xs space-y-2" style={{ borderColor: 'var(--card-border)' }}>
              <p className="font-bold">Mimi's Companion Space</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Dedicated slot for your custom Mimi agent appearance, interactive companion chat widget, or reflection prompts.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-md inline-block">
                  Reflection Prompt
                </span>
              </div>
              <p className="text-[11px] italic font-medium leading-relaxed opacity-90">
                "What is one small thing that made you pause and feel grateful today?"
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}