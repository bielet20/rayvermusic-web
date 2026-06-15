'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Radio, Music2, Search, Plus, Clock, Zap } from 'lucide-react'
import type { Database } from '@/types/database'

type QueueItem = Database['public']['Tables']['jukebox_queue']['Row']

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'text-red-400',
  spotify: 'text-green-400',
  soundcloud: 'text-orange-400',
}

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className={`text-xs font-medium capitalize ${PLATFORM_COLORS[platform] ?? 'text-[var(--muted-foreground)]'}`}>
      {platform}
    </span>
  )
}

export default function GramolaClient() {
  const supabase = createClient()
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadQueue() {
      const { data } = await supabase
        .from('jukebox_queue')
        .select('*')
        .in('status', ['pending', 'playing'])
        .order('is_priority', { ascending: false })
        .order('position', { ascending: true })
        .order('created_at', { ascending: true })
      setQueue(data ?? [])
    }
    loadQueue()

    const channel = supabase
      .channel('gramola-queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jukebox_queue' }, () => loadQueue())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  function detectPlatform(url: string) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('spotify.com')) return 'spotify'
    if (url.includes('soundcloud.com')) return 'soundcloud'
    return 'other'
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/gramola/resolve?url=${encodeURIComponent(url)}`)
      const track = res.ok ? await res.json() : null

      await supabase.from('jukebox_queue').insert({
        title: track?.title ?? 'Track solicitado',
        artist: track?.artist ?? null,
        source_url: url,
        source_platform: detectPlatform(url),
        embed_url: track?.embed_url ?? null,
        thumbnail_url: track?.thumbnail_url ?? null,
        requester_name: name.trim() || 'Anónimo',
        tip_amount: 0,
        is_priority: false,
        position: queue.length,
        status: 'pending',
      })
      setUrl('')
      setName('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('No se pudo añadir a la cola. Verifica la URL.')
    }
    setLoading(false)
  }

  const playing = queue.find(q => q.status === 'playing')
  const pending = queue.filter(q => q.status === 'pending')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4 glow-purple">
          <Radio size={28} className="text-purple-400" />
        </div>
        <h1 className="text-3xl font-black">Gramola</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-2">
          Pide una canción y aparece en el set en directo
        </p>
      </div>

      {/* Now playing */}
      {playing && (
        <div className="mb-6 p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Sonando ahora</span>
          </div>
          <div className="flex items-center gap-3">
            {playing.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={playing.thumbnail_url} alt={playing.title} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                <Music2 size={20} className="text-purple-400" />
              </div>
            )}
            <div>
              <p className="font-bold">{playing.title}</p>
              {playing.artist && <p className="text-sm text-[var(--muted-foreground)]">{playing.artist}</p>}
              <PlatformBadge platform={playing.source_platform} />
            </div>
          </div>
        </div>
      )}

      {/* Request form */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Plus size={16} /> Pide una canción</h2>
        <form onSubmit={handleRequest} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
              URL de YouTube, Spotify o SoundCloud
            </label>
            <input
              type="url" required value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Tu nombre (opcional)</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Anónimo"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-green-400">¡Canción añadida a la cola!</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Radio size={14} />
            {loading ? 'Añadiendo...' : 'Pedir canción'}
          </button>
        </form>
      </div>

      {/* Queue */}
      {pending.length > 0 && (
        <div>
          <h2 className="font-bold mb-3 flex items-center gap-2 text-sm">
            <Clock size={14} />
            Cola ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                <span className="text-xs font-bold text-[var(--muted-foreground)] w-5 text-center">{idx + 1}</span>
                {item.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnail_url} alt={item.title} className="w-9 h-9 rounded-lg object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[var(--muted)] flex items-center justify-center shrink-0">
                    <Music2 size={14} className="text-[var(--muted-foreground)]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-2">
                    {item.requester_name && <p className="text-xs text-[var(--muted-foreground)]">por {item.requester_name}</p>}
                    <PlatformBadge platform={item.source_platform} />
                  </div>
                </div>
                {item.is_priority && <Zap size={14} className="text-yellow-400 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {!playing && pending.length === 0 && (
        <div className="text-center py-10 text-[var(--muted-foreground)]">
          <Radio size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">La cola está vacía. ¡Sé el primero en pedir!</p>
        </div>
      )}
    </div>
  )
}
