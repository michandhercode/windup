export type LetterStatus = 'draft' | 'kept' | 'sealed' | 'opened' | 'released' | 'unpublished';

export type Visibility = 'private' | 'anonymous_public' | 'sealed';

export type Mood = 'neutral' | 'peaceful' | 'reflective' | 'nostalgic' | 'heavy' | 'hopeful';

export interface Letter {
  id: string;
  userId?: string;
  title?: string;
  content: string;
  mood?: Mood;
  status: LetterStatus;
  visibility: Visibility;
  sealUntil?: string; // ISO date string
  /** Likes / "Resonated" count for a released paper plane. Single source of truth for The Sky and Sent Planes. */
  likes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MimiReflection {
  reflection: string;
  theme?: string;
  question?: string;
}