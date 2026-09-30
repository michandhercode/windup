export type LetterStatus = 'draft' | 'kept' | 'sealed' | 'opened' | 'released' | 'unpublished';

export type Visibility = 'private' | 'anonymous_public' | 'sealed';

export type Mood = 'peaceful' | 'reflective' | 'nostalgic' | 'heavy' | 'hopeful' | 'quiet';

export interface Letter {
  id: string;
  userId?: string;
  title?: string;
  content: string;
  mood?: Mood;
  status: LetterStatus;
  visibility: Visibility;
  sealUntil?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface MimiReflection {
  reflection: string;
  theme?: string;
  question?: string;
}