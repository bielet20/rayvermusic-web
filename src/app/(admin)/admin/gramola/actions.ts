'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setPlaying(id: string) {
  const supabase = await createAdminClient()
  // Marca todas como no-playing primero
  await supabase.from('jukebox_queue').update({ status: 'pending' }).eq('status', 'playing')
  await supabase.from('jukebox_queue').update({ status: 'playing' }).eq('id', id)
  revalidatePath('/admin/gramola')
}

export async function markPlayed(id: string) {
  const supabase = await createAdminClient()
  await supabase.from('jukebox_queue').update({ status: 'played' }).eq('id', id)
  revalidatePath('/admin/gramola')
}

export async function skipTrack(id: string) {
  const supabase = await createAdminClient()
  await supabase.from('jukebox_queue').update({ status: 'skipped' }).eq('id', id)
  revalidatePath('/admin/gramola')
}

export async function deleteFromQueue(id: string) {
  const supabase = await createAdminClient()
  await supabase.from('jukebox_queue').delete().eq('id', id)
  revalidatePath('/admin/gramola')
}

export async function clearQueue() {
  const supabase = await createAdminClient()
  await supabase.from('jukebox_queue').delete().in('status', ['pending', 'skipped'])
  revalidatePath('/admin/gramola')
}
