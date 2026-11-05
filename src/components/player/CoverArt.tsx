'use client'

import { useEffect, useState } from 'react'
import { Music2 } from 'lucide-react'
import { resolveCoverForTrack, type PlayerTrack } from '@/lib/player-store'

/**
 * Cover tied to a specific track id. Remounts on track change so iOS/Safari
 * never keeps showing the previous song's decoded bitmap while the next URL
 * is still loading (classic "stale artwork" on fast skips).
 */
export function resolveTrackCoverUrl(track: PlayerTrack): string | null {
  return resolveCoverForTrack(track)
}

/** Absolute URL for Media Session (relative paths break on iOS lock screen). */
export function absolutizeCoverUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  if (typeof window === 'undefined') return url
  try {
    return new URL(url, window.location.origin).href
  } catch {
    return url
  }
}

export function mediaSessionArtwork(track: PlayerTrack): MediaImage[] {
  const src = absolutizeCoverUrl(resolveTrackCoverUrl(track))
  if (!src) return []
  return [
    { src, sizes: '96x96', type: guessMime(src) },
    { src, sizes: '256x256', type: guessMime(src) },
    { src, sizes: '512x512', type: guessMime(src) },
  ]
}

function guessMime(url: string): string {
  if (/\.png(\?|$)/i.test(url)) return 'image/png'
  if (/\.webp(\?|$)/i.test(url)) return 'image/webp'
  return 'image/jpeg'
}

type Props = {
  track: PlayerTrack
  className?: string
  imgClassName?: string
  alt?: string
  iconSize?: number
}

export default function CoverArt({
  track,
  className = '',
  imgClassName = 'w-full h-full object-cover',
  alt,
  iconSize = 14,
}: Props) {
  const url = resolveTrackCoverUrl(track)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setFailed(false)
    setLoaded(false)
  }, [track.id, url])

  if (!url || failed) {
    return (
      <div className={`bg-[var(--muted)] flex items-center justify-center ${className}`}>
        <Music2 size={iconSize} className="text-[var(--border)]" />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden bg-[var(--muted)] ${className}`}>
      {/* key forces a fresh decode tied to this track — no stale artwork */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${track.id}:${url}`}
        src={url}
        alt={alt ?? track.title}
        className={`${imgClassName} transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Music2 size={iconSize} className="text-[var(--border)] animate-pulse" />
        </div>
      )}
    </div>
  )
}
