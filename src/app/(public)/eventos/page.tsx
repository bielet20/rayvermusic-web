import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Calendar, MapPin, ExternalLink, Ticket } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Eventos' }

export default async function EventosPage() {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data: upcoming } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('date', now)
    .order('date', { ascending: true })

  const { data: past } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .lt('date', now)
    .order('date', { ascending: false })
    .limit(6)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2">Eventos</h1>
        <p className="text-[var(--muted-foreground)]">Próximas fechas y gigs en directo.</p>
      </div>

      {/* Upcoming */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-6">Próximos</h2>
        {upcoming && upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map(event => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-purple-500/40 transition-all"
              >
                {event.is_featured && (
                  <span className="self-start sm:self-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-600 text-white whitespace-nowrap">
                    Destacado
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-[var(--muted-foreground)]">
                    {event.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />{event.venue}
                      </span>
                    )}
                    {event.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />{event.city}{event.country ? `, ${event.country}` : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />{formatDate(event.date)}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1.5 line-clamp-2">{event.description}</p>
                  )}
                </div>
                {event.ticket_url && (
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors whitespace-nowrap"
                  >
                    <Ticket size={14} />
                    Entradas
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-2xl">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay eventos próximos anunciados</p>
            <p className="text-sm mt-1">Sigue las redes para no perderte nada</p>
          </div>
        )}
      </section>

      {/* Past events */}
      {past && past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-6">Anteriores</h2>
          <div className="space-y-2 opacity-60">
            {past.map(event => (
              <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)]">
                <div className="flex-1">
                  <span className="font-medium">{event.title}</span>
                  {event.city && <span className="text-sm text-[var(--muted-foreground)] ml-2">· {event.city}</span>}
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">{formatDate(event.date)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
