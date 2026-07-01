'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvento(formData: FormData) {
  const supabase = await createAdminClient()

  await supabase.from('events').insert({
    title: formData.get('title') as string,
    venue: (formData.get('venue') as string) || null,
    city: (formData.get('city') as string) || null,
    country: (formData.get('country') as string) || null,
    date: formData.get('date') as string,
    description: (formData.get('description') as string) || null,
    ticket_url: (formData.get('ticket_url') as string) || null,
    cover_url: (formData.get('cover_url') as string) || null,
    is_featured: formData.get('is_featured') === 'on',
    is_published: formData.get('is_published') === 'on',
  })

  revalidatePath('/admin/eventos')
  redirect('/admin/eventos')
}

export async function updateEvento(id: string, formData: FormData) {
  const supabase = await createAdminClient()

  await supabase.from('events').update({
    title: formData.get('title') as string,
    venue: (formData.get('venue') as string) || null,
    city: (formData.get('city') as string) || null,
    country: (formData.get('country') as string) || null,
    date: formData.get('date') as string,
    description: (formData.get('description') as string) || null,
    ticket_url: (formData.get('ticket_url') as string) || null,
    cover_url: (formData.get('cover_url') as string) || null,
    is_featured: formData.get('is_featured') === 'on',
    is_published: formData.get('is_published') === 'on',
  }).eq('id', id)

  revalidatePath('/admin/eventos')
  redirect('/admin/eventos')
}

export async function toggleEvento(id: string, field: 'is_published' | 'is_featured', value: boolean) {
  const supabase = await createAdminClient()
  const update = field === 'is_published' ? { is_published: value } : { is_featured: value }
  await supabase.from('events').update(update).eq('id', id)
  revalidatePath('/admin/eventos')
}

export async function deleteEvento(id: string) {
  const supabase = await createAdminClient()
  await supabase.from('events').delete().eq('id', id)
  revalidatePath('/admin/eventos')
}
