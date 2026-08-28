import { createClient } from '@/lib/supabase/server'
import { PLAN_FEATURES, PLAN_NAMES, type Plan } from '@/lib/features'
import PlayerLibrary from './PlayerLibrary'
import type { Metadata } from 'next'

function normalizePlan(membership: string | null | undefined): Plan {
  if (membership === 'premium') return 'pro'
  if (membership === 'pro' || membership === 'artist' || membership === 'label') return membership
  return 'free'
}

export const metadata: Metadata = {
  title: 'Player',
  description: 'Tu reproductor de música multi-plataforma. Conecta Spotify, SoundCloud y más.',
}

export default async function PlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const { connected, error } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profileMembership: string | null = null
  let profileDisplayName: string | null = null
  let connections: Array<{
    platform: string
    platform_display_name: string | null
    platform_avatar_url: string | null
    connected_at: string
  }> = []

  if (user) {
    const [profileRes, connectionsRes] = await Promise.all([
      supabase.from('profiles').select('membership, display_name').eq('id', user.id).single(),
      supabase.from('platform_connections').select('platform, platform_display_name, platform_avatar_url, connected_at').eq('user_id', user.id),
    ])
    profileMembership = profileRes.data?.membership ?? null
    profileDisplayName = profileRes.data?.display_name ?? null
    connections = connectionsRes.data ?? []
  }

  const plan = normalizePlan(profileMembership)
  const features = PLAN_FEATURES[plan]

  const { data: releases } = await supabase
    .from('releases')
    .select('id, title, artist, cover_url, genre, type, bpm, audio_url, youtube_url, spotify_url, soundcloud_url, apple_url, beatport_url')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('plays_count', { ascending: false })
    .limit(50)

  return (
    <PlayerLibrary
      releases={releases ?? []}
      plan={plan}
      planName={PLAN_NAMES[plan]}
      features={features}
      connections={connections}
      user={user ? { id: user.id, email: user.email ?? '', displayName: profileDisplayName } : null}
      toast={connected ? `Spotify conectado correctamente` : error ? `Error al conectar: ${error}` : null}
      toastType={error ? 'error' : 'success'}
    />
  )
}
