import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Music2, ExternalLink, Calendar, Disc3, Download, Play, Clock, Headphones } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/types/database'
import MusicFilters from '@/components/public/MusicFilters'

export const metadata: Metadata = { title: 'Música · Rayver' }

type Release = Database['public']['Tables']['releases']['Row']

const PLATFORM_LINKS: Record<string, { label: string; color: string; bg: string }> = {
  spotify_url:    { label: 'Spotify',      color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  apple_url:      { label: 'Apple Music',  color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  youtube_url:    { label: 'YouTube',      color: 'text-red-500',    bg: 'bg-red-600/10 border-red-600/20' },
  soundcloud_url: { label: 'SoundCloud',   color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  beatport_url:   { label: 'Beatport',     color: 'text-teal-400',   bg: 'bg-teal-500/10 border-teal-500/20' },
}

const TYPE_LABELS: Record<string, string> = {
  track: 'Track', ep: 'EP', album: 'Álbum', remix: 'Remix',
}

function ReleaseCard({ release }: { release: Release }) {
  const links = Object.entries(PLATFORM_LINKS)
    .filter(([key]) => release[key as keyof Release])
    .map(([key, meta]) => ({ url: release[key as keyof Release] as string, ...meta }))

  return (
    <article className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-900/10 transition-all duration-300">
      <div className="aspect-square bg-[var(--muted)] relative overflow-hidden">
        {release.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={release.cover_url}
            alt={release.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 size={48} className="text-[var(--border)] group-hover:text-purple-500/50 transition-colors" />
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-2.5 gap-1">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-sm">
            {TYPE_LABELS[release.type] ?? release.type}
          </span>
          {release.is_featured && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-600/90 text-white backdrop-blur-sm">
              ★ Destacado
            </span>
          )}
        </div>
        {release.preview_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
              <Play size={20} className="text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base leading-tight line-clamp-1">{release.title}</h3>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5 line-clamp-1">{release.artist}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {release.release_date && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <Calendar size={10} />
              {formatDate(release.release_date)}
            </span>
          )}
          {release.bpm && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <Clock size={10} />
              {release.bpm} BPM
            </span>
          )}
          {release.plays_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <Headphones size={10} />
              {release.plays_count.toLocaleString()}
            </span>
          )}
        </div>

        {(release.genre || release.key_musical) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {release.genre && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/15 text-purple-300 border border-purple-500/20">
                {release.genre}
              </span>
            )}
            {release.key_musical && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                {release.key_musical}
              </span>
            )}
          </div>
        )}

        {release.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {release.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs text-[var(--muted-foreground)]">#{tag}</span>
            ))}
          </div>
        )}

        {links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--border)]">
            {links.map(({ url, label, color, bg }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${color} ${bg} hover:opacity-80 transition-opacity`}
              >
                <ExternalLink size={9} />
                {label}
              </a>
            ))}
            {release.download_url && (
              <a
                href={release.download_url}
                download
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-blue-500/20 bg-blue-500/10 text-blue-300 hover:opacity-80 transition-opacity"
              >
                <Download size={9} />
                Free DL
              </a>
            )}
          </div>
        )}

        {release.label && (
          <p className="text-xs text-[var(--muted-foreground)] mt-2 truncate">{release.label}</p>
        )}
      </div>
    </article>
  )
}

async function ReleaseGrid({
  searchParams,
}: {
  searchParams: { q?: string; genre?: string; type?: string }
}) {
  const supabase = await createClient()
  const { q, genre, type } = searchParams

  let query = supabase
    .from('releases')
    .select('*')
    .eq('is_published', true)

  if (type) query = query.eq('type', type as 'track' | 'ep' | 'album' | 'remix')
  if (genre) query = query.eq('genre', genre)
  if (q) query = query.or(`title.ilike.%${q}%,artist.ilike.%${q}%,genre.ilike.%${q}%`)

  query = query.order('is_featured', { ascending: false }).order('release_date', { ascending: false })

  const { data: releases } = await query

  const all = releases ?? []
  const featured = all.filter(r => r.is_featured)
  const rest = all.filter(r => !r.is_featured)
  const isFiltered = Boolean(q || genre || type)

  return (
    <>
      <MusicFilters totalCount={all.length} />

      {all.length === 0 && (
        <div className="text-center py-24 text-[var(--muted-foreground)]">
          <Music2 size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">Sin resultados</p>
          <p className="text-sm">Prueba con otros filtros o términos de búsqueda.</p>
        </div>
      )}

      {featured.length > 0 && !isFiltered && (
        <section className="mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-5">✦ Destacados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(r => <ReleaseCard key={r.id} release={r} />)}
          </div>
        </section>
      )}

      {(isFiltered ? all : rest).length > 0 && (
        <section>
          {featured.length > 0 && !isFiltered && (
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-5">
              Todos los releases
            </h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(isFiltered ? all : rest).map(r => <ReleaseCard key={r.id} release={r} />)}
          </div>
        </section>
      )}
    </>
  )
}

export default async function MusicaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; type?: string }>
}) {
  const sp = await searchParams

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-4">
          <Music2 size={12} />
          Discografía completa
        </div>
        <h1 className="text-4xl sm:text-5xl font-black mb-3">Música</h1>
        <p className="text-[var(--muted-foreground)] max-w-xl">
          Tracks, EPs, álbumes y remixes. Filtra por género, tipo o busca directamente lo que quieras escuchar.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden animate-pulse">
                <div className="aspect-square bg-[var(--muted)]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[var(--muted)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--muted)] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <ReleaseGrid searchParams={sp} />
      </Suspense>
    </div>
  )
}
