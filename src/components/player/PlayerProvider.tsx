'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePlayerStore } from '@/lib/player-store'

const HybridPlayer = dynamic(() => import('./HybridPlayer'), { ssr: false })

export default function PlayerProvider() {
  const { loadPlaylist, isLoaded } = usePlayerStore()

  useEffect(() => {
    // Pre-carga YouTube API para reducir el tiempo de init del player
    if (typeof window !== 'undefined' && !window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
    if (isLoaded) return
    fetch('/api/player/playlist?id=default')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.tracks?.length) {
          loadPlaylist(data.tracks, data.playlist)
        }
      })
      .catch(() => { /* silencioso si Supabase no está disponible */ })
  }, [isLoaded, loadPlaylist])

  return <HybridPlayer />
}
