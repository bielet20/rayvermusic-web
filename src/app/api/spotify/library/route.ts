import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function refreshSpotifyToken(refreshToken: string) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  })
  if (!res.ok) return null
  return res.json() as Promise<{ access_token: string; expires_in: number }>
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'tracks' // tracks | playlists

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conn } = await supabase
    .from('platform_connections')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', user.id)
    .eq('platform', 'spotify')
    .single()

  if (!conn?.access_token) {
    return NextResponse.json({ error: 'Spotify not connected' }, { status: 404 })
  }

  let token = conn.access_token
  const expired = conn.token_expires_at && new Date(conn.token_expires_at) < new Date()
  if (expired && conn.refresh_token) {
    const refreshed = await refreshSpotifyToken(conn.refresh_token)
    if (refreshed) {
      token = refreshed.access_token
      const admin = await createAdminClient()
      await admin.from('platform_connections').update({
        access_token: refreshed.access_token,
        token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id).eq('platform', 'spotify')
    }
  }

  const headers = { Authorization: `Bearer ${token}` }

  if (type === 'playlists') {
    const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', { headers })
    if (!res.ok) return NextResponse.json({ error: 'Spotify API error' }, { status: 502 })
    const data = await res.json()
    const playlists = (data.items ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      cover_url: (p.images as Array<{ url: string }>)?.[0]?.url ?? null,
      track_count: (p.tracks as { total: number })?.total ?? 0,
      source_platform: 'spotify',
      source_id: p.id,
    }))
    return NextResponse.json({ playlists })
  }

  // Saved tracks
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)
  const res = await fetch(`https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset}`, { headers })
  if (!res.ok) return NextResponse.json({ error: 'Spotify API error' }, { status: 502 })
  const data = await res.json()

  const tracks = (data.items ?? []).map(({ track }: { track: Record<string, unknown> }) => ({
    id: track.id,
    title: track.name,
    artist: (track.artists as Array<{ name: string }>)?.map((a) => a.name).join(', ') ?? '',
    album: (track.album as { name: string })?.name ?? null,
    cover_url: ((track.album as { images: Array<{ url: string }> })?.images)?.[0]?.url ?? null,
    duration_ms: track.duration_ms ?? 0,
    spotify_id: track.id,
    spotify_url: (track.external_urls as { spotify: string })?.spotify ?? null,
  }))

  return NextResponse.json({ tracks, total: data.total, offset, limit: 50 })
}
