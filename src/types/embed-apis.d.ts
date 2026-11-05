interface YTPlayer {
  loadVideoById: (id: string) => void
  cueVideoById: (id: string) => void
  playVideo: () => void
  pauseVideo: () => void
  setVolume: (v: number) => void
  destroy: () => void
  getPlayerState?: () => number
}

interface SCWidget {
  play: () => void
  pause: () => void
  load: (url: string, opts?: Record<string, unknown>) => void
  bind: (event: string, handler: (...args: unknown[]) => void) => void
  unbind: (event: string) => void
  setVolume?: (v: number) => void
}

interface YTNamespace {
  Player: new (el: HTMLElement | string, opts: Record<string, unknown>) => YTPlayer
  PlayerState: {
    PLAYING: number
    PAUSED: number
    ENDED: number
    BUFFERING: number
    UNSTARTED: number
    CUED: number
  }
}

interface SCNamespace {
  Widget: ((iframe: HTMLIFrameElement) => SCWidget) & {
    Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string; ERROR: string }
  }
}

interface Window {
  YT?: YTNamespace
  onYouTubeIframeAPIReady?: (() => void) | undefined
  SC?: SCNamespace
}
