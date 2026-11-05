/**
 * Shared loaders for embed APIs + iOS/PWA playback unlock.
 *
 * Avoids classic races (YT stub before Player, missed onYouTubeIframeAPIReady).
 *
 * iOS Safari / standalone PWA (Add to Home Screen):
 * - Only play() that starts inside the tap gesture stack is allowed.
 * - play() from a React useEffect after setState is NOT in that stack → second
 *   track fails even if the first (already-warm) one worked.
 * - Destroying/recreating iframe or YT.Player between tracks forces the next
 *   play into that async path → "works once, then YouTube/Spotify die".
 * - Unlock the audio session on the first tap; use playsInline on <audio>.
 */

let ytPromise: Promise<YTNamespace> | null = null
let scPromise: Promise<SCNamespace> | null = null

export function loadYouTubeIframeAPI(): Promise<YTNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API requires a browser'))
  }
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (ytPromise) return ytPromise

  ytPromise = new Promise<YTNamespace>((resolve) => {
    const done = () => {
      if (window.YT?.Player) resolve(window.YT)
    }

    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      try { prev?.() } catch { /* ignore */ }
      done()
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      document.head.appendChild(tag)
    }

    const started = Date.now()
    const iv = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(iv)
        done()
      } else if (Date.now() - started > 20000) {
        window.clearInterval(iv)
      }
    }, 40)
  })

  return ytPromise
}

export function loadSoundCloudWidgetAPI(): Promise<SCNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('SoundCloud API requires a browser'))
  }
  if (window.SC?.Widget) return Promise.resolve(window.SC)
  if (scPromise) return scPromise

  scPromise = new Promise<SCNamespace>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="w.soundcloud.com/player/api.js"]')
    if (existing) {
      if (window.SC?.Widget) {
        resolve(window.SC)
        return
      }
      existing.addEventListener('load', () => {
        if (window.SC?.Widget) resolve(window.SC)
        else reject(new Error('SoundCloud Widget API failed to load'))
      }, { once: true })
      existing.addEventListener('error', () => reject(new Error('SoundCloud script error')), { once: true })
      const started = Date.now()
      const iv = window.setInterval(() => {
        if (window.SC?.Widget) {
          window.clearInterval(iv)
          resolve(window.SC)
        } else if (Date.now() - started > 15000) {
          window.clearInterval(iv)
          reject(new Error('SoundCloud Widget API timeout'))
        }
      }, 40)
      return
    }

    const s = document.createElement('script')
    s.src = 'https://w.soundcloud.com/player/api.js'
    s.async = true
    s.onload = () => {
      if (window.SC?.Widget) resolve(window.SC)
      else reject(new Error('SoundCloud Widget API missing after load'))
    }
    s.onerror = () => reject(new Error('SoundCloud script error'))
    document.head.appendChild(s)
  })

  return scPromise
}

export function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

/** Safari "Add to Home Screen" or installed web app. */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    nav.standalone === true
  )
}

export type MediaBridge = {
  /** Must invoke the native play API synchronously (inside the tap). */
  playSync: () => void
  pauseSync: () => void
  /** Optional: switch media for a new track still inside the tap. */
  loadAndPlaySync?: (payload: { youtubeId?: string | null; audioUrl?: string | null; soundcloudUrl?: string | null }) => void
}

let mediaBridge: MediaBridge | null = null

export function setMediaBridge(bridge: MediaBridge | null): void {
  mediaBridge = bridge
}

let unlockAudioEl: HTMLAudioElement | null = null
let sharedAudioCtx: AudioContext | null = null

function ensureInlineAudio(el: HTMLAudioElement): void {
  el.setAttribute('playsinline', 'true')
  el.setAttribute('webkit-playsinline', 'true')
  ;(el as HTMLAudioElement & { playsInline: boolean }).playsInline = true
  el.preload = 'auto'
}

/** Warm the iOS/Safari audio session from a real user gesture (tap). */
export function unlockMediaPlayback(): void {
  if (typeof window === 'undefined') return
  try {
    if (!unlockAudioEl) {
      unlockAudioEl = new Audio()
      ensureInlineAudio(unlockAudioEl)
      unlockAudioEl.src =
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
    }
    void unlockAudioEl.play().then(() => {
      unlockAudioEl?.pause()
      try { unlockAudioEl!.currentTime = 0 } catch { /* noop */ }
    }).catch(() => {})

    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AC) {
      if (!sharedAudioCtx) sharedAudioCtx = new AC()
      if (sharedAudioCtx.state === 'suspended') {
        void sharedAudioCtx.resume().catch(() => {})
      }
    }
  } catch { /* ignore */ }
}

/**
 * Call from every Play / Pause / Next / Prev / track-row tap.
 * Unlocks the session and runs play/pause inside the gesture stack.
 */
export function runPlayFromUserGesture(willPlay: boolean): void {
  unlockMediaPlayback()
  try {
    if (willPlay) mediaBridge?.playSync()
    else mediaBridge?.pauseSync()
  } catch { /* engine may not be ready yet — onReady will pick up isPlaying */ }
}

export function prepareHtmlAudio(audio: HTMLAudioElement): HTMLAudioElement {
  ensureInlineAudio(audio)
  return audio
}

/** iOS suspends left:-9999px media; keep a 1×1 node inside the viewport. */
export function iosSafeHiddenMediaStyle(): Record<string, string | number> {
  if (isIOSDevice()) {
    return {
      position: 'fixed',
      width: 1,
      height: 1,
      bottom: 0,
      right: 0,
      opacity: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: -1,
    }
  }
  return {
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    pointerEvents: 'none',
  }
}

export function getMediaBridge(): MediaBridge | null {
  return mediaBridge
}
