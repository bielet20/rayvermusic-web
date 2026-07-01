import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Plus, Pencil, Star, Eye, EyeOff, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toggleEvento, deleteEvento } from './actions'

export const metadata: Metadata = { title: 'Admin — Eventos' }

export default async function EventosAdminPage() {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Eventos</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">{events?.length ?? 0} en total</p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-colors"
        >
          <Plus size={15} />
          Nuevo evento
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {events && events.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Evento</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Ciudad</th>
                <th className="text-center px-3 py-3 font-medium">Estado</th>
                <th className="text-center px-3 py-3 font-medium">Pub.</th>
                <th className="text-center px-3 py-3 font-medium">Dest.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {events.map(event => {
                const isPast = event.date < now
                return (
                  <tr key={event.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-[var(--muted)]' : 'bg-green-500/10'}`}>
                          <Calendar size={14} className={isPast ? 'text-[var(--muted-foreground)]' : 'text-green-400'} />
                        </div>
                        <p className="font-medium truncate max-w-[180px]">{event.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)] hidden md:table-cell">
                      {formatDate(event.date)}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)] hidden lg:table-cell">
                      {[event.city, event.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isPast ? 'bg-[var(--muted)] text-[var(--muted-foreground)]' : 'bg-green-500/15 text-green-400'}`}>
                        {isPast ? 'Pasado' : 'Próximo'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <form action={async () => {
                        'use server'
                        await toggleEvento(event.id, 'is_published', !event.is_published)
                      }}>
                        <button type="submit" title={event.is_published ? 'Despublicar' : 'Publicar'}
                          className={`p-1.5 rounded-lg transition-colors ${event.is_published ? 'text-green-400 hover:bg-green-500/10' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
                          {event.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <form action={async () => {
                        'use server'
                        await toggleEvento(event.id, 'is_featured', !event.is_featured)
                      }}>
                        <button type="submit" title={event.is_featured ? 'Quitar destacado' : 'Destacar'}
                          className={`p-1.5 rounded-lg transition-colors ${event.is_featured ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
                          <Star size={14} fill={event.is_featured ? 'currentColor' : 'none'} />
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/admin/eventos/${event.id}`}
                          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                          <Pencil size={13} />
                        </Link>
                        <form action={async () => {
                          'use server'
                          await deleteEvento(event.id)
                        }}>
                          <button type="submit"
                            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <Calendar size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin eventos todavía</p>
            <Link href="/admin/eventos/nuevo" className="inline-block mt-3 text-green-400 text-sm hover:underline">
              Crear el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
