import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Lock, BarChart2, Music2, Home, LogOut } from 'lucide-react'

const communityLinks = [
  { href: '/comunidad', label: 'Inicio', icon: Home },
  { href: '/comunidad/chat', label: 'Chat', icon: MessageCircle },
  { href: '/comunidad/exclusivo', label: 'Exclusivo', icon: Lock },
  { href: '/comunidad/votaciones', label: 'Votaciones', icon: BarChart2 },
  { href: '/gramola', label: 'Gramola', icon: Music2 },
]

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/comunidad')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 border-r border-[var(--border)] bg-[var(--card)] flex flex-col z-40">
        <div className="p-5 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
              <Music2 size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm">Rayver<span className="text-purple-400">Music</span></span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {communityLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400">
              {profile?.display_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{profile?.display_name ?? 'Fan'}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{profile?.membership === 'premium' ? '⭐ Premium' : 'Gratis'}</p>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit"
              className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-red-400 transition-colors">
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
