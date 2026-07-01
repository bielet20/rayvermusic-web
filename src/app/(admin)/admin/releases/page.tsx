import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Music2, Plus, Pencil, Star, Eye, EyeOff, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toggleRelease, deleteRelease } from './actions'

export const metadata: Metadata = { title: 'Admin — Releases' }

const TYPE_LABELS: Record<string, string> = {
  track: 'Track', ep: 'EP', album: 'Álbum', remix: 'Remix',
}

export default async function ReleasesAdminPage() {
  const supabase = await createClient()
  const { data: releases } = await supabase
    .from('releases')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Releases</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">{releases?.length ?? 0} en total</p>
        </div>
        <Link
          href="/admin/releases/nuevo"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
        >
          <Plus size={15} />
          Nuevo release
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {releases && releases.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Título</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Fecha</th>
                <th className="text-center px-3 py-3 font-medium">Pub.</th>
                <th className="text-center px-3 py-3 font-medium">Dest.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {releases.map(release => (
                <tr key={release.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {release.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={release.cover_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <Music2 size={14} className="text-purple-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[180px]">{release.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">{release.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-xs capitalize">
                      {TYPE_LABELS[release.type] ?? release.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden lg:table-cell">
                    {release.release_date ? formatDate(release.release_date) : '—'}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <form action={async () => {
                      'use server'
                      await toggleRelease(release.id, 'is_published', !release.is_published)
                    }}>
                      <button type="submit" title={release.is_published ? 'Despublicar' : 'Publicar'}
                        className={`p-1.5 rounded-lg transition-colors ${release.is_published ? 'text-green-400 hover:bg-green-500/10' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
                        {release.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <form action={async () => {
                      'use server'
                      await toggleRelease(release.id, 'is_featured', !release.is_featured)
                    }}>
                      <button type="submit" title={release.is_featured ? 'Quitar destacado' : 'Destacar'}
                        className={`p-1.5 rounded-lg transition-colors ${release.is_featured ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
                        <Star size={14} fill={release.is_featured ? 'currentColor' : 'none'} />
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/admin/releases/${release.id}`}
                        className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                        <Pencil size={13} />
                      </Link>
                      <form action={async () => {
                        'use server'
                        await deleteRelease(release.id)
                      }}>
                        <button type="submit"
                          onClick={e => { if (!confirm('¿Eliminar este release?')) e.preventDefault() }}
                          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <Music2 size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin releases todavía</p>
            <Link href="/admin/releases/nuevo" className="inline-block mt-3 text-purple-400 text-sm hover:underline">
              Crear el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
