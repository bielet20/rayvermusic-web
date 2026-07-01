'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePlayerStore } from '@/lib/player-store'

const HybridPlayer = dynamic(() => import('./HybridPlayer'), { ssr: false })

export default function PlayerProvider() {
  const { loadPlaylist, isLoaded } = usePlayerStore()

  useEffect(() => {
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
