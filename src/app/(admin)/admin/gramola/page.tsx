import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Radio, Play, Check, SkipForward, Trash2, AlertCircle } from 'lucide-react'
import { setPlaying, markPlayed, skipTrack, deleteFromQueue, clearQueue } from './actions'

export const metadata: Metadata = { title: 'Admin — Gramola' }

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'text-[var(--muted-foreground)] bg-[var(--muted)]' },
  playing: { label: 'Reproduciendo', color: 'text-green-400 bg-green-500/15' },
  played: { label: 'Reproducido', color: 'text-blue-400 bg-blue-500/15' },
  skipped: { label: 'Saltado', color: 'text-orange-400 bg-orange-500/15' },
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'text-red-400',
  spotify: 'text-green-400',
  soundcloud: 'text-orange-400',
}

export default async function GramolaAdminPage() {
  const supabase = await createClient()

  const { data: queue } = await supabase
    .from('jukebox_queue')
    .select('*')
    .in('status', ['pending', 'playing'])
    .order('is_priority', { ascending: false })
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  const { data: history } = await supabase
    .from('jukebox_queue')
    .select('*')
    .in('status', ['played', 'skipped'])
    .order('created_at', { ascending: false })
    .limit(10)

  const playing = queue?.find(t => t.status === 'playing')
  const pending = queue?.filter(t => t.status === 'pending') ?? []

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Gramola</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {pending.length} en cola{playing ? ' · 1 reproduciendo' : ''}
          </p>
        </div>
        {pending.length > 0 && (
          <form action={clearQueue}>
            <button type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors">
              <Trash2 size={14} />
              Limpiar cola
            </button>
          </form>
        )}
      </div>

      {/* Now playing */}
      {playing ? (
        <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Reproduciendo ahora</span>
          </div>
          <div className="flex items-center gap-4">
            {playing.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={playing.thumbnail_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Radio size={20} className="text-green-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight truncate">{playing.title}</p>
              {playing.artist && <p className="text-sm text-[var(--muted-foreground)] truncate">{playing.artist}</p>}
              {playing.requester_name && (
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Pedido por <span className="text-[var(--foreground)]">{playing.requester_name}</span>
                  {playing.tip_amount > 0 && <span className="ml-2 text-yellow-400">+{playing.tip_amount}€</span>}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <form action={async () => { 'use server'; await markPlayed(playing.id) }}>
                <button type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition-colors">
                  <Check size={12} /> Finalizar
                </button>
              </form>
              <form action={async () => { 'use server'; await skipTrack(playing.id) }}>
                <button type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-orange-400 hover:border-orange-500/30 transition-colors">
                  <SkipForward size={12} /> Skip
                </button>
              </form>
            </div>
          </div>
          {playing.embed_url && (
            <div className="mt-4 rounded-xl overflow-hidden">
              <iframe
                src={playing.embed_url}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-[var(--muted-foreground)]">
          <Radio size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">Nada reproduciéndose ahora</p>
        </div>
      )}

      {/* Queue */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-sm">Cola pendiente</h2>
          <span className="text-xs text-[var(--muted-foreground)]">{pending.length} tracks</span>
        </div>
        {pending.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {pending.map((track, i) => (
              <div key={track.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)]/20">
                <span className="text-xs text-[var(--muted-foreground)] w-5 text-center flex-shrink-0">{i + 1}</span>
                {track.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={track.thumbnail_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                    <Radio size={13} className="text-[var(--muted-foreground)]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <div className="flex items-center gap-2">
                    {track.artist && <span className="text-xs text-[var(--muted-foreground)] truncate">{track.artist}</span>}
                    <span className={`text-[10px] capitalize ${PLATFORM_COLORS[track.source_platform] ?? 'text-[var(--muted-foreground)]'}`}>
                      {track.source_platform}
                    </span>
                    {track.is_priority && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-medium">Priority</span>
                    )}
                    {track.tip_amount > 0 && (
                      <span className="text-[10px] text-yellow-400">+{track.tip_amount}€</span>
                    )}
                  </div>
                  {track.requester_name && (
                    <p className="text-[10px] text-[var(--muted-foreground)]">por {track.requester_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <form action={async () => { 'use server'; await setPlaying(track.id) }}>
                    <button type="submit" title="Poner a reproducir"
                      className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-green-500/10 hover:text-green-400 transition-colors">
                      <Play size={13} />
                    </button>
                  </form>
                  <form action={async () => { 'use server'; await skipTrack(track.id) }}>
                    <button type="submit" title="Saltar"
                      className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-orange-500/10 hover:text-orange-400 transition-colors">
                      <SkipForward size={13} />
                    </button>
                  </form>
                  <form action={async () => { 'use server'; await deleteFromQueue(track.id) }}>
                    <button type="submit" title="Eliminar"
                      className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-[var(--muted-foreground)]">
            <AlertCircle size={28} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Cola vacía</p>
          </div>
        )}
      </div>

      {/* History */}
      {history && history.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm text-[var(--muted-foreground)]">Historial reciente</h2>
          </div>
          <div className="divide-y divide-[var(--border)] opacity-50">
            {history.map(track => {
              const cfg = STATUS_CONFIG[track.status as keyof typeof STATUS_CONFIG]
              return (
                <div key={track.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{track.title}</p>
                    {track.requester_name && <p className="text-xs text-[var(--muted-foreground)]">por {track.requester_name}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg?.color}`}>
                    {cfg?.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
