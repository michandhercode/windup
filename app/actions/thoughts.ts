'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateThoughtInput {
  title?: string
  content: string
  mood?: string
  is_private: boolean
  status: 'draft' | 'sealed' | 'folded'
}

// 1. Action to save a new Thought or Journal Entry
export async function createThought(data: CreateThoughtInput) {
  const supabase = await createClient()

  const { data: userResponse } = await supabase.auth.getUser()
  const userId = userResponse?.user?.id || null

  const { data: thought, error } = await supabase
    .from('thoughts')
    .insert([
      {
        user_id: userId,
        title: data.title || null,
        content: data.content,
        mood: data.mood || null,
        is_private: data.is_private,
        status: data.status,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating thought:', error)
    return { success: false, error: error.message }
  }

  // Refresh page cache to reflect the new data immediately
  revalidatePath('/sent-planes')
  revalidatePath('/jar')

  return { success: true, data: thought }
}

// 2. Action to fetch Public Paper Planes (Sent Planes Feed)
export async function getPublicThoughts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('is_private', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching public thoughts:', error)
    return []
  }

  return data
}

// 3. Action to fetch the User's Private Jar Entries
export async function getUserJarThoughts() {
  const supabase = await createClient()

  const { data: userResponse } = await supabase.auth.getUser()
  const userId = userResponse?.user?.id

  if (!userId) return []

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

  return data
}