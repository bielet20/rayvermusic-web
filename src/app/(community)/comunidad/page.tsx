import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MessageCircle, Lock, BarChart2, ArrowRight } from 'lucide-react'

export default async function ComunidadHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  const { data: recentContent } = await supabase
    .from('exclusive_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: activePolls } = await supabase
    .from('polls')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(2)

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black">
          Hola, {profile?.display_name ?? 'Fan'} 👋
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">Bienvenido a la comunidad Rayver Music</p>
      </div>

      {/* Membership banner */}
      {profile?.membership === 'free' && (
        <div className="mb-6 p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">Hazte Premium</p>
            <p className="text-xs text-[var(--muted-foreground)]">Accede a contenido exclusivo, sin restricciones</p>
          </div>
          <Link href="/premium"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors whitespace-nowrap">
            Ver plan <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { href: '/comunidad/chat', label: 'Chat', icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { href: '/comunidad/exclusivo', label: 'Exclusivo', icon: Lock, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { href: '/comunidad/votaciones', label: 'Votar', icon: BarChart2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        ].map(({ href, label, icon: Icon, color, bg }) => (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${bg} hover:opacity-80 transition-opacity`}>
            <Icon size={22} className={color} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent content */}
      {recentContent && recentContent.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Contenido reciente</h2>
            <Link href="/comunidad/exclusivo" className="text-xs text-purple-400 hover:text-purple-300">Ver todo</Link>
          </div>
          <div className="space-y-3">
            {recentContent.map(item => (
              <Link key={item.id} href={`/comunidad/exclusivo/${item.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-purple-500/30 hover:bg-[var(--muted)] transition-all">
                <div className="w-10 h-10 rounded-lg bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center">
                  <Lock size={14} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] capitalize">{item.type}</p>
                </div>
                {item.tier === 'premium' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                    Premium
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Active polls */}
      {activePolls && activePolls.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Votaciones activas</h2>
            <Link href="/comunidad/votaciones" className="text-xs text-purple-400 hover:text-purple-300">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {activePolls.map(poll => (
              <Link key={poll.id} href={`/comunidad/votaciones`}
                className="block p-4 rounded-xl border border-[var(--border)] hover:border-purple-500/30 hover:bg-[var(--muted)] transition-all">
                <p className="font-medium text-sm">{poll.question}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {(poll.options as { text: string }[]).length} opciones · Vota ahora
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
