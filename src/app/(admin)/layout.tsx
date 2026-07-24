import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Music2, Calendar, Lock, Radio, Users, LogOut, ChevronRight, ListMusic,
} from 'lucide-react'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/releases', label: 'Releases', icon: Music2 },
  { href: '/admin/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { href: '/admin/contenido', label: 'Contenido', icon: Lock },
  { href: '/admin/gramola', label: 'Gramola', icon: Radio },
  { href: '/admin/comunidad', label: 'Comunidad', icon: Users },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-56 border-r border-[var(--border)] bg-[var(--card)] flex flex-col z-40">
        <div className="p-4 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
              <Music2 size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm">
              Rayver<span className="text-purple-400">Music</span>
            </span>
          </Link>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 ml-8">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors group"
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold truncate">{profile?.display_name ?? user.email}</p>
            <p className="text-[10px] text-purple-400 font-medium">Admin</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-red-400 transition-colors"
            >
              <LogOut size={12} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 ml-56 mt-[72px] min-h-[calc(100vh-72px)]">
        {children}
      </main>
    </div>
  )
}
