import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Trash2, GripVertical, Plus, Search, Music2 } from 'lucide-react'
import PlaylistEditor from './PlaylistEditor'

export const metadata: Metadata = { title: 'Editar Playlist — Admin' }

export default async function EditPlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: playlist } = await supabase.from('playlists').select('*').eq('id', id).single()
  if (!playlist) notFound()

  const { data: ptracks } = await supabase
    .from('playlist_tracks')
    .select(`
      id, position,
      releases ( id, title, artist, cover_url, genre, type, bpm, youtube_url, spotify_url, soundcloud_url, apple_url, is_published )
    `)
    .eq('playlist_id', id)
    .order('position', { ascending: true })

  const { data: allReleases } = await supabase
    .from('releases')
    .select('id, title, artist, cover_url, genre, type, youtube_url, spotify_url, soundcloud_url, apple_url, is_published')
    .order('release_date', { ascending: false })

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/playlists" className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">{playlist.name}</h1>
            {playlist.is_default && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30">
                <Star size={10} />
                Por defecto
              </span>
            )}
          </div>
          <p className="text-[var(--muted-foreground)] text-sm">{playlist.description ?? 'Sin descripción'}</p>
        </div>
      </div>

      <PlaylistEditor
        playlist={playlist}
        tracks={(ptracks ?? []).filter(pt => pt.releases).map(pt => ({ ...(pt.releases as object), ptid: pt.id, position: pt.position })) as never}
        allReleases={(allReleases ?? []) as never}
      />
    </div>
  )
}
