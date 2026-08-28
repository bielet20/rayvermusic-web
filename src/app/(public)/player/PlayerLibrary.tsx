'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Play, Music2, Zap, Link2, X, ChevronRight,
  SlidersHorizontal, Crown, Check, AlertCircle, RefreshCw, Loader2,
} from 'lucide-react'
import { usePlayerStore, type PlayerTrack, isPlayable } from '@/lib/player-store'
import type { PlanFeatures, Plan } from '@/lib/features'

interface Release {
  id: string
  title: string
  artist: string
  cover_url: string | null
  genre: string | null
  type: string
  bpm: number | null
  audio_url: string | null
  youtube_url: string | null
  spotify_url: string | null
  soundcloud_url: string | null
  apple_url: string | null
  beatport_url: string | null
}

interface SpotifyTrack {
  id: string
  title: string
  artist: string
  album: string | null
  cover_url: string | null
  duration_ms: number
  spotify_id: string
  spotify_url: string | null
}

interface Connection {
  platform: string
  platform_display_name: string | null
  platform_avatar_url: string | null
  connected_at: string
}

interface Props {
  releases: Release[]
  plan: Plan
  planName: string
  features: PlanFeatures
  connections: Connection[]
  user: { id: string; email: string; displayName?: string | null } | null
  toast: string | null
  toastType: 'success' | 'error'
}

const PLATFORM_ICONS: Record<string, string> = {
  spotify: '🎵',
  soundcloud: '🔊',
  youtube: '▶',
  apple_music: '🎧',
}

const PLATFORM_LABELS: Record<string, string> = {
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
  apple_music: 'Apple Music',
}

const PLATFORM_COLORS: Record<string, string> = {
  spotify: 'bg-green-500/10 border-green-500/30 text-green-400',
  soundcloud: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  youtube: 'bg-red-500/10 border-red-500/30 text-red-400',
  apple_music: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
}

function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

function releaseToTrack(r: Release): PlayerTrack {
  return {
    id: r.id,
    title: r.title,
    artist: r.artist,
    cover_url: r.cover_url,
    audio_url: r.audio_url,
    youtube_url: r.youtube_url,
    spotify_url: r.spotify_url,
    soundcloud_url: r.soundcloud_url,
    apple_url: r.apple_url,
    beatport_url: r.beatport_url,
    genre: r.genre,
    type: r.type,
    bpm: r.bpm,
  }
}

function spotifyToTrack(t: SpotifyTrack): PlayerTrack {
  return {
    id: `sp_${t.spotify_id}`,
    title: t.title,
    artist: t.artist,
    cover_url: t.cover_url,
    audio_url: null,
    youtube_url: null,
    spotify_url: t.spotify_url,
    soundcloud_url: null,
    apple_url: null,
    beatport_url: null,
    genre: null,
    type: 'track',
    bpm: null,
  }
}

type Source = 'rayver' | 'spotify'

export default function PlayerLibrary({
  releases, plan, planName, features, connections, user, toast, toastType,
}: Props) {
  const { loadPlaylist, playTrack, currentIndex, isPlaying, playlist } = usePlayerStore()
  const [toastVisible, setToastVisible] = useState(!!toast)
  const [filter, setFilter] = useState<'all' | 'playable'>('playable')
  const [source, setSource] = useState<Source>('rayver')
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([])
  const [spotifyLoading, setSpotifyLoading] = useState(false)
  const [spotifyOffset, setSpotifyOffset] = useState(0)
  const [spotifyTotal, setSpotifyTotal] = useState(0)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isSpotifyConnected = connections.some(c => c.platform === 'spotify')
  const canUseSpotify = features.spotifyConnect && isSpotifyConnected

  useEffect(() => {
    if (toast) {
      setToastVisible(true)
      toastTimer.current = setTimeout(() => setToastVisible(false), 4000)
    }
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [toast])

  const loadSpotifyTracks = useCallback(async (offset = 0) => {
    setSpotifyLoading(true)
    try {
      const res = await fetch(`/api/spotify/library?type=tracks&offset=${offset}`)
      if (res.ok) {
        const data = await res.json()
        setSpotifyTracks(prev => offset === 0 ? data.tracks : [...prev, ...data.tracks])
        setSpotifyTotal(data.total ?? 0)
        setSpotifyOffset(offset + (data.tracks?.length ?? 0))
      }
    } finally {
      setSpotifyLoading(false)
    }
  }, [])

  useEffect(() => {
    if (source === 'spotify' && canUseSpotify && spotifyTracks.length === 0) {
      loadSpotifyTracks(0)
    }
  }, [source, canUseSpotify, spotifyTracks.length, loadSpotifyTracks])

  const rayverTracks = releases.map(releaseToTrack)
  const filteredRayver = filter === 'playable' ? rayverTracks.filter(isPlayable) : rayverTracks
  const activeTracks = source === 'rayver' ? filteredRayver : spotifyTracks.map(spotifyToTrack)

  function handlePlayAll() {
    if (!activeTracks.length) return
    loadPlaylist(activeTracks, {
      id: source === 'rayver' ? 'rayver-library' : 'spotify-library',
      name: source === 'rayver' ? 'Biblioteca RAYVER' : 'Tu Spotify',
      description: null,
      cover_url: null,
    })
    setTimeout(() => playTrack(0), 50)
  }

  function handlePlayTrack(idx: number) {
    const sameList = playlist[0]?.id === activeTracks[0]?.id && playlist.length === activeTracks.length
    if (sameList) {
      playTrack(idx)
    } else {
      loadPlaylist(activeTracks, {
        id: source === 'rayver' ? 'rayver-library' : 'spotify-library',
        name: source === 'rayver' ? 'Biblioteca RAYVER' : 'Tu Spotify',
        description: null,
        cover_url: null,
      }, idx)
      setTimeout(() => playTrack(idx), 50)
    }
  }

  const connectedPlatforms = new Set(connections.map(c => c.platform))

  const PLAN_ORDER: Plan[] = ['free', 'pro', 'artist', 'label']
  function planGte(a: Plan, b: Plan) {
    return PLAN_ORDER.indexOf(a) >= PLAN_ORDER.indexOf(b)
  }

  const CONNECTABLE = [
    { id: 'spotify', requiresPlan: 'pro' as Plan, connectUrl: '/api/auth/spotify' },
    { id: 'soundcloud', requiresPlan: 'pro' as Plan, connectUrl: '#' },
    { id: 'youtube', requiresPlan: 'pro' as Plan, connectUrl: '#' },
    { id: 'apple_music', requiresPlan: 'artist' as Plan, connectUrl: '#' },
  ]

  const displayTracks = source === 'rayver' ? filteredRayver : spotifyTracks.map(spotifyToTrack)

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">

      {/* Toast */}
      {toastVisible && toast && (
        <div className={`fixed bottom-8 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl transition-all ${
          toastType === 'error'
            ? 'bg-red-950/80 border-red-500/40 text-red-300'
            : 'bg-green-950/80 border-green-500/40 text-green-300'
        }`}>
          {toastType === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          {toast}
          <button onClick={() => setToastVisible(false)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Music2 size={20} className="text-purple-400" />
            <h1 className="text-2xl font-bold">
              {source === 'rayver' ? 'Biblioteca RAYVER' : 'Tu Spotify'}
            </h1>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {source === 'rayver'
              ? `${releases.length} canciones · Plan `
              : `${spotifyTotal} canciones guardadas · Plan `}
            <span className={`font-semibold ${plan === 'free' ? 'text-gray-400' : 'text-purple-400'}`}>
              {planName}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {plan === 'free' && (
            <Link
              href="/upgrade"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
            >
              <Crown size={14} />
              Upgrade a Pro
            </Link>
          )}
          <button
            onClick={handlePlayAll}
            disabled={displayTracks.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card)] hover:bg-[var(--card)]/80 border border-[var(--border)] text-sm font-medium transition-colors disabled:opacity-40"
          >
            <Play size={14} className="fill-current" />
            Reproducir todo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

        {/* Library */}
        <div>
          {/* Source tabs */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
              <button
                onClick={() => setSource('rayver')}
                className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${source === 'rayver' ? 'bg-purple-600 text-white' : 'text-[var(--muted-foreground)] hover:text-white'}`}
              >
                <Music2 size={11} />
                RAYVER
              </button>
              {canUseSpotify ? (
                <button
                  onClick={() => setSource('spotify')}
                  className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${source === 'spotify' ? 'bg-green-600 text-white' : 'text-[var(--muted-foreground)] hover:text-white'}`}
                >
                  🎵 Spotify
                </button>
              ) : features.spotifyConnect && !isSpotifyConnected ? (
                <a
                  href="/api/auth/spotify"
                  className="px-3 py-1.5 text-[var(--muted-foreground)] hover:text-white flex items-center gap-1"
                >
                  🎵 Conectar Spotify
                </a>
              ) : !features.spotifyConnect ? (
                <Link
                  href="/upgrade"
                  className="px-3 py-1.5 text-[var(--muted-foreground)] hover:text-purple-400 flex items-center gap-1"
                >
                  <Crown size={10} /> Spotify <span className="text-purple-400">(Pro)</span>
                </Link>
              ) : null}
            </div>

            {source === 'rayver' && (
              <>
                <SlidersHorizontal size={14} className="text-[var(--muted-foreground)]" />
                <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
                  {(['playable', 'all'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'text-[var(--muted-foreground)] hover:text-white'}`}
                    >
                      {f === 'playable' ? 'Reproducibles' : 'Todos'}
                    </button>
                  ))}
                </div>
              </>
            )}

            <span className="text-xs text-[var(--muted-foreground)] ml-auto">
              {source === 'rayver' ? filteredRayver.length : spotifyTracks.length} tracks
            </span>
          </div>

          {/* Track list */}
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            {source === 'spotify' && spotifyLoading && spotifyTracks.length === 0 ? (
              <div className="text-center py-16 text-[var(--muted-foreground)]">
                <Loader2 size={24} className="mx-auto mb-3 animate-spin opacity-50" />
                <p className="text-sm">Cargando tu biblioteca de Spotify...</p>
              </div>
            ) : displayTracks.length === 0 ? (
              <div className="text-center py-16 text-[var(--muted-foreground)]">
                <Music2 size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay tracks disponibles</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {displayTracks.map((track, idx) => {
                  const isCurrentlyPlaying = isPlaying && playlist[currentIndex]?.id === track.id
                  const playable = isPlayable(track)
                  const dur = source === 'spotify'
                    ? spotifyTracks[idx]?.duration_ms
                    : null

                  return (
                    <div
                      key={track.id}
                      className={`flex items-center gap-3 px-4 py-3 group transition-colors cursor-pointer ${
                        isCurrentlyPlaying
                          ? 'bg-purple-600/10 border-l-2 border-purple-500'
                          : 'hover:bg-white/5'
                      } ${!playable ? 'opacity-50' : ''}`}
                      onClick={() => playable && handlePlayTrack(idx)}
                    >
                      <div className="w-6 text-center flex-shrink-0">
                        {isCurrentlyPlaying ? (
                          <span className="inline-block w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
                        ) : (
                          <>
                            <span className="text-xs text-[var(--muted-foreground)] group-hover:hidden">{idx + 1}</span>
                            <Play size={12} className="fill-current hidden group-hover:block mx-auto" />
                          </>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-md overflow-hidden bg-[var(--card)] flex-shrink-0">
                        {track.cover_url ? (
                          <Image src={track.cover_url} alt={track.title} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music2 size={16} className="text-[var(--muted-foreground)]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isCurrentlyPlaying ? 'text-purple-300' : ''}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">{track.artist}</p>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        {source === 'rayver' && track.genre && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/10 text-purple-400 border border-purple-600/20">
                            {track.genre}
                          </span>
                        )}
                        {source === 'rayver' && track.bpm && (
                          <span className="text-xs text-[var(--muted-foreground)]">{track.bpm} BPM</span>
                        )}
                        {source === 'spotify' && dur ? (
                          <span className="text-xs text-[var(--muted-foreground)]">{fmtMs(dur)}</span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 text-xs opacity-40">
                        {track.youtube_url && <span title="YouTube">▶</span>}
                        {track.soundcloud_url && <span title="SoundCloud">🔊</span>}
                        {track.spotify_url && <span title="Spotify">🎵</span>}
                      </div>
                    </div>
                  )
                })}

                {/* Load more Spotify */}
                {source === 'spotify' && spotifyTracks.length < spotifyTotal && (
                  <div className="p-4 text-center">
                    <button
                      onClick={() => loadSpotifyTracks(spotifyOffset)}
                      disabled={spotifyLoading}
                      className="flex items-center gap-2 mx-auto text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
                    >
                      {spotifyLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      Cargar más ({spotifyTotal - spotifyTracks.length} restantes)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* User info */}
          {user ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Conectado como</p>
              <p className="font-medium text-sm truncate">{user.displayName ?? user.email}</p>
              <div className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${
                plan === 'free' ? 'bg-gray-500/10 border-gray-500/30 text-gray-400' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              }`}>
                {plan !== 'free' && <Crown size={10} />}
                Plan {planName}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Inicia sesión para conectar tus plataformas</p>
              <Link href="/login?redirect=/player" className="text-sm font-medium text-purple-400 hover:text-purple-300">
                Iniciar sesión <ChevronRight size={14} className="inline" />
              </Link>
            </div>
          )}

          {/* Platform connections */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 mb-4">
              <Link2 size={14} className="text-purple-400" />
              <h2 className="text-sm font-semibold">Plataformas conectadas</h2>
            </div>

            <div className="space-y-2">
              {CONNECTABLE.map(({ id, requiresPlan, connectUrl }) => {
                const isConnected = connectedPlatforms.has(id)
                const canConnect = planGte(plan, requiresPlan)
                const conn = connections.find(c => c.platform === id)

                return (
                  <div
                    key={id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                      isConnected ? PLATFORM_COLORS[id] : 'border-[var(--border)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    <span className="text-base">{PLATFORM_ICONS[id]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{PLATFORM_LABELS[id]}</p>
                      {isConnected && conn?.platform_display_name && (
                        <p className="text-xs opacity-70 truncate">{conn.platform_display_name}</p>
                      )}
                    </div>
                    {isConnected ? (
                      <span className="text-xs font-medium flex items-center gap-1">
                        <Check size={12} /> Activo
                      </span>
                    ) : canConnect && user ? (
                      <a href={connectUrl} className="text-xs font-medium hover:underline">
                        Conectar
                      </a>
                    ) : !user ? (
                      <Link href="/login?redirect=/player" className="text-xs opacity-50 hover:opacity-80">
                        Login
                      </Link>
                    ) : (
                      <Link href="/upgrade" className="flex items-center gap-1 text-xs text-purple-400 hover:underline">
                        <Crown size={10} /> {requiresPlan}
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upgrade CTA for free users */}
          {plan === 'free' && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-600/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-purple-400" />
                <h2 className="text-sm font-semibold text-purple-300">Desbloquea Pro</h2>
              </div>
              <ul className="space-y-1.5 mb-4">
                {['Conecta Spotify, SoundCloud y YouTube', 'Playlists personalizadas', 'Crossfade automático', 'Audio de alta calidad'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
                    <Check size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/upgrade"
                className="block w-full text-center py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
              >
                Ver planes — desde 4,99€/mes
              </Link>
            </div>
          )}

          {/* Pro: Spotify info */}
          {features.spotifyConnect && isSpotifyConnected && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-green-400">🎵 Spotify conectado</p>
                <button
                  onClick={() => { setSource('spotify'); loadSpotifyTracks(0) }}
                  className="text-xs text-green-400 hover:underline"
                >
                  Cargar biblioteca
                </button>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                {spotifyTotal > 0 ? `${spotifyTotal} canciones guardadas` : 'Haz clic para cargar tus canciones'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
