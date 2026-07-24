'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  usePlayerStore,
  getBestPlatform,
  extractYouTubeId,
  getSpotifyEmbedUrl,
  getSoundCloudWidgetUrl,
  PLATFORM_LABELS,
  PLATFORM_COLORS,
  type PlayerTrack,
  type PlayerPlatform,
} from '@/lib/player-store'
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  ChevronDown, Volume2, VolumeX, ListMusic, Music2, Loader2, ExternalLink,
} from 'lucide-react'

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement | string, opts: Record<string, unknown>) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
    }
    onYouTubeIframeAPIReady: (() => void) | undefined
    SC: { Widget: (iframe: HTMLIFrameElement) => SCWidget }
  }
}

interface YTPlayer {
  loadVideoById: (id: string) => void
  playVideo: () => void
  pauseVideo: () => void
  setVolume: (v: number) => void
  destroy: () => void
}

interface SCWidget {
  play: () => void
  pause: () => void
  load: (url: string, opts: Record<string, unknown>) => void
  bind: (event: string, handler: () => void) => void
}

// ─── YouTube Engine ───────────────────────────────────────────
function YouTubeEngine({
  track,
  isPlaying,
  volume,
  onEnd,
  onReadyChange,
}: {
  track: PlayerTrack | null
  isPlaying: boolean
  volume: number
  onEnd: () => void
  onReadyChange: (ready: boolean) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const readyRef = useRef(false)
  const isPlayingRef = useRef(isPlaying)

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  const videoId = track?.youtube_url ? extractYouTubeId(track.youtube_url) : null

  const initPlayer = useCallback(() => {
    if (!containerRef.current || !videoId) return
    if (playerRef.current) { try { playerRef.current.destroy() } catch { /* noop */ } }
    readyRef.current = false
    onReadyChange(false)
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          readyRef.current = true
          onReadyChange(true)
          if (isPlayingRef.current) playerRef.current?.playVideo()
        },
        onStateChange: (e: { data: number }) => {
          if (e.data === window.YT.PlayerState.ENDED) onEnd()
        },
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.YT) { initPlayer(); return }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); initPlayer() }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
    return () => { try { playerRef.current?.destroy() } catch { /* noop */ } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!window.YT || !videoId) return
    if (playerRef.current && readyRef.current) {
      playerRef.current.loadVideoById(videoId)
      if (isPlayingRef.current) playerRef.current.playVideo()
    } else {
      initPlayer()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return
    if (isPlaying) playerRef.current.playVideo()
    else playerRef.current.pauseVideo()
  }, [isPlaying])

  useEffect(() => {
    if (readyRef.current) playerRef.current?.setVolume(volume)
  }, [volume])

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', pointerEvents: 'none' }}
      aria-hidden
    />
  )
}

// ─── Direct Audio Engine ──────────────────────────────────────
function AudioEngine({ track, isPlaying, volume, onEnd }: {
  track: PlayerTrack | null
  isPlaying: boolean
  volume: number
  onEnd: () => void
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(isPlaying)

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  useEffect(() => {
    if (!track?.audio_url) return
    if (!audioRef.current) audioRef.current = new Audio()
    const audio = audioRef.current
    audio.src = track.audio_url
    audio.volume = volume / 100
    audio.onended = onEnd
    if (isPlayingRef.current) audio.play().catch(() => {})
    return () => { audio.pause() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.audio_url])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.play().catch(() => {})
    else audioRef.current.pause()
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100
  }, [volume])

  return null
}

// ─── SoundCloud Engine ────────────────────────────────────────
function SoundCloudEngine({ track, isPlaying }: { track: PlayerTrack | null; isPlaying: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<SCWidget | null>(null)
  const isPlayingRef = useRef(isPlaying)
  const url = track?.soundcloud_url ? getSoundCloudWidgetUrl(track.soundcloud_url) : null

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  useEffect(() => {
    if (!url || !iframeRef.current) return
    const setup = () => {
      if (!iframeRef.current || !window.SC) return
      widgetRef.current = window.SC.Widget(iframeRef.current)
      widgetRef.current.bind('ready', () => {
        if (isPlayingRef.current) widgetRef.current?.play()
      })
    }
    if (window.SC) { setup(); return }
    const s = document.createElement('script')
    s.src = 'https://w.soundcloud.com/player/api.js'
    s.onload = setup
    document.head.appendChild(s)
  }, [url])

  useEffect(() => {
    if (!widgetRef.current) return
    if (isPlaying) widgetRef.current.play()
    else widgetRef.current.pause()
  }, [isPlaying])

  if (!url) return null
  return (
    <iframe ref={iframeRef} src={url}
      style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
      aria-hidden allow="autoplay" />
  )
}

// ─── Track row ────────────────────────────────────────────────
function TrackRow({ track, index, isActive, isPlaying, onPlay }: {
  track: PlayerTrack; index: number; isActive: boolean; isPlaying: boolean; onPlay: () => void
}) {
  const best = getBestPlatform(track)
  return (
    <button
      onClick={onPlay}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors rounded-xl ${
        isActive ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className={`text-xs w-5 flex-shrink-0 tabular-nums text-center ${isActive ? 'text-purple-400' : 'text-[var(--muted-foreground)]'}`}>
        {isActive && isPlaying ? (
          <span className="inline-flex gap-0.5 items-end h-3 justify-center">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-0.5 h-full bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        ) : (index + 1)}
      </span>

      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--muted)] flex-shrink-0">
        {track.cover_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Music2 size={14} className="text-[var(--border)]" /></div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : ''}`}>{track.title}</p>
        <p className="text-xs text-[var(--muted-foreground)] truncate">{track.artist}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {track.bpm && (
          <span className="hidden sm:inline text-[10px] text-[var(--muted-foreground)]">{track.bpm} bpm</span>
        )}
        {best && (
          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${PLATFORM_COLORS[best.platform as PlayerPlatform]}`}>
            {PLATFORM_LABELS[best.platform as PlayerPlatform]}
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Embed viewer for Spotify / SC (no YT) ───────────────────
function EmbedViewer({ track }: { track: PlayerTrack }) {
  if (track.spotify_url) {
    return (
      <iframe
        src={getSpotifyEmbedUrl(track.spotify_url)}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy" className="w-full rounded-xl border-0" style={{ height: 152 }}
      />
    )
  }
  if (track.soundcloud_url) {
    return (
      <iframe src={getSoundCloudWidgetUrl(track.soundcloud_url)}
        allow="autoplay" className="w-full rounded-xl border-0" style={{ height: 120 }} />
    )
  }
  return null
}

// ─── Main Component ───────────────────────────────────────────
export default function HybridPlayer() {
  const {
    playlist, meta, currentIndex, isPlaying, isExpanded, shuffle, repeat, volume,
    toggle, next, prev, playTrack, toggleShuffle, cycleRepeat, setExpanded, setVolume, pause,
    isYtReady, setYtReady,
  } = usePlayerStore()

  const current = playlist[currentIndex] ?? null
  const best = current ? getBestPlatform(current) : null
  const useDirect = best?.platform === 'direct'
  const useYT = best?.platform === 'youtube'
  const useSC = best?.platform === 'soundcloud'
  const isEmbedOnly = best !== null && (best.platform === 'spotify' || best.platform === 'apple')
  // Only show embed viewer for platforms we can't control (Spotify/Apple), not SC which has its own engine
  const showEmbed = isEmbedOnly && current && (current.spotify_url || current.soundcloud_url)

  // Auto-skip tracks that can't be played natively (Spotify/Apple), only if player was active
  const wasPlayingRef = useRef(false)
  useEffect(() => { wasPlayingRef.current = isPlaying }, [isPlaying])

  useEffect(() => {
    if (!isEmbedOnly) return
    if (wasPlayingRef.current) next()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  if (!playlist.length || !current) return null

  return (
    <>
      {useDirect && <AudioEngine track={current} isPlaying={isPlaying} volume={volume} onEnd={next} />}
      {useYT && (
        <YouTubeEngine
          track={current} isPlaying={isPlaying} volume={volume}
          onEnd={next} onReadyChange={setYtReady}
        />
      )}
      {useSC && <SoundCloudEngine track={current} isPlaying={isPlaying} />}

      {/* Expanded panel */}
      {isExpanded && (
        <div className="fixed inset-x-0 top-[72px] z-40 flex flex-col border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl shadow-2xl" style={{ maxHeight: '60vh' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] flex-shrink-0">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400">{meta?.name ?? 'Playlist'}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{playlist.length} tracks{meta?.description ? ` · ${meta.description}` : ''}</p>
            </div>
            <button onClick={() => setExpanded(false)} className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <ChevronDown size={18} />
            </button>
          </div>

          {showEmbed && best && (
            <div className="px-4 pt-3 pb-3 flex-shrink-0 border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Solo disponible en{' '}
                  <span className="font-semibold text-[var(--foreground)]">
                    {PLATFORM_LABELS[best.platform as PlayerPlatform]}
                  </span>
                </p>
                <a
                  href={best.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                >
                  <ExternalLink size={11} />
                  Abrir en {PLATFORM_LABELS[best.platform as PlayerPlatform]}
                </a>
              </div>
              <EmbedViewer track={current} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-2 px-2 min-h-0">
            {playlist.map((t, i) => (
              <TrackRow key={`${t.id}-${i}`} track={t} index={i}
                isActive={i === currentIndex} isPlaying={isPlaying}
                onPlay={() => { playTrack(i); setExpanded(false) }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-[60] h-[72px] border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-3">

          {/* Track info */}
          <button
            onClick={() => setExpanded(!isExpanded)}
            className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none sm:w-64 group text-left"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--muted)] flex-shrink-0 ring-1 ring-[var(--border)] group-hover:ring-purple-500/40 transition-all">
              {current.cover_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={current.cover_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><Music2 size={16} className="text-[var(--border)]" /></div>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-purple-400 transition-colors leading-tight">{current.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs text-[var(--muted-foreground)] truncate">{current.artist}</p>
                {best && (
                  <span className={`hidden sm:inline px-1.5 py-0.5 rounded text-[10px] border ${PLATFORM_COLORS[best.platform as PlayerPlatform]}`}>
                    {PLATFORM_LABELS[best.platform as PlayerPlatform]}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-1 justify-center">
            <button onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-colors hidden sm:flex ${shuffle ? 'text-purple-400' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
              <Shuffle size={15} />
            </button>
            <button onClick={prev} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <SkipBack size={18} />
            </button>
            {isEmbedOnly && best ? (
              <a
                href={best.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setExpanded(true)}
                title={`Abrir en ${PLATFORM_LABELS[best.platform as PlayerPlatform]}`}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg flex-shrink-0"
              >
                <ExternalLink size={16} />
              </a>
            ) : (
              <button
                onClick={toggle}
                className={`w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-transform shadow-lg flex-shrink-0 ${useYT && !isYtReady ? 'opacity-70 cursor-wait' : 'hover:scale-105'}`}
              >
                {useYT && !isYtReady
                  ? <Loader2 size={18} className="animate-spin" />
                  : isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />
                }
              </button>
            )}
            <button onClick={next} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <SkipForward size={18} />
            </button>
            <button onClick={cycleRepeat}
              className={`p-2 rounded-lg transition-colors hidden sm:flex ${repeat !== 'none' ? 'text-purple-400' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
              {repeat === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
            </button>
          </div>

          {/* Volume + expand */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5">
              <button onClick={() => setVolume(volume === 0 ? 80 : 0)}
                className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input type="range" min={0} max={100} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-20 accent-purple-500 cursor-pointer" />
            </div>

            <button onClick={() => setExpanded(!isExpanded)}
              className="relative p-2 text-[var(--muted-foreground)] hover:text-purple-400 transition-colors">
              <ListMusic size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-600 text-[9px] text-white font-bold flex items-center justify-center">
                {playlist.length}
              </span>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
