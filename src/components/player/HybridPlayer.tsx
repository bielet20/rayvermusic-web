'use client'

import { useEffect, useRef, useCallback, type MutableRefObject } from 'react'
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
  loadYouTubeIframeAPI,
  loadSoundCloudWidgetAPI,
  unlockMediaPlayback,
  runPlayFromUserGesture,
  setMediaBridge,
  prepareHtmlAudio,
  iosSafeHiddenMediaStyle,
  isIOSDevice,
  isStandalonePWA,
} from '@/lib/media-loaders'
import CoverArt, { mediaSessionArtwork } from '@/components/player/CoverArt'
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  ChevronDown, Volume2, VolumeX, ListMusic, Loader2, ExternalLink,
} from 'lucide-react'

/**
 * Persistent engines stay mounted for the life of the player chrome.
 * Remounting/destroying YT.Player or iframes between tracks is the main
 * reason iPhone PWA plays once and then YouTube/Spotify go silent: the next
 * play() runs from useEffect outside the tap gesture.
 */

// ─── YouTube Engine (singleton instance, never destroy on track change) ──
function YouTubeEngine({
  track,
  active,
  isPlaying,
  volume,
  onEnd,
  onReadyChange,
  playerRefOut,
}: {
  track: PlayerTrack | null
  active: boolean
  isPlaying: boolean
  volume: number
  onEnd: () => void
  onReadyChange: (ready: boolean) => void
  playerRefOut: MutableRefObject<YTPlayer | null>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const readyRef = useRef(false)
  const isPlayingRef = useRef(isPlaying)
  const activeRef = useRef(active)
  const volumeRef = useRef(volume)
  const onEndRef = useRef(onEnd)
  const onReadyChangeRef = useRef(onReadyChange)
  const wantedIdRef = useRef<string | null>(null)
  const bootedRef = useRef(false)

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => { volumeRef.current = volume }, [volume])
  useEffect(() => { onEndRef.current = onEnd }, [onEnd])
  useEffect(() => { onReadyChangeRef.current = onReadyChange }, [onReadyChange])

  const videoId = track?.youtube_url ? extractYouTubeId(track.youtube_url) : null

  const applyPlayState = useCallback(() => {
    const player = playerRef.current
    if (!player || !readyRef.current) return
    try {
      if (activeRef.current && isPlayingRef.current) player.playVideo()
      else player.pauseVideo()
    } catch { /* mid-destroy */ }
  }, [])

  // Boot the player once
  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true
    let cancelled = false

    ;(async () => {
      let YT: YTNamespace
      try {
        YT = await loadYouTubeIframeAPI()
      } catch {
        return
      }
      if (cancelled || !containerRef.current) return

      const host = containerRef.current
      host.innerHTML = ''
      const mount = document.createElement('div')
      host.appendChild(mount)

      const initialId = wantedIdRef.current || videoId || undefined
      playerRef.current = new YT.Player(mount, {
        videoId: initialId,
        width: 1,
        height: 1,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 0,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            if (cancelled) return
            readyRef.current = true
            playerRefOut.current = e.target
            onReadyChangeRef.current(true)
            try { e.target.setVolume(volumeRef.current) } catch { /* noop */ }
            applyPlayState()
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === YT.PlayerState.ENDED && activeRef.current) onEndRef.current()
          },
          onError: () => {
            if (activeRef.current && isPlayingRef.current) onEndRef.current()
          },
        },
      })
      playerRefOut.current = playerRef.current
    })()

    return () => {
      cancelled = true
      try { playerRef.current?.destroy() } catch { /* noop */ }
      playerRef.current = null
      playerRefOut.current = null
      readyRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track change: NEVER recreate — loadVideoById / cueVideoById only
  useEffect(() => {
    if (!videoId) {
      if (readyRef.current && playerRef.current && !active) {
        try { playerRef.current.pauseVideo() } catch { /* noop */ }
      }
      return
    }
    wantedIdRef.current = videoId
    if (!playerRef.current || !readyRef.current) return
    if (!active) {
      try { playerRef.current.pauseVideo() } catch { /* noop */ }
      return
    }
    try {
      if (isPlayingRef.current) playerRef.current.loadVideoById(videoId)
      else playerRef.current.cueVideoById(videoId)
    } catch { /* noop */ }
  }, [videoId, active])

  useEffect(() => { applyPlayState() }, [isPlaying, active, applyPlayState])

  useEffect(() => {
    if (readyRef.current) {
      try { playerRef.current?.setVolume(volume) } catch { /* noop */ }
    }
  }, [volume])

  return <div ref={containerRef} style={iosSafeHiddenMediaStyle()} aria-hidden />
}

// ─── Direct Audio Engine (one element, swap src — don't recreate) ──
function AudioEngine({
  track,
  active,
  isPlaying,
  volume,
  onEnd,
  audioRefOut,
}: {
  track: PlayerTrack | null
  active: boolean
  isPlaying: boolean
  volume: number
  onEnd: () => void
  audioRefOut: MutableRefObject<HTMLAudioElement | null>
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(isPlaying)
  const activeRef = useRef(active)
  const onEndRef = useRef(onEnd)

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => { onEndRef.current = onEnd }, [onEnd])

  useEffect(() => {
    const audio = prepareHtmlAudio(new Audio())
    audioRef.current = audio
    audioRefOut.current = audio
    const handleEnded = () => {
      if (activeRef.current) onEndRef.current()
    }
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
      audioRef.current = null
      audioRefOut.current = null
    }
  }, [audioRefOut])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track?.audio_url) return
    const next = track.audio_url
    if (audio.src !== next && !audio.src.endsWith(next) && audio.getAttribute('data-url') !== next) {
      audio.setAttribute('data-url', next)
      audio.src = next
      // Don't call load()+play here on iOS — that must happen in the tap bridge
      if (!(isIOSDevice() && isStandalonePWA())) {
        audio.load()
      }
    }
    audio.volume = volume / 100
  }, [track?.audio_url, volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (active && isPlaying) {
      // Desktop / non-strict: effect play is a fallback. iOS relies on the bridge.
      if (!(isIOSDevice() && isStandalonePWA())) {
        void audio.play().catch(() => {})
      }
    } else {
      audio.pause()
    }
  }, [isPlaying, active])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100
  }, [volume])

  return null
}

// ─── SoundCloud Engine (one iframe + Widget.load, never remount src blindly) ──
function SoundCloudEngine({
  track,
  active,
  isPlaying,
  volume,
  onEnd,
  widgetRefOut,
}: {
  track: PlayerTrack | null
  active: boolean
  isPlaying: boolean
  volume: number
  onEnd: () => void
  widgetRefOut: MutableRefObject<SCWidget | null>
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<SCWidget | null>(null)
  const readyRef = useRef(false)
  const isPlayingRef = useRef(isPlaying)
  const activeRef = useRef(active)
  const volumeRef = useRef(volume)
  const onEndRef = useRef(onEnd)
  const boundUrlRef = useRef<string | null>(null)
  const bootedRef = useRef(false)

  const pageUrl = track?.soundcloud_url ?? null

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => { volumeRef.current = volume }, [volume])
  useEffect(() => { onEndRef.current = onEnd }, [onEnd])

  const applyPlayState = useCallback(() => {
    const widget = widgetRef.current
    if (!widget || !readyRef.current) return
    try {
      if (activeRef.current && isPlayingRef.current) widget.play()
      else widget.pause()
    } catch { /* noop */ }
  }, [])

  // Boot once with a blank-ish first track URL or placeholder
  useEffect(() => {
    if (bootedRef.current || !iframeRef.current) return
    bootedRef.current = true
    const iframe = iframeRef.current
    let cancelled = false

    ;(async () => {
      try {
        await loadSoundCloudWidgetAPI()
      } catch {
        return
      }
      if (cancelled || !iframeRef.current) return

      await new Promise<void>((resolve) => {
        const onLoad = () => {
          iframe.removeEventListener('load', onLoad)
          resolve()
        }
        iframe.addEventListener('load', onLoad)
        window.setTimeout(() => {
          iframe.removeEventListener('load', onLoad)
          resolve()
        }, 2000)
      })
      if (cancelled || !window.SC?.Widget) return

      const widget = window.SC.Widget(iframe)
      widgetRef.current = widget
      widgetRefOut.current = widget

      widget.bind(window.SC.Widget.Events.READY, () => {
        readyRef.current = true
        try { widget.setVolume?.(volumeRef.current) } catch { /* noop */ }
        applyPlayState()
      })
      widget.bind(window.SC.Widget.Events.FINISH, () => {
        if (activeRef.current) onEndRef.current()
      })
    })()

    return () => {
      cancelled = true
      widgetRef.current = null
      widgetRefOut.current = null
    }
  }, [applyPlayState, widgetRefOut])

  // Track change via Widget.load — do not remount the iframe
  useEffect(() => {
    if (!pageUrl || !widgetRef.current) return
    if (boundUrlRef.current === pageUrl) {
      applyPlayState()
      return
    }
    boundUrlRef.current = pageUrl
    readyRef.current = false
    try {
      widgetRef.current.load(pageUrl, {
        auto_play: false,
        callback: () => {
          readyRef.current = true
          applyPlayState()
        },
      })
    } catch { /* noop */ }
  }, [pageUrl, applyPlayState])

  useEffect(() => { applyPlayState() }, [isPlaying, active, applyPlayState])

  useEffect(() => {
    if (readyRef.current) {
      try { widgetRef.current?.setVolume?.(volume) } catch { /* noop */ }
    }
  }, [volume])

  // Seed iframe with first available SC url or a harmless blank player shell
  const seed = pageUrl
    ? getSoundCloudWidgetUrl(pageUrl, false)
    : 'https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fsoundcloud%2Fsets%2Fsoundcloud-charts-top&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false'

  return (
    <iframe
      ref={iframeRef}
      src={seed}
      title="SoundCloud player"
      style={iosSafeHiddenMediaStyle()}
      aria-hidden
      allow="autoplay; encrypted-media"
    />
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

      <CoverArt track={track} className="w-10 h-10 rounded-lg flex-shrink-0" iconSize={14} />

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

function EmbedViewer({ track, autoPlay }: { track: PlayerTrack; autoPlay?: boolean }) {
  if (track.spotify_url) {
    // Stable key by track id so React does not thrash the iframe on unrelated renders;
    // still remounts per track (Spotify has no load API). On iOS PWA autoplay inside
    // the embed usually fails after the first track — user must tap Spotify's own play.
    const src = getSpotifyEmbedUrl(track.spotify_url) + (autoPlay ? '&autoplay=1' : '')
    return (
      <iframe
        key={track.id}
        src={src}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="eager"
        className="w-full rounded-xl border-0"
        style={{ height: 152 }}
        title="Spotify embed"
      />
    )
  }
  if (track.soundcloud_url) {
    return (
      <iframe
        src={getSoundCloudWidgetUrl(track.soundcloud_url, !!autoPlay)}
        allow="autoplay"
        className="w-full rounded-xl border-0"
        style={{ height: 120 }}
        title="SoundCloud embed"
      />
    )
  }
  return null
}

function spotifyDeepLink(url: string): string {
  // open.spotify.com/track/ID → spotify:track:ID (opens app from PWA when possible)
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([A-Za-z0-9]+)/)
  if (m) return `spotify:${m[1]}:${m[2]}`
  return url
}

// ─── Main Component ───────────────────────────────────────────
export default function HybridPlayer() {
  const {
    playlist, meta, currentIndex, isPlaying, isExpanded, shuffle, repeat, volume,
    toggle, next, prev, playTrack, toggleShuffle, cycleRepeat, setExpanded, setVolume,
    isYtReady, setYtReady,
  } = usePlayerStore()

  const current = playlist[currentIndex] ?? null
  const best = current ? getBestPlatform(current) : null
  const useDirect = best?.platform === 'direct'
  const useYT = best?.platform === 'youtube'
  const useSC = best?.platform === 'soundcloud'
  const isEmbedOnly = best !== null && (best.platform === 'spotify' || best.platform === 'apple')
  const showEmbed = isEmbedOnly && current && (current.spotify_url || current.soundcloud_url)

  const ytPlayerRef = useRef<YTPlayer | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const scWidgetRef = useRef<SCWidget | null>(null)
  const currentRef = useRef(current)
  const bestRef = useRef(best)
  useEffect(() => { currentRef.current = current }, [current])
  useEffect(() => { bestRef.current = best }, [best])

  // Media Session metadata (lock screen / Control Center). Does not start playback.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !current) return
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: current.artist,
        artwork: mediaSessionArtwork(current),
      })
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    } catch { /* older WebKit */ }
  }, [current, isPlaying])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        unlockMediaPlayback()
        usePlayerStore.getState().play()
        // Media Session handlers count as a gesture on some iOS versions
        runPlayFromUserGesture(true)
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        usePlayerStore.getState().pause()
        runPlayFromUserGesture(false)
      })
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        unlockMediaPlayback()
        usePlayerStore.getState().next()
        // next() updates index async relative to bridge — nudge after microtask
        queueMicrotask(() => runPlayFromUserGesture(true))
      })
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        unlockMediaPlayback()
        usePlayerStore.getState().prev()
        queueMicrotask(() => runPlayFromUserGesture(true))
      })
    } catch { /* noop */ }
    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null)
        navigator.mediaSession.setActionHandler('pause', null)
        navigator.mediaSession.setActionHandler('nexttrack', null)
        navigator.mediaSession.setActionHandler('previoustrack', null)
      } catch { /* noop */ }
    }
  }, [])

  // Register a sync bridge so taps can start media inside the gesture stack
  useEffect(() => {
    setMediaBridge({
      playSync: () => {
        const b = bestRef.current
        const t = currentRef.current
        if (!b || !t) return
        if (b.platform === 'youtube') {
          const id = extractYouTubeId(t.youtube_url || '')
          const p = ytPlayerRef.current
          if (!p || !id) return
          try {
            p.loadVideoById(id)
            p.playVideo()
          } catch { /* noop */ }
        } else if (b.platform === 'direct') {
          const a = audioElRef.current
          if (!a || !t.audio_url) return
          try {
            if (a.getAttribute('data-url') !== t.audio_url) {
              a.setAttribute('data-url', t.audio_url)
              a.src = t.audio_url
            }
            void a.play()
          } catch { /* noop */ }
        } else if (b.platform === 'soundcloud') {
          const w = scWidgetRef.current
          if (!w || !t.soundcloud_url) return
          try {
            w.load(t.soundcloud_url, { auto_play: true })
            w.play()
          } catch {
            try { w.play() } catch { /* noop */ }
          }
        }
        // Spotify/Apple: no reliable programmatic play in iOS PWA — UI opens embed / deep link
      },
      pauseSync: () => {
        try { ytPlayerRef.current?.pauseVideo() } catch { /* noop */ }
        try { audioElRef.current?.pause() } catch { /* noop */ }
        try { scWidgetRef.current?.pause() } catch { /* noop */ }
      },
    })
    return () => setMediaBridge(null)
  }, [])

  // Preload APIs once
  useEffect(() => {
    void loadYouTubeIframeAPI().catch(() => {})
    void loadSoundCloudWidgetAPI().catch(() => {})
  }, [])

  if (!playlist.length || !current) return null

  const onToggle = () => {
    const willPlay = !usePlayerStore.getState().isPlaying
    runPlayFromUserGesture(willPlay)
    toggle()
  }
  const onPrev = () => {
    runPlayFromUserGesture(true)
    prev()
    // After prev updates the store, nudge play again for the new track inside
    // a microtask — still usually within iOS transient activation on WebKit.
    queueMicrotask(() => runPlayFromUserGesture(true))
  }
  const onNext = () => {
    runPlayFromUserGesture(true)
    next()
    queueMicrotask(() => runPlayFromUserGesture(true))
  }
  const onPlayTrack = (i: number) => {
    runPlayFromUserGesture(true)
    playTrack(i)
    setExpanded(false)
    queueMicrotask(() => runPlayFromUserGesture(true))
  }
  const onOpenSpotify = () => {
    if (!current.spotify_url) return
    unlockMediaPlayback()
    // Prefer app deep link from standalone PWA; fall back to https
    const deep = spotifyDeepLink(current.spotify_url)
    window.location.href = deep
  }

  return (
    <>
      {/* Engines stay mounted — only `active` flips. Avoids iOS destroy/recreate trap. */}
      <AudioEngine
        track={current}
        active={!!useDirect}
        isPlaying={isPlaying}
        volume={volume}
        onEnd={next}
        audioRefOut={audioElRef}
      />
      <YouTubeEngine
        track={current}
        active={!!useYT}
        isPlaying={isPlaying}
        volume={volume}
        onEnd={next}
        onReadyChange={setYtReady}
        playerRefOut={ytPlayerRef}
      />
      <SoundCloudEngine
        track={current}
        active={!!useSC}
        isPlaying={isPlaying}
        volume={volume}
        onEnd={next}
        widgetRefOut={scWidgetRef}
      />

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
              <div className="flex items-center justify-between mb-3 gap-2">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Solo disponible en{' '}
                  <span className="font-semibold text-[var(--foreground)]">
                    {PLATFORM_LABELS[best.platform as PlayerPlatform]}
                  </span>
                  {isIOSDevice() && best.platform === 'spotify' ? (
                    <span className="block mt-1">En iPhone (PWA) pulsa el play del embed o abre la app.</span>
                  ) : null}
                </p>
                {best.platform === 'spotify' ? (
                  <button
                    type="button"
                    onClick={onOpenSpotify}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors flex-shrink-0"
                  >
                    <ExternalLink size={11} />
                    Abrir en Spotify
                  </button>
                ) : (
                  <a
                    href={best.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors flex-shrink-0"
                  >
                    <ExternalLink size={11} />
                    Abrir en {PLATFORM_LABELS[best.platform as PlayerPlatform]}
                  </a>
                )}
              </div>
              <EmbedViewer track={current} autoPlay={isPlaying && !isIOSDevice()} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-2 px-2 min-h-0">
            {playlist.map((t, i) => (
              <TrackRow key={`${t.id}-${i}`} track={t} index={i}
                isActive={i === currentIndex} isPlaying={isPlaying}
                onPlay={() => onPlayTrack(i)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="fixed top-0 inset-x-0 z-[60] h-[72px] border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-3">

          <button
            onClick={() => setExpanded(!isExpanded)}
            className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none sm:w-64 group text-left"
          >
            <CoverArt track={current} className="w-10 h-10 rounded-lg flex-shrink-0 ring-1 ring-[var(--border)] group-hover:ring-purple-500/40 transition-all" iconSize={16} />
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

          <div className="flex items-center gap-1 flex-1 justify-center">
            <button onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-colors hidden sm:flex ${shuffle ? 'text-purple-400' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
              <Shuffle size={15} />
            </button>
            <button onClick={onPrev} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <SkipBack size={18} />
            </button>
            {isEmbedOnly && best ? (
              best.platform === 'spotify' ? (
                <button
                  type="button"
                  onClick={() => { setExpanded(true); onOpenSpotify() }}
                  title="Abrir en Spotify"
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg flex-shrink-0"
                >
                  <ExternalLink size={16} />
                </button>
              ) : (
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
              )
            ) : (
              <button
                onClick={onToggle}
                className={`w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-transform shadow-lg flex-shrink-0 ${useYT && !isYtReady ? 'opacity-70 cursor-wait' : 'hover:scale-105'}`}
              >
                {useYT && !isYtReady
                  ? <Loader2 size={18} className="animate-spin" />
                  : isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />
                }
              </button>
            )}
            <button onClick={onNext} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <SkipForward size={18} />
            </button>
            <button onClick={cycleRepeat}
              className={`p-2 rounded-lg transition-colors hidden sm:flex ${repeat !== 'none' ? 'text-purple-400' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
              {repeat === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
            </button>
          </div>

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
