import type { Letter, LetterStatus } from '@/types/letter';
import { toMood } from '@/lib/mood';
import type { DailyQuota } from '@/lib/quota';

/** Status values stored in `public.thoughts.status`. ("folded" is the DB name for the UI's "kept".) */
export type ThoughtStatus = 'draft' | 'folded' | 'sealed' | 'opened' | 'released';

/** A full row of `public.thoughts` (owner-only: includes `user_id`). */
export interface ThoughtRow {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood: string | null;
  is_private: boolean;
  status: ThoughtStatus;
  seal_until: string | null;
  likes: number;
  created_at: string;
  updated_at: string;
}

/** A paper plane as exposed to readers of The Sky. Never contains the author's id. */
export interface PublicThought {
  id: string;
  title: string;
  content: string;
  mood: string;
  likes: number;
  createdAt: string;
  /** True when the signed-in reader wrote this plane. */
  isOwner: boolean;
  /** True when the signed-in reader has liked the plane. Always false for guests (read-only). */
  likedByMe: boolean;
}

/** Machine-readable reason attached to a failed action, so the UI can react without reading the message text. */
export type ThoughtErrorCode = 'UNAUTHENTICATED' | 'DAILY_LIMIT';

/** Result of liking / unliking a plane: the new state and the real total from the database. */
export type ToggleLikeResult =
  | { success: true; liked: boolean; likes: number }
  | { success: false; error: string; code?: ThoughtErrorCode };

/**
 * Result shape shared by the mutation server actions.
 * After a release, `quota` is the account's release count read back from the database, so the UI can show it at once.
 */
export type ThoughtActionResult =
  | { success: true; quota?: DailyQuota | null }
  | { success: false; error: string; code?: ThoughtErrorCode };

/** UI status ("kept") -> database status ("folded"). */
export const toThoughtStatus = (status: LetterStatus): ThoughtStatus => {
  switch (status) {
    case 'kept':
    case 'unpublished':
      return 'folded';
    default:
      return status;
  }
};

/**
 * Database status -> UI status. "folded" is the database name for "kept". An opened sealed letter becomes
 * "kept" too, so rows opened before that rule existed (status "opened") also appear on the Kept shelf.
 */
export const toLetterStatus = (status: ThoughtStatus): LetterStatus =>
  status === 'folded' || status === 'opened' ? 'kept' : status;

/** Maps an owner's `thoughts` row onto the `Letter` shape the Jar UI already renders. */
export const thoughtToLetter = (row: ThoughtRow): Letter => ({
  id: row.id,
  userId: row.user_id,
  title: row.title ?? undefined,
  content: row.content,
  mood: toMood(row.mood ?? undefined),
  status: toLetterStatus(row.status),
  visibility: row.is_private ? 'private' : 'anonymous_public',
  sealUntil: row.seal_until ?? undefined,
  likes: row.likes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});