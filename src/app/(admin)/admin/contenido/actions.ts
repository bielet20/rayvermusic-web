'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createContenido(formData: FormData) {
  const supabase = await createAdminClient()

  await supabase.from('exclusive_content').insert({
    title: formData.get('title') as string,
    type: ((formData.get('type') as string) || 'post') as 'post' | 'track' | 'video' | 'download',
    body: (formData.get('body') as string) || null,
    media_url: (formData.get('media_url') as string) || null,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    tier: (formData.get('tier') as 'free' | 'premium') || 'free',
    is_published: formData.get('is_published') === 'on',
  })

  revalidatePath('/admin/contenido')
  redirect('/admin/contenido')
}

export async function updateContenido(id: string, formData: FormData) {
  const supabase = await createAdminClient()

  await supabase.from('exclusive_content').update({
    title: formData.get('title') as string,
    type: formData.get('type') as 'post' | 'track' | 'video' | 'download',
    body: (formData.get('body') as string) || null,
    media_url: (formData.get('media_url') as string) || null,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    tier: formData.get('tier') as 'free' | 'premium',
    is_published: formData.get('is_published') === 'on',
  }).eq('id', id)

  revalidatePath('/admin/contenido')
  redirect('/admin/contenido')
}

export async function toggleContenido(id: string, value: boolean) {
  const supabase = await createAdminClient()
  await supabase.from('exclusive_content').update({ is_published: value }).eq('id', id)
  revalidatePath('/admin/contenido')
}

export async function deleteContenido(id: string) {
  const supabase = await createAdminClient()
  await supabase.from('exclusive_content').delete().eq('id', id)
  revalidatePath('/admin/contenido')
}
