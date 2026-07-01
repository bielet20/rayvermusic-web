import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Music2, Calendar, Users, Radio, Lock, ArrowRight, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Admin — Dashboard' }

function StatCard({
  href, icon: Icon, label, value, sub, color = 'purple',
}: {
  href: string
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color?: string
}) {
  const colors: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/10',
    green: 'text-green-400 bg-green-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    pink: 'text-pink-400 bg-pink-500/10',
  }
  return (
    <Link href={href} className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-purple-500/40 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <ArrowRight size={14} className="text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-3xl font-black tabular-nums">{value}</p>
      <p className="text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{sub}</p>}
    </Link>
  )
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalReleases },
    { count: publishedReleases },
    { count: upcomingEvents },
    { count: totalUsers },
    { count: premiumUsers },
    { count: pendingQueue },
    { count: totalContent },
    { data: recentReleases },
    { data: nextEvents },
  ] = await Promise.all([
    supabase.from('releases').select('*', { count: 'exact', head: true }),
    supabase.from('releases').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('membership', 'premium'),
    supabase.from('jukebox_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('exclusive_content').select('*', { count: 'exact', head: true }),
    supabase.from('releases').select('id, title, artist, is_published, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('events').select('id, title, city, date').gte('date', new Date().toISOString()).order('date', { ascending: true }).limit(3),
  ])

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">Panel de control de Rayver Music</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        <StatCard
          href="/admin/releases"
          icon={Music2}
          label="Releases"
          value={totalReleases ?? 0}
          sub={`${publishedReleases ?? 0} publicados`}
          color="purple"
        />
        <StatCard
          href="/admin/eventos"
          icon={Calendar}
          label="Próximos eventos"
          value={upcomingEvents ?? 0}
          color="green"
        />
        <StatCard
          href="/admin/comunidad"
          icon={Users}
          label="Usuarios"
          value={totalUsers ?? 0}
          sub={`${premiumUsers ?? 0} premium`}
          color="blue"
        />
        <StatCard
          href="/admin/gramola"
          icon={Radio}
          label="Cola gramola"
          value={pendingQueue ?? 0}
          sub="pendientes"
          color="orange"
        />
        <StatCard
          href="/admin/contenido"
          icon={Lock}
          label="Contenido"
          value={totalContent ?? 0}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent releases */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm">Últimos releases</h2>
            <Link href="/admin/releases" className="text-xs text-purple-400 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentReleases?.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Music2 size={13} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{r.artist}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.is_published ? 'bg-green-500/15 text-green-400' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                  {r.is_published ? 'Publicado' : 'Borrador'}
                </span>
              </div>
            ))}
            {(!recentReleases || recentReleases.length === 0) && (
              <p className="px-4 py-6 text-sm text-[var(--muted-foreground)] text-center">Sin releases</p>
            )}
          </div>
          <div className="p-3 border-t border-[var(--border)]">
            <Link
              href="/admin/releases/nuevo"
              className="block w-full text-center text-xs py-2 rounded-lg border border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-purple-500/50 hover:text-purple-400 transition-colors"
            >
              + Nuevo release
            </Link>
          </div>
        </div>

        {/* Next events */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-sm">Próximos eventos</h2>
            <Link href="/admin/eventos" className="text-xs text-purple-400 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {nextEvents?.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={13} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{e.city ?? '—'}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                  <Clock size={11} />
                  {formatDate(e.date)}
                </span>
              </div>
            ))}
            {(!nextEvents || nextEvents.length === 0) && (
              <p className="px-4 py-6 text-sm text-[var(--muted-foreground)] text-center">Sin próximos eventos</p>
            )}
          </div>
          <div className="p-3 border-t border-[var(--border)]">
            <Link
              href="/admin/eventos/nuevo"
              className="block w-full text-center text-xs py-2 rounded-lg border border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-green-500/50 hover:text-green-400 transition-colors"
            >
              + Nuevo evento
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
