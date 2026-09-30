'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_JAR_LETTERS } from '@/lib/mock-letters';
import LetterCard from '@/components/LetterCard';
import { Letter, LetterStatus } from '@/types/letter';
import { Archive, Lock, FileText, Sparkles, Box, Layers, X } from 'lucide-react';

export default function JarPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | LetterStatus>('all');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  const filteredLetters = MOCK_JAR_LETTERS.filter((letter) => {
    if (filter === 'all') return true;
    return letter.status === filter;
  });

  const countByStatus = (status: 'all' | LetterStatus) => {
    if (status === 'all') return MOCK_JAR_LETTERS.length;
    return MOCK_JAR_LETTERS.filter((l) => l.status === status).length;
  };

  // Handle letter click based on status
  const handleLetterClick = (letter: Letter) => {
    if (letter.status === 'draft') {
      // Redirect drafts to editor page
      router.push(`/fold?draftId=${letter.id}`);
    } else if (letter.status === 'kept') {
      // Open kept letters in modal
      setSelectedLetter(letter);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-screen space-y-6">
      
      {/* Header Banner - Distinct Rosewood / Terracotta Theme */}
      <div className="p-6 rounded-3xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 shadow-xs transition-colors duration-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-[11px] font-bold tracking-wide uppercase">
            <Archive className="w-3.5 h-3.5" />
            Private Vault
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-rose-900 dark:text-rose-100">
            My Jar
          </h1>
          <p className="text-xs font-medium max-w-2xl leading-relaxed text-rose-700/90 dark:text-rose-300/80">
            Your private safe haven for drafts, kept thoughts, and sealed time-capsules. Select a category from your shelf to browse.
          </p>
        </div>
      </div>

      {/* Main Vault Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Memory Shelf */}
        <div 
          className="lg:col-span-4 rounded-3xl border p-5 space-y-4 shadow-xs transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderColor: 'var(--card-border)', 
            color: 'var(--text-main)' 
          }}
        >
          {/* Shelf Header */}
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
            <Box className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xs font-bold tracking-wider uppercase opacity-80">The Memory Shelf</h2>
          </div>

          {/* Clean Shelf Items */}
          <div className="space-y-3">
            
            {/* Shelf 1: All Entries */}
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

            {/* Shelf 2: Drafts */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setFilter('draft')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 ${
                  filter === 'draft'
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-900 dark:text-sky-200 font-bold shadow-xs'
                    : 'hover:bg-stone-500/5 border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ borderColor: filter === 'draft' ? undefined : 'var(--card-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-700 dark:text-sky-300">
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

            {/* Shelf 3: Kept */}
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
                    <Archive className="w-4 h-4" />
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

            {/* Shelf 4: Sealed */}
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

        {/* Letters Grid Display */}
        <div className="lg:col-span-8 space-y-4">
          {filteredLetters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLetters.map((letter) => (
                <LetterCard 
                  key={letter.id} 
                  letter={letter} 
                  onClick={() => handleLetterClick(letter)}
                />
              ))}
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

      {/* Read Modal for Kept Letters */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg p-6 rounded-3xl border shadow-xl space-y-4"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--card-border)', 
              color: 'var(--text-main)' 
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="font-bold text-base">{selectedLetter.title || 'Untitled Letter'}</h3>
                {selectedLetter.mood && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-500/10 capitalize text-rose-600 font-medium">
                    {selectedLetter.mood}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedLetter(null)} 
                className="p-1 rounded-full hover:bg-stone-500/10 opacity-70 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 text-sm leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto opacity-90">
              {selectedLetter.content}
            </div>

            <div className="text-right border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
              <button
                onClick={() => setSelectedLetter(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-stone-500/10 hover:bg-stone-500/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}