'use client';

import { Letter } from '@/types/letter';

interface LetterCardProps {
  letter: Letter;
  onClick?: () => void;
}

export default function LetterCard({ letter, onClick }: LetterCardProps) {
  const isSealed = letter.status === 'sealed';

  // Prevent opening sealed letters
  const handleClick = () => {
    if (isSealed) return;
    onClick?.();
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-5 rounded-lg border border-[var(--border)] bg-[var(--card)] transition-all shadow-sm ${
        isSealed 
          ? 'opacity-75 cursor-not-allowed' 
          : 'hover:border-[var(--primary)] hover:shadow-md cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-[var(--foreground)]">
          {letter.title || 'Untitled Letter'}
        </h3>
        {letter.mood && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] capitalize">
            {letter.mood}
          </span>
        )}
      </div>

      {/* Hide content preview if sealed */}
      <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 mb-4 leading-relaxed">
        {isSealed ? 'This letter is sealed until its specified date.' : letter.content}
      </p>

      {/* Card footer details */}
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3">
        <span>
          {isSealed && letter.sealUntil
            ? `Sealed until ${new Date(letter.sealUntil).toLocaleDateString()}`
            : new Date(letter.createdAt).toLocaleDateString()}
        </span>
        <span className="capitalize font-medium text-[var(--primary)]">
          {letter.status}
        </span>
      </div>
    </div>
  );
}