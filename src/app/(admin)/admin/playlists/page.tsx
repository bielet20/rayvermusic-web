import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ListMusic, Plus, Star, Music2, ArrowRight, Zap } from 'lucide-react'

export const metadata: Metadata = { title: 'Playlists — Admin' }

const SORT_LABELS: Record<string, string> = {
  custom: 'Orden manual',
  newest: 'Más recientes',
  featured: 'Destacados',
  plays: 'Más escuchados',
}

export default async function AdminPlaylistsPage() {
  const supabase = await createClient()

  const { data: playlists } = await supabase
    .from('playlists')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  const { data: ptCounts } = await supabase
    .from('playlist_tracks')
    .select('playlist_id')

  const countMap: Record<string, number> = {}
  ptCounts?.forEach(pt => {
    countMap[pt.playlist_id] = (countMap[pt.playlist_id] ?? 0) + 1
  })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Playlists</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Gestiona las listas de reproducción del reproductor híbrido
          </p>
        </div>
        <Link
          href="/admin/playlists/nueva"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
        >
          <Plus size={15} />
          Nueva playlist
        </Link>
      </div>

      {/* Info box */}
      <div className="mb-6 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-start gap-3">
        <Zap size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-purple-300 mb-1">¿Cómo funciona?</p>
          <p className="text-[var(--muted-foreground)]">
            La playlist marcada como <strong className="text-[var(--foreground)]">Por defecto</strong> se carga automáticamente en el reproductor al visitar la web.
            Crea playlists manuales (ordenas tú los tracks) o automáticas (las ordena el sistema por fecha, destacados o plays).
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {playlists?.map(pl => (
          <div
            key={pl.id}
            className={`flex items-center gap-4 p-5 rounded-2xl border bg-[var(--card)] transition-all ${
              pl.is_default ? 'border-purple-500/40 bg-purple-500/5' : 'border-[var(--border)] hover:border-purple-500/20'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              pl.is_default ? 'bg-purple-500/20 text-purple-400' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}>
              <ListMusic size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base">{pl.name}</h3>
                {pl.is_default && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30">
                    <Star size={10} />
                    Por defecto
                  </span>
                )}
                {!pl.is_active && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    Inactiva
                  </span>
                )}
              </div>
              {pl.description && (
                <p className="text-sm text-[var(--muted-foreground)] mt-0.5 truncate">{pl.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                  <Music2 size={11} />
                  {pl.sort_by === 'custom' ? `${countMap[pl.id] ?? 0} tracks` : 'Automática'}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {SORT_LABELS[pl.sort_by]}
                </span>
              </div>
            </div>

            <Link
              href={`/admin/playlists/${pl.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--muted)] transition-colors flex-shrink-0"
            >
              Editar
              <ArrowRight size={13} />
            </Link>
          </div>
        ))}

        {(!playlists || playlists.length === 0) && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <ListMusic size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay playlists todavía.</p>
            <Link href="/admin/playlists/nueva" className="text-purple-400 hover:underline text-sm mt-2 inline-block">
              Crear la primera
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
