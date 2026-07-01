'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, ArrowUp, ArrowDown, Search, Music2, Star, CheckCircle, Save } from 'lucide-react'
import type { Database } from '@/types/database'

type Playlist = Database['public']['Tables']['playlists']['Row']
type Release = Database['public']['Tables']['releases']['Row']
type TrackRow = Release & { ptid: string; position: number }

const SORT_OPTIONS = [
  { value: 'custom', label: 'Orden manual' },
  { value: 'newest', label: 'Más recientes automático' },
  { value: 'featured', label: 'Destacados automático' },
  { value: 'plays', label: 'Más escuchados automático' },
]

export default function PlaylistEditor({
  playlist,
  tracks: initialTracks,
  allReleases,
}: {
  playlist: Playlist
  tracks: TrackRow[]
  allReleases: Release[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tracks, setTracks] = useState<TrackRow[]>(initialTracks)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pl, setPl] = useState({ name: playlist.name, description: playlist.description ?? '', sort_by: playlist.sort_by, is_default: playlist.is_default, is_active: playlist.is_active })

  const trackIds = new Set(tracks.map(t => t.id))
  const available = allReleases.filter(r =>
    !trackIds.has(r.id) &&
    (search === '' || r.title.toLowerCase().includes(search.toLowerCase()) || r.artist.toLowerCase().includes(search.toLowerCase()))
  )

  async function save() {
    setSaving(true)
    await fetch(`/api/admin/playlists/${playlist.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pl, tracks: tracks.map((t, i) => ({ release_id: t.id, position: i })) }),
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2500)
    startTransition(() => router.refresh())
  }

  async function addTrack(release: Release) {
    setTracks(prev => [...prev, { ...release, ptid: '', position: prev.length }])
  }

  function removeTrack(idx: number) {
    setTracks(prev => prev.filter((_, i) => i !== idx))
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    setTracks(prev => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  function moveDown(idx: number) {
    setTracks(prev => {
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }

  const isManual = pl.sort_by === 'custom'

  return (
    <div className="space-y-6">
      {/* Playlist meta */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Configuración</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Nombre</label>
            <input value={pl.name} onChange={e => setPl(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Tipo de orden</label>
            <select value={pl.sort_by} onChange={e => setPl(p => ({ ...p, sort_by: e.target.value as Playlist['sort_by'] }))}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Descripción</label>
          <input value={pl.description} onChange={e => setPl(p => ({ ...p, description: e.target.value }))}
            placeholder="Descripción breve..."
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500" />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pl.is_default} onChange={e => setPl(p => ({ ...p, is_default: e.target.checked }))}
              className="w-4 h-4 accent-purple-500" />
            <span className="text-sm flex items-center gap-1"><Star size={13} className="text-purple-400" />Por defecto (carga al visitar la web)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pl.is_active} onChange={e => setPl(p => ({ ...p, is_active: e.target.checked }))}
              className="w-4 h-4 accent-purple-500" />
            <span className="text-sm">Activa</span>
          </label>
        </div>
      </div>

      {/* Track list (manual only) */}
      {isManual && (
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
            Tracks en la playlist ({tracks.length})
          </h2>
          {tracks.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
              Sin tracks. Añade releases desde abajo.
            </p>
          )}
          <div className="space-y-2">
            {tracks.map((t, i) => (
              <div key={`${t.id}-${i}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                <span className="text-xs text-[var(--muted-foreground)] w-4 text-center">{i + 1}</span>
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-[var(--muted)] flex-shrink-0">
                  {t.cover_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={t.cover_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Music2 size={12} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{t.artist}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveUp(i)} className="p-1.5 hover:text-purple-400 transition-colors" disabled={i === 0}><ArrowUp size={13} /></button>
                  <button onClick={() => moveDown(i)} className="p-1.5 hover:text-purple-400 transition-colors" disabled={i === tracks.length - 1}><ArrowDown size={13} /></button>
                  <button onClick={() => removeTrack(i)} className="p-1.5 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Add tracks */}
          <div className="mt-5 pt-5 border-t border-[var(--border)]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Añadir releases</h3>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar release..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {available.slice(0, 20).map(r => (
                <button key={r.id} onClick={() => addTrack(r)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-[var(--muted)] flex-shrink-0">
                    {r.cover_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={r.cover_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Music2 size={10} /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">{r.artist}</p>
                  </div>
                  <Plus size={14} className="text-purple-400 flex-shrink-0" />
                </button>
              ))}
              {available.length === 0 && <p className="text-sm text-[var(--muted-foreground)] text-center py-3">No hay más releases disponibles</p>}
            </div>
          </div>
        </div>
      )}

      {!isManual && (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30">
          <p className="text-sm text-[var(--muted-foreground)]">
            <strong className="text-[var(--foreground)]">Playlist automática</strong> — los tracks se seleccionan dinámicamente desde los releases publicados según el criterio elegido. Cambia a &quot;Orden manual&quot; para elegirlos tú.
          </p>
        </div>
      )}

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors disabled:opacity-60"
      >
        {saved ? <><CheckCircle size={16} />Guardado</> : saving ? 'Guardando...' : <><Save size={16} />Guardar cambios</>}
      </button>
    </div>
  )
}
