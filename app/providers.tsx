'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from 'next-themes';
import { Letter } from '@/types/letter';

interface LetterContextType {
  letters: Letter[];
  setLetters: React.Dispatch<React.SetStateAction<Letter[]>>;
  addLetter: (letter: Omit<Letter, "id" | "createdAt" | "updatedAt"> & { id?: string; mood?: string | undefined }) => void;
  updateLetter: (id: string, updatedFields: Partial<Letter>) => void;
  getLetterById: (id: string) => Letter | undefined;
  displayName: string;
  setDisplayName: (name: string) => void;
}

const LetterContext = createContext<LetterContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [displayName, setDisplayName] = useState<string>('Anonymous Scribe');

  useEffect(() => {
    // Kunin ang nakasave na letters mula sa localStorage
    const savedLetters = localStorage.getItem("windup_letters");
    if (savedLetters) {
      try {
        setLetters(JSON.parse(savedLetters));
      } catch (e) {
        console.error("Failed to parse letters from localStorage", e);
      }
    }

    // Kunin ang nakasave na display name mula sa localStorage
    const savedName = localStorage.getItem("windup_display_name");
    if (savedName) {
      setDisplayName(savedName);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("windup_letters", JSON.stringify(letters));
  }, [letters]);

  // Function para i-update at i-save sa localStorage ang display name
  const handleSetDisplayName = (name: string) => {
    setDisplayName(name);
    localStorage.setItem("windup_display_name", name);
  };

  const addLetter = (letterData: Omit<Letter, "id" | "createdAt" | "updatedAt"> & { id?: string; mood?: string | undefined }) => {
    const now = new Date().toISOString();
    const finalMood = letterData.mood || 'neutral';
    const incomingId = letterData.id;

    setLetters((prev) => {
      // UPSERT: if a letter with this id already exists, update it in place
      if (incomingId && prev.some((l) => l.id === incomingId)) {
        return prev.map((l) =>
          l.id === incomingId
            ? {
                ...l,
                ...letterData,
                id: l.id,
                mood: finalMood as any,
                createdAt: l.createdAt,
                updatedAt: now,
              }
            : l
        );
      }

      // Otherwise create a brand new entry
      const newLetter: Letter = {
        ...letterData,
        mood: finalMood as any,
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