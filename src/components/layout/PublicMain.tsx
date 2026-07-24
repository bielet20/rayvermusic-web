'use client'

import { usePlayerStore } from '@/lib/player-store'

export default function PublicMain({ children }: { children: React.ReactNode }) {
  const hasPlayer = usePlayerStore(s => s.playlist.length > 0)
  return (
    <main className={`flex-1 transition-[padding-top] duration-200 ${hasPlayer ? 'pt-[136px]' : 'pt-16'}`}>
      {children}
    </main>
  )
}
