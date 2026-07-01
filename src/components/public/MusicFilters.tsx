'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export const GENRES = [
  'Techno', 'Trance', 'Progressive', 'Melodic Techno',
  'Deep Tech', 'Hard Techno', 'Psy Trance', 'Electronic',
]

export const TYPES = [
  { value: 'track', label: 'Track' },
  { value: 'ep', label: 'EP' },
  { value: 'album', label: 'Álbum' },
  { value: 'remix', label: 'Remix' },
]

export default function MusicFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const q = params.get('q') ?? ''
  const genre = params.get('genre') ?? ''
  const type = params.get('type') ?? ''

  const hasFilters = q || genre || type

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }))
    },
    [params, pathname, router]
  )

  const clearAll = () => {
    startTransition(() => router.replace(pathname, { scroll: false }))
  }

  return (
    <div className="space-y-4 mb-10">
      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
        <input
          type="search"
          placeholder="Buscar por título, artista, género..."
          defaultValue={q}
          onChange={e => update('q', e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-purple-500/60 transition-colors"
        />
        {isPending && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
          <SlidersHorizontal size={13} />
          Filtrar:
        </div>

        {/* Genre filter */}
        <select
          value={genre}
          onChange={e => update('genre', e.target.value)}
          className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-medium focus:outline-none focus:border-purple-500/60 cursor-pointer appearance-none"
        >
          <option value="">Todos los géneros</option>
          {GENRES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={type}
          onChange={e => update('type', e.target.value)}
          className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-medium focus:outline-none focus:border-purple-500/60 cursor-pointer appearance-none"
        >
          <option value="">Todos los tipos</option>
          {TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-xs font-medium hover:bg-purple-500/20 transition-colors"
          >
            <X size={11} />
            Limpiar filtros
          </button>
        )}

        <span className="ml-auto text-xs text-[var(--muted-foreground)]">
          {totalCount} {totalCount === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5">
          {q && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--muted)] text-xs">
              &quot;{q}&quot;
              <button onClick={() => update('q', '')} className="hover:text-red-400"><X size={10} /></button>
            </span>
          )}
          {genre && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--muted)] text-xs">
              {genre}
              <button onClick={() => update('genre', '')} className="hover:text-red-400"><X size={10} /></button>
            </span>
          )}
          {type && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--muted)] text-xs capitalize">
              {type}
              <button onClick={() => update('type', '')} className="hover:text-red-400"><X size={10} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
