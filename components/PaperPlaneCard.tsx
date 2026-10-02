'use client';

import { Search } from 'lucide-react';

interface PaperPlaneCardProps {
  plane: {
    id: string;
    title: string;
    content: string;
    mood?: string;
    likes?: number;
    createdAt?: string;
  };
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function PaperPlaneCard({ plane, onClick, style }: PaperPlaneCardProps) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-sky-200/60 dark:border-sky-800/50 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 text-slate-700 dark:text-slate-200"
    >
      <div className="p-1 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-500">
        <img src="/logo_and_icons/users_plane.webp" alt="" className="w-5 h-5 object-contain" />
      </div>
      
      <span className="text-xs font-semibold max-w-[140px] sm:max-w-[180px] truncate">
        {plane.title || plane.content}
      </span>

      <Search className="w-3 h-3 text-sky-400 opacity-60 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}