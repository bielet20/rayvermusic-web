import { create } from 'zustand'

export type PlayerPlatform = 'youtube' | 'spotify' | 'soundcloud' | 'apple'

export interface PlayerTrack {
  id: string
  title: string
  artist: string
  cover_url: string | null
  youtube_url: string | null
  spotify_url: string | null
  soundcloud_url: string | null
  apple_url: string | null
  beatport_url: string | null
  genre: string | null
  type: string
  bpm: number | null
}

export type RepeatMode = 'none' | 'one' | 'all'

export interface PlayerPlaylist {
  id: string
  name: string
  description: string | null
  cover_url: string | null
}

interface PlayerState {
  playlist: PlayerTrack[]
  meta: PlayerPlaylist | null
  currentIndex: number
  isPlaying: boolean
  isExpanded: boolean
  shuffle: boolean
  repeat: RepeatMode
  isLoaded: boolean
  activePlatform: PlayerPlatform | null
  volume: number

  loadPlaylist: (tracks: PlayerTrack[], meta?: PlayerPlaylist | null, startIndex?: number) => void
  playTrack: (index: number) => void
  play: () => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setExpanded: (v: boolean) => void
  addToQueue: (track: PlayerTrack) => void
  setActivePlatform: (p: PlayerPlatform | null) => void
  setVolume: (v: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  playlist: [],
  meta: null,
  currentIndex: 0,
  isPlaying: false,
  isExpanded: false,
  shuffle: false,
  repeat: 'none',
  isLoaded: false,
  activePlatform: null,
  volume: 80,

  loadPlaylist: (tracks, meta = null, startIndex = 0) => {
    set({ playlist: tracks, meta, currentIndex: startIndex, isLoaded: true, isPlaying: false })
  },

  playTrack: (index) => set({ currentIndex: index, isPlaying: true }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set(s => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { playlist, currentIndex, shuffle, repeat } = get()
    if (!playlist.length) return
    if (repeat === 'one') { set({ isPlaying: true }); return }
    const nextIdx = shuffle
      ? Math.floor(Math.random() * playlist.length)
      : (currentIndex + 1) % playlist.length
    if (!shuffle && nextIdx === 0 && repeat === 'none') { set({ isPlaying: false }); return }
    set({ currentIndex: nextIdx, isPlaying: true })
  },

  prev: () => {
    const { playlist, currentIndex } = get()
    if (!playlist.length) return
    set({ currentIndex: currentIndex === 0 ? playlist.length - 1 : currentIndex - 1, isPlaying: true })
  },

  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set(s => ({
    repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none',
  })),

  setExpanded: (v) => set({ isExpanded: v }),
  addToQueue: (track) => set(s => ({ playlist: [...s.playlist, track] })),
  setActivePlatform: (p) => set({ activePlatform: p }),
  setVolume: (v) => set({ volume: v }),
}))

// Helpers
export function getBestPlatform(track: PlayerTrack): { platform: PlayerPlatform; url: string } | null {
  if (track.youtube_url) return { platform: 'youtube', url: track.youtube_url }
  if (track.soundcloud_url) return { platform: 'soundcloud', url: track.soundcloud_url }
  if (track.spotify_url) return { platform: 'spotify', url: track.spotify_url }
  if (track.apple_url) return { platform: 'apple', url: track.apple_url }
  return null
}

export function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
  return m?.[1] ?? null
}

export function getSpotifyEmbedUrl(url: string): string {
  return url
    .replace('open.spotify.com/', 'open.spotify.com/embed/')
    .replace(/\?.*$/, '') + '?utm_source=generator&theme=0'
}

export function getSoundCloudWidgetUrl(url: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23a855f7&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
}

export const PLATFORM_LABELS: Record<PlayerPlatform, string> = {
  youtube: 'YouTube',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  apple: 'Apple Music',
}

export const PLATFORM_COLORS: Record<PlayerPlatform, string> = {
  youtube: 'bg-red-600/20 text-red-400 border-red-600/30',
  spotify: 'bg-green-600/20 text-green-400 border-green-600/30',
  soundcloud: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
  apple: 'bg-red-500/20 text-red-300 border-red-500/30',
}
