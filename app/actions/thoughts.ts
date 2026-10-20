'use server'

import { createClient } from '@/utils/supabase/server'
import { getAuthUserId } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { toMood } from '@/lib/mood'
import { DAILY_RELEASE_LIMIT_MESSAGE, type DailyQuota } from '@/lib/quota'
import { getUserQuota } from '@/app/actions/quota'
import type { PublicThought, ThoughtActionResult, ThoughtErrorCode, ThoughtRow, ThoughtStatus, ToggleLikeResult } from '@/lib/thoughts'

const MAX_TITLE_LENGTH = 120
const MAX_CONTENT_LENGTH = 10_000
const PUBLIC_FEED_LIMIT = 100
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface CreateThoughtInput {
  /** Provide to update an existing thought you own (e.g. a draft being edited) instead of inserting. */
  id?: string
  title?: string
  content: string
  mood?: string
  is_private: boolean
  status: ThoughtStatus
  /** ISO date; only meaningful for `sealed` thoughts. */
  seal_until?: string | null
}

export type CreateThoughtResult =
  | { success: true; data: ThoughtRow }
  | { success: false; error: string; code?: ThoughtErrorCode }

const UNAUTHENTICATED = { success: false, error: 'Please sign in to continue.', code: 'UNAUTHENTICATED' } as const

interface DatabaseError {
  code?: string
  message?: string
  details?: string | null
  hint?: string | null
}

const isDevelopment = process.env.NODE_ENV !== 'production'

/** Postgres codes a trigger gets from RAISE EXCEPTION (P0001) or a data exception (22000). */
const RAISED_ERROR_CODES = new Set(['P0001', '22000'])
/** Wording that can only mean "daily limit reached", whatever error code carries it. */
const DAILY_LIMIT_MARKER = /DAILY_RELEASE_LIMIT|DAILY_LIMIT|QUOTA/i
/** Wording that means the same, but is only trusted when it comes with a raised-exception code. */
const DAILY_LIMIT_WORDS = /daily|limit|exceed|too many|per day|plane|release/i

/**
 * True when the database refused a write because the account used up its daily plane releases
 * (the quota trigger, supabase/quotas.sql). It is a normal answer, not a fault, so it is recognised from the code
 * and the wording together instead of one exact message: a reworded trigger must not leak raw SQL to the user.
 * A raised exception while releasing (`status=released`) is the same rule even if its text says nothing useful.
 */
function isDailyLimitError(error: DatabaseError | null, note?: string): boolean {
  if (!error) return false
  const text = [error.message, error.details, error.hint].filter(Boolean).join(' ')
  if (DAILY_LIMIT_MARKER.test(text)) return true
  if (!error.code || !RAISED_ERROR_CODES.has(error.code)) return false
  return DAILY_LIMIT_WORDS.test(text) || !!note?.includes('status=released')
}

/**
 * Logs the full database error on the server and returns the message shown to the user.
 * In development the real cause (Postgres code + message) is appended, so a failure is diagnosable from
 * the toast / modal itself. In production users only see the friendly sentence.
 */
function failure(
  context: string,
  friendly: string,
  error: DatabaseError | null,
  note?: string
): { success: false; error: string; code?: ThoughtErrorCode } {
  // The daily plane limit is a normal answer from the database (trigger in supabase/quotas.sql), not a fault.
  // The reader only ever sees the friendly sentence: no SQL code, no raw message, not even in development.
  if (isDailyLimitError(error, note)) {
    return { success: false, error: DAILY_RELEASE_LIMIT_MESSAGE, code: 'DAILY_LIMIT' }
  }

  console.error(`[thoughts] ${context} failed`, {
    code: error?.code,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    note,
  })

  let reason = friendly
  switch (error?.code) {
    case '23514': // check_violation
    case '22P02': // invalid_text_representation (e.g. a status the database does not know)
      reason = 'This change is not allowed by the database rules. Please run supabase/schema.sql in Supabase.'
      break
    case '42501': // insufficient_privilege (row level security)
      reason = 'The database refused this change (permissions). Please check the Row Level Security policies.'
      break
    case 'PGRST202': // PostgREST: function not found in schema cache
    case '42883': // undefined_function
      reason = 'A database function is missing. Please run supabase/likes.sql and supabase/quotas.sql in Supabase.'
      break
    case 'P0002': // plane not found / not public
      reason = 'This plane is no longer in the sky.'
      break
    case '42703': // undefined_column
    case 'PGRST204': // PostgREST: column not found in schema cache
      reason = 'The database is missing a column. Please run supabase/schema.sql in Supabase.'
      break
  }

  // The technical detail (always in the server log above) is only appended in development, and never for raised
  // exceptions (P0001 / 22000): those are rules of the app, not something a reader should see as SQL.
  const detail = error ? `${error.code ?? 'error'}: ${error.message}` : note
  const showDetail = isDevelopment && !!detail && !(error?.code && RAISED_ERROR_CODES.has(error.code))
  return { success: false, error: showDetail ? `${reason} [${detail}]` : reason }
}

/**
 * True when this browser still carries a Supabase login cookie. If the server cannot confirm that session
 * (expired / invalid), the person must sign in again: they must never be silently treated as a guest.
 * (The PKCE `-code-verifier` cookie only exists during sign-up / email confirmation, so it does not count.)
 */
async function hasSupabaseSessionCookie(): Promise<boolean> {
  return (await cookies())
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token') && !cookie.name.endsWith('-code-verifier'))
}

function revalidateThoughtPages() {
  revalidatePath('/') // the welcome page shows the number of planes in the sky
  revalidatePath('/jar')
  revalidatePath('/sky')
  revalidatePath('/sent-planes')
}

// 1. Save a new Thought / Journal entry (or update one you own when `id` is given)
export async function createThought(data: CreateThoughtInput): Promise<CreateThoughtResult> {
  const userId = await getAuthUserId()
  if (!userId) return UNAUTHENTICATED

  const supabase = await createClient()

  const title = data.title?.trim() || null
  const content = data.content?.trim() ?? ''

  if (!content) return { success: false, error: 'Please write something before saving.' }
  if (content.length > MAX_CONTENT_LENGTH) return { success: false, error: 'This letter is too long to save.' }
  if (title && title.length > MAX_TITLE_LENGTH) return { success: false, error: 'This title is too long.' }
  // Only released planes are public; anything else must stay private.
  if ((data.status === 'released') === data.is_private) {
    return { success: false, error: 'Invalid visibility for this status.' }
  }

  const fields = {
    title,
    content: data.content,
    mood: toMood(data.mood),
    is_private: data.is_private,
    status: data.status,
    seal_until: data.status === 'sealed' ? data.seal_until ?? null : null,
  }

  const query = data.id
    ? supabase.from('thoughts').update(fields).eq('id', data.id).eq('user_id', userId)
    : supabase.from('thoughts').insert([{ ...fields, user_id: userId }])

  const { data: thought, error } = await query.select().single()

  if (error) {
    return failure('createThought', 'We could not save your letter. Please try again.', error, `status=${data.status}`)
  }

  // Refresh page cache to reflect the new data immediately
  revalidateThoughtPages()

  return { success: true, data: thought as ThoughtRow }
}

// 2. Public Paper Planes (The Sky feed). Reads a safe view, so the author's id is never exposed.
export async function getPublicThoughts(): Promise<PublicThought[]> {
  const [supabase, userId] = await Promise.all([createClient(), getAuthUserId()])

  // The feed, "which planes are mine?" and "which have I liked?" are independent, so they run at the same time.
  // Guests are read-only: they have no account, so there is nothing of theirs to look up.
  const [{ data, error }, mine, liked] = await Promise.all([
    supabase
      .from('public_thoughts')
      .select('id, title, content, mood, likes, created_at')
      .order('created_at', { ascending: false })
      .limit(PUBLIC_FEED_LIMIT),
    userId
      ? supabase.from('thoughts').select('id').eq('user_id', userId).eq('status', 'released')
      : Promise.resolve({ data: null }),
    // liked_thought_ids() takes no arguments: the database reads the account from auth.uid().
    userId ? supabase.rpc('liked_thought_ids') : Promise.resolve({ data: null, error: null }),
  ])

  if (error) {
    console.error('Error fetching public thoughts:', error)
    return []
  }

  // RLS only returns the caller's own rows in the second query.
  const ownedIds = new Set((mine.data ?? []).map((row: { id: string }) => row.id))

  // Never break the sky over hearts: if the likes feature isn't installed yet, planes just show as not liked.
  if (liked.error) console.error('[thoughts] liked_thought_ids failed', { code: liked.error.code, message: liked.error.message })
  const likedIds = new Set<string>((liked.data as string[] | null) ?? [])

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string | null) || 'Untitled Thought',
    content: row.content as string,
    mood: (row.mood as string | null) || 'peaceful',
    likes: (row.likes as number | null) ?? 0,
    createdAt: row.created_at as string,
    isOwner: ownedIds.has(row.id as string),
    likedByMe: likedIds.has(row.id as string),
  }))
}

// 3. The signed-in user's private Jar entries (drafts, kept, sealed, opened).
//    Always filtered by the session's account id; Row Level Security (user_id = auth.uid()) enforces it again in the database.
export async function getUserJarThoughts(): Promise<ThoughtRow[]> {
  const userId = await getAuthUserId()
  if (!userId) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_private', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jar thoughts:', error)
    return []
  }

  return (data ?? []) as ThoughtRow[]
}

export interface SealedCapsule {
  id: string
  title: string | null
  sealUntil: string
}

// Sealed time capsules of the signed-in account (lean: no content), oldest unlock date first
export async function getSealedCapsules(): Promise<SealedCapsule[]> {
  const userId = await getAuthUserId()
  if (!userId) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('thoughts')
    .select('id, title, seal_until')
    .eq('user_id', userId)
    .eq('status', 'sealed')
    .not('seal_until', 'is', null)
    .order('seal_until', { ascending: true })

  if (error) {
    console.error('Error fetching sealed capsules:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string | null) ?? null,
    sealUntil: row.seal_until as string,
  }))
}

// 4. Move a thought between states: open a sealed letter, release to the Sky, or pull a plane back to the Jar.
export async function changeThoughtStatus(id: string, status: ThoughtStatus): Promise<ThoughtActionResult> {
  const userId = await getAuthUserId()
  if (!userId) return UNAUTHENTICATED

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('thoughts')
    .update({ status, is_private: status !== 'released' })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')

  if (error) {
    return failure('changeThoughtStatus', 'We could not update this letter. Please try again.', error, `status=${status}`)
  }
  if (!data?.length) {
    // No error but nothing changed: the id does not belong to this user, or no UPDATE policy lets them change it
    return failure(
      'changeThoughtStatus',
      'We could not update this letter. Please try again.',
      null,
      `0 rows updated (id=${id}, status=${status}): wrong owner or no UPDATE policy`
    )
  }

  revalidateThoughtPages()

  // A release (including sending a kept letter from the Jar) just used one of the day's planes: read the real count
  // back, so the "Sent Planes" counter changes on screen at once. Never let this read fail a release that worked.
  let quota: DailyQuota | null = null
  if (status === 'released') {
    try {
      quota = (await getUserQuota())?.release ?? null
    } catch (quotaError) {
      console.error('[thoughts] could not read the release quota after releasing', quotaError)
    }
  }
  return { success: true, quota }
}

// 5. Permanently delete a thought you own (from the Jar or a sent plane).
export async function deleteThought(id: string): Promise<ThoughtActionResult> {
  const userId = await getAuthUserId()
  if (!userId) return UNAUTHENTICATED

  const supabase = await createClient()

  const { data, error } = await supabase.from('thoughts').delete().eq('id', id).eq('user_id', userId).select('id')

  if (error) {
    return failure('deleteThought', 'We could not delete this letter. Please try again.', error)
  }
  if (!data?.length) {
    return failure('deleteThought', 'We could not delete this letter. Please try again.', null, `0 rows deleted (id=${id}): wrong owner or no DELETE policy`)
  }

  revalidateThoughtPages()
  return { success: true }
}

// 6. Like (or unlike) a released plane. Signed-in accounts only: guests are read-only.
//    The database keeps one like per account per plane (UNIQUE (thought_id, user_id)) and returns the real total.
//    The account is always read from the session by the database function (auth.uid()), never from the client.
export async function toggleThoughtLike(thoughtId: string): Promise<ToggleLikeResult> {
  if (!UUID_PATTERN.test(thoughtId)) return { success: false, error: 'This plane cannot be liked.' }

  const userId = await getAuthUserId()
  if (!userId) {
    // A login cookie exists but the server cannot confirm it: the session ran out, so ask to sign in again.
    if (await hasSupabaseSessionCookie()) {
      return { success: false, error: 'Your session has expired. Please sign in again to like planes.', code: 'UNAUTHENTICATED' }
    }
    return { success: false, error: 'Please sign in to like planes.', code: 'UNAUTHENTICATED' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('toggle_thought_like', { p_thought_id: thoughtId })
  const row = (data as { liked: boolean; likes: number }[] | null)?.[0]

  if (error || !row) {
    return failure('toggleThoughtLike', 'We could not save your like. Please try again.', error, 'no result row')
  }

  // Refresh the cached pages so the new total and this reader's liked state show up everywhere:
  // The Sky (hearts and counts) and the owner's Sent Planes (their plane's like total).
  revalidatePath('/sky')
  revalidatePath('/sent-planes')
  return { success: true, liked: row.liked, likes: row.likes }
}

// 7. Read marks for The Sky. Which planes this account has already opened, saved per account in the database
//    (public.user_thought_reads), so they stay "Read" after a refresh, a sign-out and a sign-in, or on another device.
//    Both functions take no account id: the database reads it from auth.uid() (the session cookie), never from the client.

/** Ids of the planes the signed-in reader has opened. Empty for guests, and if the feature is not installed yet. */
export async function getReadThoughtIds(): Promise<string[]> {
  const userId = await getAuthUserId()
  if (!userId) return []

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('read_thought_ids')

  // Never break the sky over read marks: on failure the planes simply show as unread.
  if (error) {
    console.error('[thoughts] read_thought_ids failed', { code: error.code, message: error.message })
    return []
  }

  // `RETURNS SETOF uuid` arrives as a plain array of ids; also tolerate one-column rows.
  const ids = (Array.isArray(data) ? data : []).map((item: unknown) =>
    typeof item === 'object' && item !== null ? Object.values(item)[0] : item
  )
  return ids.filter((id): id is string => typeof id === 'string' && UUID_PATTERN.test(id))
}

/** Saves that the signed-in reader opened a plane. Safe to repeat: the database ignores a plane already marked. */
export async function markThoughtRead(thoughtId: string): Promise<ThoughtActionResult> {
  if (typeof thoughtId !== 'string' || !UUID_PATTERN.test(thoughtId)) {
    return { success: false, error: 'This plane cannot be marked as read.' }
  }

  const userId = await getAuthUserId()
  if (!userId) return UNAUTHENTICATED

  const supabase = await createClient()
  const { error } = await supabase.rpc('mark_thought_read', { p_thought_id: thoughtId })
  if (error) {
    return failure('markThoughtRead', 'We could not save that you read this plane.', error)
  }

  // No revalidatePath here on purpose: the page already shows the plane as read, and refreshing it
  // would reshuffle the sky under the reader's cursor.
  return { success: true }
}