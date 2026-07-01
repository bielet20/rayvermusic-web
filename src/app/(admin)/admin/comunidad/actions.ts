'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setUserRole(id: string, role: 'fan' | 'artist' | 'admin') {
  const supabase = await createAdminClient()
  await supabase.from('profiles').update({ role }).eq('id', id)
  revalidatePath('/admin/comunidad')
}

export async function setMembership(id: string, membership: 'free' | 'premium') {
  const supabase = await createAdminClient()
  await supabase.from('profiles').update({ membership }).eq('id', id)
  revalidatePath('/admin/comunidad')
}
