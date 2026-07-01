import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { Users, Crown, Shield, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { setUserRole, setMembership } from './actions'

export const metadata: Metadata = { title: 'Admin — Comunidad' }

const ROLE_CONFIG = {
  fan: { label: 'Fan', color: 'text-[var(--muted-foreground)] bg-[var(--muted)]', icon: Users },
  artist: { label: 'Artista', color: 'text-purple-400 bg-purple-500/15', icon: Crown },
  admin: { label: 'Admin', color: 'text-red-400 bg-red-500/15', icon: Shield },
}
const MEMBERSHIP_CONFIG = {
  free: { label: 'Free', color: 'text-[var(--muted-foreground)] bg-[var(--muted)]' },
  premium: { label: 'Premium', color: 'text-yellow-400 bg-yellow-500/15' },
}

export default async function ComunidadAdminPage() {
  const supabase = await createAdminClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const total = profiles?.length ?? 0
  const premium = profiles?.filter(p => p.membership === 'premium').length ?? 0
  const admins = profiles?.filter(p => p.role === 'admin').length ?? 0

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Comunidad</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">{total} usuarios registrados</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <p className="text-2xl font-black">{total}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Total usuarios</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <p className="text-2xl font-black text-yellow-400">{premium}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Premium</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <p className="text-2xl font-black text-red-400">{admins}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Admins</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        {profiles && profiles.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Registro</th>
                <th className="text-center px-4 py-3 font-medium">Rol</th>
                <th className="text-center px-4 py-3 font-medium">Membresía</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {profiles.map(profile => {
                const roleCfg = ROLE_CONFIG[profile.role]
                const memberCfg = MEMBERSHIP_CONFIG[profile.membership]
                const RoleIcon = roleCfg.icon

                return (
                  <tr key={profile.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-400">
                          {profile.display_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{profile.display_name ?? 'Sin nombre'}</p>
                          {profile.username && (
                            <p className="text-xs text-[var(--muted-foreground)] truncate">@{profile.username}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)] hidden md:table-cell">
                      {formatDate(profile.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {(['fan', 'artist', 'admin'] as const).filter(r => r !== profile.role).map(r => (
                          <form key={r} action={async () => {
                            'use server'
                            await setUserRole(profile.id, r)
                          }}>
                            <button type="submit"
                              className="text-[10px] px-2 py-0.5 rounded border border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-purple-500/40 hover:text-purple-400 transition-colors capitalize">
                              → {r}
                            </button>
                          </form>
                        ))}
                      </div>
                      <div className={`flex items-center justify-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${roleCfg.color}`}>
                        <RoleIcon size={10} />
                        {roleCfg.label}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {profile.membership === 'free' ? (
                          <form action={async () => {
                            'use server'
                            await setMembership(profile.id, 'premium')
                          }}>
                            <button type="submit"
                              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-dashed border-yellow-500/30 text-[var(--muted-foreground)] hover:text-yellow-400 hover:border-yellow-500/60 transition-colors">
                              <Star size={10} />
                              → Premium
                            </button>
                          </form>
                        ) : (
                          <form action={async () => {
                            'use server'
                            await setMembership(profile.id, 'free')
                          }}>
                            <button type="submit"
                              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium ${memberCfg.color} hover:opacity-70 transition-opacity`}>
                              <Star size={10} fill="currentColor" />
                              Premium
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <Users size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Sin usuarios todavía</p>
          </div>
        )}
      </div>
    </div>
  )
}
