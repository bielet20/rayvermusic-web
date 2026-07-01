import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Lock, Plus, Pencil, Eye, EyeOff, Trash2, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toggleContenido, deleteContenido } from './actions'

export const metadata: Metadata = { title: 'Admin — Contenido' }

const TYPE_LABELS: Record<string, string> = {
  post: 'Post', track: 'Track', video: 'Vídeo', download: 'Descarga',
}
const TIER_COLORS: Record<string, string> = {
  free: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
  premium: 'bg-yellow-500/15 text-yellow-400',
}

export default async function ContenidoAdminPage() {
  const supabase = await createClient()
  const { data: content } = await supabase
    .from('exclusive_content')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Contenido exclusivo</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">{content?.length ?? 0} en total</p>
        </div>
        <Link
          href="/admin/contenido/nuevo"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 text-white text-sm font-semibold hover:bg-pink-500 transition-colors"
        >
          <Plus size={15} />
          Nuevo contenido
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {content && content.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Título</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Tier</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Fecha</th>
                <th className="text-center px-3 py-3 font-medium">Pub.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {content.map(item => (
                <tr key={item.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                        {item.tier === 'premium'
                          ? <Star size={14} className="text-yellow-400" fill="currentColor" />
                          : <Lock size={14} className="text-pink-400" />
                        }
                      </div>
                      <p className="font-medium truncate max-w-[200px]">{item.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-xs">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${TIER_COLORS[item.tier]}`}>
                      {item.tier === 'premium' ? '⭐ Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] hidden lg:table-cell">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <form action={async () => {
                      'use server'
                      await toggleContenido(item.id, !item.is_published)
                    }}>
                      <button type="submit" title={item.is_published ? 'Despublicar' : 'Publicar'}
                        className={`p-1.5 rounded-lg transition-colors ${item.is_published ? 'text-green-400 hover:bg-green-500/10' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
                        {item.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/admin/contenido/${item.id}`}
                        className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                        <Pencil size={13} />
                      </Link>
                      <form action={async () => {
                        'use server'
                        await deleteContenido(item.id)
                      }}>
                        <button type="submit"
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
            <Lock size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin contenido todavía</p>
            <Link href="/admin/contenido/nuevo" className="inline-block mt-3 text-pink-400 text-sm hover:underline">
              Crear el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
