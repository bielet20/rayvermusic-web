import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Music2, ExternalLink, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/types/database'

export const metadata: Metadata = { title: 'Música' }

type Release = Database['public']['Tables']['releases']['Row']

const PLATFORM_LINKS: Record<string, { label: string; color: string }> = {
  spotify_url: { label: 'Spotify', color: 'text-green-400' },
  apple_url: { label: 'Apple Music', color: 'text-red-400' },
  youtube_url: { label: 'YouTube', color: 'text-red-500' },
  soundcloud_url: { label: 'SoundCloud', color: 'text-orange-400' },
  beatport_url: { label: 'Beatport', color: 'text-teal-400' },
}

function ReleaseCard({ release }: { release: Release }) {
  const links = Object.entries(PLATFORM_LINKS)
    .filter(([key]) => release[key as keyof Release])
    .map(([key, meta]) => ({ url: release[key as keyof Release] as string, ...meta }))

  return (
    <div className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-purple-500/40 transition-all">
      <div className="aspect-square bg-[var(--muted)] relative overflow-hidden">
        {release.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={release.cover_url} alt={release.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 size={48} className="text-[var(--border)]" />
          </div>
        )}
        {release.is_featured && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-600 text-white">
            Destacado
          </span>
        )}
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium bg-black/60 text-white capitalize">
          {release.type}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-base leading-tight">{release.title}</h3>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{release.artist}</p>
        {release.release_date && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mt-1">
            <Calendar size={12} />
            {formatDate(release.release_date)}
          </div>
        )}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {links.map(({ url, label, color }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 text-xs font-medium ${color} hover:underline`}
              >
                <ExternalLink size={10} />
                {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default async function MusicaPage() {
  const supabase = await createClient()
  const { data: releases } = await supabase
    .from('releases')
    .select('*')
    .eq('is_published', true)
    .order('release_date', { ascending: false })

  const featured = releases?.filter(r => r.is_featured) ?? []
  const rest = releases?.filter(r => !r.is_featured) ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2">Música</h1>
        <p className="text-[var(--muted-foreground)]">Tracks, EPs y álbumes. Escucha en tu plataforma favorita.</p>
      </div>

      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Destacados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(r => <ReleaseCard key={r.id} release={r} />)}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Todos los releases</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {rest.map(r => <ReleaseCard key={r.id} release={r} />)}
          </div>
        </section>
      )}

      {(!releases || releases.length === 0) && (
        <div className="text-center py-24 text-[var(--muted-foreground)]">
          <Music2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>Próximamente...</p>
        </div>
      )}
    </div>
  )
}
