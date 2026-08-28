'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Play, Music2, Zap, Link2, X, ChevronRight,
  SlidersHorizontal, Crown, Check, AlertCircle,
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

function fmtBpm(bpm: number | null) {
  return bpm ? `${bpm} BPM` : null
}

export default function PlayerLibrary({
  releases, plan, planName, features, connections, user, toast, toastType,
}: Props) {
  const { loadPlaylist, playTrack, currentIndex, isPlaying, playlist } = usePlayerStore()
  const [toastVisible, setToastVisible] = useState(!!toast)
  const [filter, setFilter] = useState<'all' | 'playable'>('playable')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (toast) {
      setToastVisible(true)
      toastTimer.current = setTimeout(() => setToastVisible(false), 4000)
    }
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [toast])

  const tracks = releases.map(releaseToTrack)
  const filtered = filter === 'playable' ? tracks.filter(isPlayable) : tracks

  function handlePlayAll() {
    loadPlaylist(filtered, { id: 'rayver-library', name: 'Biblioteca RAYVER', description: null, cover_url: null })
    if (filtered.length) setTimeout(() => playTrack(0), 50)
  }

  function handlePlayTrack(idx: number) {
    const loadedFirst = playlist[0]?.id === filtered[0]?.id && playlist.length === filtered.length
    if (loadedFirst) {
      playTrack(idx)
    } else {
      loadPlaylist(filtered, { id: 'rayver-library', name: 'Biblioteca RAYVER', description: null, cover_url: null }, idx)
      setTimeout(() => playTrack(idx), 50)
    }
  }

  const connectedPlatforms = new Set(connections.map(c => c.platform))

  const CONNECTABLE = [
    { id: 'spotify', requiresPlan: 'pro' as Plan, connectUrl: '/api/auth/spotify' },
    { id: 'soundcloud', requiresPlan: 'pro' as Plan, connectUrl: '#' },
    { id: 'youtube', requiresPlan: 'pro' as Plan, connectUrl: '#' },
    { id: 'apple_music', requiresPlan: 'artist' as Plan, connectUrl: '#' },
  ]

  const PLAN_ORDER: Plan[] = ['free', 'pro', 'artist', 'label']

  function planGte(a: Plan, b: Plan) {
    return PLAN_ORDER.indexOf(a) >= PLAN_ORDER.indexOf(b)
  }

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
            <h1 className="text-2xl font-bold">Biblioteca RAYVER</h1>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {releases.length} canciones · Plan{' '}
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
            disabled={filtered.length === 0}
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
          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-4">
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
            <span className="text-xs text-[var(--muted-foreground)] ml-auto">{filtered.length} tracks</span>
          </div>

          {/* Track list */}
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-[var(--muted-foreground)]">
                <Music2 size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay tracks disponibles</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {filtered.map((track, idx) => {
                  const isCurrentlyPlaying = isPlaying && playlist[currentIndex]?.id === track.id
                  const playable = isPlayable(track)

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
                      {/* Index / play button */}
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

                      {/* Cover */}
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-[var(--card)] flex-shrink-0">
                        {track.cover_url ? (
                          <Image src={track.cover_url} alt={track.title} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music2 size={16} className="text-[var(--muted-foreground)]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isCurrentlyPlaying ? 'text-purple-300' : 'text-[var(--foreground)]'}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">{track.artist}</p>
                      </div>

                      {/* Meta */}
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        {track.genre && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/10 text-purple-400 border border-purple-600/20">
                            {track.genre}
                          </span>
                        )}
                        {track.bpm && (
                          <span className="text-xs text-[var(--muted-foreground)]">{fmtBpm(track.bpm)}</span>
                        )}
                      </div>

                      {/* Platform icons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {track.youtube_url && <span className="text-xs opacity-50" title="YouTube">▶</span>}
                        {track.soundcloud_url && <span className="text-xs opacity-50" title="SoundCloud">🔊</span>}
                        {track.spotify_url && <span className="text-xs opacity-50" title="Spotify">🎵</span>}
                      </div>
                    </div>
                  )
                })}
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
                      <span className="text-xs opacity-50">Login</span>
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

          {/* Coming soon */}
          {features.spotifyConnect && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Music2 size={14} className="text-[var(--muted-foreground)]" />
                <h2 className="text-sm font-semibold">Tu biblioteca Spotify</h2>
              </div>
              {connectedPlatforms.has('spotify') ? (
                <p className="text-xs text-[var(--muted-foreground)]">
                  Pronto podrás ver tus canciones guardadas y playlists aquí.
                </p>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)]">
                  Conecta Spotify para ver tu biblioteca aquí.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
