'use server'

import { createClient } from '@/utils/supabase/server'
import { getAuthUserId } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { toMood } from '@/lib/mood'
import type { PublicThought, ThoughtActionResult, ThoughtRow, ThoughtStatus } from '@/lib/thoughts'

const MAX_TITLE_LENGTH = 120
const MAX_CONTENT_LENGTH = 10_000
const PUBLIC_FEED_LIMIT = 100

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

function revalidateThoughtPages() {
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
    console.error('Error saving thought:', error)
    return { success: false, error: 'We could not save your letter. Please try again.' }
  }

  // Refresh page cache to reflect the new data immediately
  revalidateThoughtPages()

  return { success: true, data: thought as ThoughtRow }
}

// 2. Public Paper Planes (The Sky feed). Reads a safe view, so the author's id is never exposed.
export async function getPublicThoughts(): Promise<PublicThought[]> {
  const [supabase, userId] = await Promise.all([createClient(), getAuthUserId()])

  // The feed and "which planes are mine?" are independent, so they run at the same time.
  const [{ data, error }, mine] = await Promise.all([
    supabase
      .from('public_thoughts')
      .select('id, title, content, mood, likes, created_at')
      .order('created_at', { ascending: false })
      .limit(PUBLIC_FEED_LIMIT),
    userId
      ? supabase.from('thoughts').select('id').eq('user_id', userId).eq('status', 'released')
      : Promise.resolve({ data: null }),
  ])

  if (error) {
    console.error('Error fetching public thoughts:', error)
    return []
  }

  // RLS only returns the caller's own rows in the second query.
  const ownedIds = new Set((mine.data ?? []).map((row: { id: string }) => row.id))

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string | null) || 'Untitled Thought',
    content: row.content as string,
    mood: (row.mood as string | null) || 'peaceful',
    likes: (row.likes as number | null) ?? 0,
    createdAt: row.created_at as string,
    isOwner: ownedIds.has(row.id as string),
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

  if (error || !data?.length) {
    if (error) console.error('Error changing thought status:', error)
    return { success: false, error: 'We could not update this letter. Please try again.' }
  }

  revalidateThoughtPages()
  return { success: true }
}

// 5. Permanently delete a thought you own (from the Jar or a sent plane).
export async function deleteThought(id: string): Promise<ThoughtActionResult> {
  const userId = await getAuthUserId()
  if (!userId) return UNAUTHENTICATED

  const supabase = await createClient()

  const { error } = await supabase.from('thoughts').delete().eq('id', id).eq('user_id', userId)

  if (error) {
    console.error('Error deleting thought:', error)
    return { success: false, error: 'We could not delete this letter. Please try again.' }
  }

  revalidateThoughtPages()
  return { success: true }
}