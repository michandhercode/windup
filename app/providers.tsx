'use client';

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { ThemeProvider } from 'next-themes';
import { Letter } from '@/types/letter';
import { toMood } from '@/lib/mood';
import { useLocalStorageItem, setLocalStorageItem } from '@/lib/hooks/useLocalStorage';

const LETTERS_KEY = 'windup_letters';
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

const parseLetters = (raw: string | null): Letter[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Letter[]) : [];
  } catch (e) {
    console.error("Failed to parse letters from localStorage", e);
    return [];
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  // localStorage is the source of truth; useLocalStorageItem keeps React in sync with it
  // (and returns null on the server, so hydration always matches).
  const rawLetters = useLocalStorageItem(LETTERS_KEY);
  const letters = useMemo(() => parseLetters(rawLetters), [rawLetters]);
  const displayName = useLocalStorageItem(DISPLAY_NAME_KEY) || 'Anonymous Scribe';

  // Same signature as a useState setter (value or updater), persisted straight to localStorage.
  const setLetters = useCallback<React.Dispatch<React.SetStateAction<Letter[]>>>((action) => {
    const current = parseLetters(localStorage.getItem(LETTERS_KEY));
    const next = typeof action === 'function' ? action(current) : action;
    setLocalStorageItem(LETTERS_KEY, JSON.stringify(next));
  }, []);

  const handleSetDisplayName = (name: string) => {
    setLocalStorageItem(DISPLAY_NAME_KEY, name);
  };

  const addLetter = (letterData: NewLetterInput) => {
    const now = new Date().toISOString();
    const { id: incomingId, mood: rawMood, ...rest } = letterData;
    const mood = toMood(rawMood);

    setLetters((prev) => {
      // UPSERT: if a letter with this id already exists, update it in place
      if (incomingId && prev.some((l) => l.id === incomingId)) {
        return prev.map((l) =>
          l.id === incomingId
            ? { ...l, ...rest, mood, createdAt: l.createdAt, updatedAt: now }
            : l
        );
      }

      // Otherwise create a brand new entry
      const newLetter: Letter = {
        ...rest,
        mood,
        id: incomingId || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
        createdAt: now,
        updatedAt: now,
      };
      return [newLetter, ...prev];
    });
  };

  const updateLetter = (id: string, updatedFields: Partial<Letter>) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updatedFields, updatedAt: new Date().toISOString() } : l))
    );
  };

  const getLetterById = (id: string) => {
    return letters.find((l) => l.id === id);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LetterContext.Provider value={{ letters, setLetters, addLetter, updateLetter, getLetterById, displayName, setDisplayName: handleSetDisplayName }}>
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