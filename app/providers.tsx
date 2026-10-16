'use client';

import React, { createContext, useContext, useCallback } from "react";
import { ThemeProvider } from 'next-themes';
import { Letter } from '@/types/letter';
import { useLocalStorageItem, setLocalStorageItem } from '@/lib/hooks/useLocalStorage';

const DISPLAY_NAME_KEY = 'windup_display_name';

/** Fields the caller provides when saving a letter. `mood` may be any string; it is normalised to a valid Mood. */
export type NewLetterInput = Omit<Letter, 'id' | 'createdAt' | 'updatedAt' | 'mood'> & {
  id?: string;
  mood?: string;
};

interface LetterContextType {
  letters: Letter[];
  setLetters: React.Dispatch<React.SetStateAction<Letter[]>>;
  addLetter: (letter: NewLetterInput) => void;
  updateLetter: (id: string, updatedFields: Partial<Letter>) => void;
  getLetterById: (id: string) => Letter | undefined;
  displayName: string;
  setDisplayName: (name: string) => void;
}

const LetterContext = createContext<LetterContextType | undefined>(undefined);

/**
 * The old browser-wide letter store (`windup_letters`) is retired. It was shared by every account and guest on
 * the device, so letters written under one account could show up under another. Every letter now lives in
 * Supabase and is fetched per account (`user_id = auth.uid()`). The `letters` API below stays only so existing
 * screens keep compiling: it is always empty, and writes are ignored.
 */
const NO_LETTERS: Letter[] = [];

export function Providers({ children }: { children: React.ReactNode }) {
  const displayName = useLocalStorageItem(DISPLAY_NAME_KEY) || 'Anonymous Scribe';

  const setLetters = useCallback<React.Dispatch<React.SetStateAction<Letter[]>>>(() => {}, []);

  const handleSetDisplayName = (name: string) => {
    setLocalStorageItem(DISPLAY_NAME_KEY, name);
  };

  const addLetter = () => {};
  const updateLetter = () => {};
  const getLetterById = (): Letter | undefined => undefined;

  // First visit is always Light Mode (OS dark preference is ignored). A manual choice from the
  // Navbar toggle is saved to localStorage (key: "theme") by next-themes and wins on later visits.
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <LetterContext.Provider value={{ letters: NO_LETTERS, setLetters, addLetter, updateLetter, getLetterById, displayName, setDisplayName: handleSetDisplayName }}>
        {children}
      </LetterContext.Provider>
    </ThemeProvider>
  );
}

export const useLetters = () => {
  const context = useContext(LetterContext);
  if (!context) {
    throw new Error("useLetters must be used within a LetterProvider");
  }
  return context;
};