import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const supabase = await createClient()

  let baseQuery = supabase.from('playlists').select('*').eq('is_active', true)
  if (id && id !== 'default') {
    baseQuery = baseQuery.eq('id', id)
  } else {
    baseQuery = baseQuery.eq('is_default', true)
  }
  const { data: playlist, error: pError } = await baseQuery.single()
  if (pError || !playlist) {
    return NextResponse.json({ error: 'Playlist no encontrada' }, { status: 404 })
  }

  // Obtener tracks según sort_by
  if (playlist.sort_by === 'custom') {
    // Tracks en orden manual
    const { data: ptracks } = await supabase
      .from('playlist_tracks')
      .select(`
        position,
        releases (
          id, title, artist, cover_url, genre, type, bpm,
          youtube_url, spotify_url, soundcloud_url, apple_url, beatport_url,
          is_published
        )
      `)
      .eq('playlist_id', playlist.id)
      .order('position', { ascending: true })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracks = ((ptracks ?? []) as any[])
      .map((pt: any) => pt.releases)
      .filter((r: any) => r?.is_published)

    return NextResponse.json({ playlist, tracks })
  }

  // Auto-playlists: sin playlist_tracks, desde releases directamente
  let relQuery = supabase
    .from('releases')
    .select('id, title, artist, cover_url, genre, type, bpm, youtube_url, spotify_url, soundcloud_url, apple_url, beatport_url')
    .eq('is_published', true)

  if (playlist.sort_by === 'featured') {
    relQuery = relQuery.eq('is_featured', true).order('release_date', { ascending: false })
  } else if (playlist.sort_by === 'newest') {
    relQuery = relQuery.order('release_date', { ascending: false }).limit(20)
  } else if (playlist.sort_by === 'plays') {
    relQuery = relQuery.order('plays_count', { ascending: false }).limit(20)
  }

  const { data: tracks } = await relQuery

  return NextResponse.json({ playlist, tracks: tracks ?? [] })
}
