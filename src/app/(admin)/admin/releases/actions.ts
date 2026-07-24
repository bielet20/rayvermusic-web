'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createRelease(formData: FormData) {
  const supabase = await createAdminClient()

  const data = {
    title: formData.get('title') as string,
    artist: (formData.get('artist') as string) || 'Rayver',
    type: ((formData.get('type') as string) || 'track') as 'track' | 'ep' | 'album' | 'remix',
    cover_url: (formData.get('cover_url') as string) || null,
    release_date: (formData.get('release_date') as string) || null,
    description: (formData.get('description') as string) || null,
    spotify_url: (formData.get('spotify_url') as string) || null,
    apple_url: (formData.get('apple_url') as string) || null,
    youtube_url: (formData.get('youtube_url') as string) || null,
    soundcloud_url: (formData.get('soundcloud_url') as string) || null,
    beatport_url: (formData.get('beatport_url') as string) || null,
    audio_url: (formData.get('audio_url') as string) || null,
    is_featured: formData.get('is_featured') === 'on',
    is_published: formData.get('is_published') === 'on',
  }

  await supabase.from('releases').insert(data)
  revalidatePath('/admin/releases')
  redirect('/admin/releases')
}

export async function updateRelease(id: string, formData: FormData) {
  const supabase = await createAdminClient()

  const data = {
    title: formData.get('title') as string,
    artist: (formData.get('artist') as string) || 'Rayver',
    type: formData.get('type') as 'track' | 'ep' | 'album' | 'remix',
    cover_url: (formData.get('cover_url') as string) || null,
    release_date: (formData.get('release_date') as string) || null,
    description: (formData.get('description') as string) || null,
    spotify_url: (formData.get('spotify_url') as string) || null,
    apple_url: (formData.get('apple_url') as string) || null,
    youtube_url: (formData.get('youtube_url') as string) || null,
    soundcloud_url: (formData.get('soundcloud_url') as string) || null,
    beatport_url: (formData.get('beatport_url') as string) || null,
    audio_url: (formData.get('audio_url') as string) || null,
    is_featured: formData.get('is_featured') === 'on',
    is_published: formData.get('is_published') === 'on',
  }

  await supabase.from('releases').update(data).eq('id', id)
  revalidatePath('/admin/releases')
  redirect('/admin/releases')
}

export async function toggleRelease(id: string, field: 'is_published' | 'is_featured', value: boolean) {
  const supabase = await createAdminClient()
  const update = field === 'is_published' ? { is_published: value } : { is_featured: value }
  await supabase.from('releases').update(update).eq('id', id)
  revalidatePath('/admin/releases')
}

export async function deleteRelease(id: string) {
  const supabase = await createAdminClient()
  await supabase.from('releases').delete().eq('id', id)
  revalidatePath('/admin/releases')
}
