'use client';

import { Lightbulb } from 'lucide-react';

interface MimiPanelProps {
  prompt?: string;
}

export default function MimiPanel({ 
  prompt = '"What is one small thing that made you pause and feel grateful today?"' 
}: MimiPanelProps) {
  return (
    <div 
      className="rounded-3xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md p-5 space-y-4"
      style={{ backgroundColor: 'var(--card-bg, #ffffff)', borderColor: 'var(--card-border, rgba(229, 231, 235, 0.8))' }}
    >
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3" style={{ borderColor: 'var(--card-border, rgba(229, 231, 235, 0.8))' }}>
        <h2 className="text-xs font-bold tracking-wider uppercase text-stone-800 dark:text-stone-100">ASK MIMI</h2>
        <span className="text-[10px] bg-sky-500/20 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full font-bold">
          Companion
        </span>
      </div>

      {/* Featured Mimi agent display */}
      <div className="flex justify-center">
        <img
          src="/mimi/mimi_agent.webp"
          alt="Mimi, your companion agent"
          className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-lg select-none"
          draggable={false}
        />
      </div>
      
      <div className="p-4 rounded-2xl bg-stone-500/5 border border-stone-200/80 dark:border-zinc-800 text-xs space-y-2" style={{ borderColor: 'var(--card-border, rgba(229, 231, 235, 0.8))' }}>
        <p className="font-bold text-stone-800 dark:text-stone-200">Mimi's Companion Space</p>
        <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400" style={{ color: 'var(--text-muted)' }}>
          Dedicated slot for your custom Mimi agent appearance, interactive companion chat widget, or reflection prompts.
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-md inline-block">
            REFLECTION PROMPT
          </span>
        </div>
        <p className="text-[11px] italic font-medium leading-relaxed text-stone-800 dark:text-stone-200 opacity-90">
          {prompt}
        </p>
      </div>
    </div>
  );
}