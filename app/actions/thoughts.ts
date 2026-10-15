'use server'

import { createClient } from '@/utils/supabase/server'
import { getAuthUserId } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { toMood } from '@/lib/mood'
import type { PublicThought, ThoughtActionResult, ThoughtRow, ThoughtStatus, ToggleLikeResult } from '@/lib/thoughts'

const MAX_TITLE_LENGTH = 120
const MAX_CONTENT_LENGTH = 10_000
const PUBLIC_FEED_LIMIT = 100
// Guests have no account, so the server gives each browser a random id (httpOnly cookie) to tell likes apart.
const GUEST_COOKIE = 'windup_guest_id'
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
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
  | { success: false; error: string; code?: 'UNAUTHENTICATED' }

const UNAUTHENTICATED = { success: false, error: 'Please sign in to continue.', code: 'UNAUTHENTICATED' } as const

interface DatabaseError {
  code?: string
  message?: string
  details?: string | null
  hint?: string | null
}

const isDevelopment = process.env.NODE_ENV !== 'production'

/**
 * Logs the full database error on the server and returns the message shown to the user.
 * In development the real cause (Postgres code + message) is appended, so a failure is diagnosable from
 * the toast / modal itself. In production users only see the friendly sentence.
 */
function failure(context: string, friendly: string, error: DatabaseError | null, note?: string): { success: false; error: string } {
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
      reason = 'The likes feature is not set up in the database. Please run supabase/likes.sql in Supabase.'
      break
    case 'P0002': // plane not found / not public
      reason = 'This plane is no longer in the sky.'
      break
    case '42703': // undefined_column
    case 'PGRST204': // PostgREST: column not found in schema cache
      reason = 'The database is missing a column. Please run supabase/schema.sql in Supabase.'
      break
  }

  const detail = error ? `${error.code ?? 'error'}: ${error.message}` : note
  return { success: false, error: isDevelopment && detail ? `${reason} [${detail}]` : reason }
}

async function readGuestId(): Promise<string | null> {
  const value = (await cookies()).get(GUEST_COOKIE)?.value
  return value && UUID_PATTERN.test(value) ? value : null
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
  // A signed-in reader is identified by the account only; the guest cookie is for signed-out visitors.
  const guestId = userId ? null : await readGuestId()

  // The feed, "which planes are mine?" and "which have I liked?" are independent, so they run at the same time.
  const [{ data, error }, mine, liked] = await Promise.all([
    supabase
      .from('public_thoughts')
      .select('id, title, content, mood, likes, created_at')
      .order('created_at', { ascending: false })
      .limit(PUBLIC_FEED_LIMIT),
    userId
      ? supabase.from('thoughts').select('id').eq('user_id', userId).eq('status', 'released')
      : Promise.resolve({ data: null }),
    supabase.rpc('liked_thought_ids', { p_guest_id: guestId }),
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

// 3. The signed-in user's private Jar entries (drafts, kept, sealed, opened)
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
  return { success: true }
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

// 6. Like (or unlike) a released plane. Works for signed-in users and for guests, on your own planes too.
//    The database keeps one like per person per plane and returns the real total.
//    A signed-in user is ALWAYS identified by their Supabase account (auth.uid() inside the database function);
//    the guest cookie is only ever read or created when there is no login at all.
export async function toggleThoughtLike(thoughtId: string): Promise<ToggleLikeResult> {
  if (!UUID_PATTERN.test(thoughtId)) return { success: false, error: 'This plane cannot be liked.' }

  const userId = await getAuthUserId()

  let guestId: string | null = null
  if (!userId) {
    // A login cookie exists but the server cannot confirm it: ask to sign in again instead of liking as a guest.
    if (await hasSupabaseSessionCookie()) {
      return { success: false, error: 'Your session has expired. Please sign in again to like planes.' }
    }

    // Truly signed out: guests are identified by a random id kept in a cookie (created on their first like)
    guestId = await readGuestId()
    if (!guestId) {
      guestId = crypto.randomUUID()
      ;(await cookies()).set(GUEST_COOKIE, guestId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: GUEST_COOKIE_MAX_AGE,
      })
    }
  }

  const supabase = await createClient()
  // Signed in: p_guest_id is null, so the database can only use auth.uid(). Signed out: the guest id.
  const { data, error } = await supabase.rpc('toggle_thought_like', { p_thought_id: thoughtId, p_guest_id: guestId })
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