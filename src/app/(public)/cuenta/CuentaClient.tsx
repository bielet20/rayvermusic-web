'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Crown, Check, Link2, Trash2, ExternalLink, AlertCircle, Music2, Zap,
} from 'lucide-react'
import type { PlanFeatures, Plan } from '@/lib/features'

interface Subscription {
  plan: Plan
  status: string
  stripe_subscription_id: string | null
  cancel_at_period_end: boolean
  current_period_end: string | null
}

interface Connection {
  platform: string
  platform_display_name: string | null
  platform_avatar_url: string | null
  connected_at: string
}

interface Props {
  user: { id: string; email: string; displayName: string | null; username: string | null; avatarUrl: string | null }
  plan: Plan
  planName: string
  planPrice: number
  features: PlanFeatures
  subscription: Subscription | null
  connections: Connection[]
}

const PLATFORM_LABELS: Record<string, string> = {
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
  apple_music: 'Apple Music',
}

const PLATFORM_ICONS: Record<string, string> = {
  spotify: '🎵', soundcloud: '🔊', youtube: '▶', apple_music: '🎧',
}

export default function CuentaClient({ user, plan, planName, planPrice, features, subscription, connections }: Props) {
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [localConnections, setLocalConnections] = useState(connections)
  const [canceling, setCanceling] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  async function handleDisconnect(platform: string) {
    setDisconnecting(platform)
    try {
      const res = await fetch(`/api/connections?platform=${platform}`, { method: 'DELETE' })
      if (res.ok) setLocalConnections(prev => prev.filter(c => c.platform !== platform))
    } finally {
      setDisconnecting(null)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setPortalLoading(false)
    }
  }

  const isPaid = plan !== 'free'
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const willCancel = subscription?.cancel_at_period_end

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Mi cuenta</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Gestiona tu plan, conexiones y preferencias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">

          {/* Plan actual */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Plan actual</h2>
              {isPaid ? (
                <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Crown size={10} /> {planName}
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 border border-gray-500/30 text-gray-400">
                  {planName}
                </span>
              )}
            </div>

            {isPaid && isActive ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Precio</span>
                  <span className="font-medium">{planPrice.toFixed(2).replace('.', ',')}€/mes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Estado</span>
                  <span className={`flex items-center gap-1.5 font-medium ${willCancel ? 'text-yellow-400' : 'text-green-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${willCancel ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    {willCancel ? 'Cancela al final del periodo' : 'Activo'}
                  </span>
                </div>
                {subscription?.current_period_end && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      {willCancel ? 'Acceso hasta' : 'Próxima factura'}
                    </span>
                    <span>{new Date(subscription.current_period_end).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[var(--border)] flex gap-2">
                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
                  >
                    <ExternalLink size={13} />
                    {portalLoading ? 'Redirigiendo...' : 'Gestionar suscripción'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Con el plan Free tienes acceso al catálogo RAYVER. Conecta tus plataformas favoritas con Pro.
                </p>
                <Link
                  href="/upgrade"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
                >
                  <Zap size={14} />
                  Ver planes — desde 4,99€/mes
                </Link>
              </div>
            )}
          </div>

          {/* Funcionalidades del plan */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="font-semibold text-sm mb-4">Tu plan incluye</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {([
                ['spotifyConnect', 'Conectar Spotify'],
                ['soundcloudConnect', 'Conectar SoundCloud'],
                ['youtubeConnect', 'Conectar YouTube'],
                ['appleMusicConnect', 'Conectar Apple Music'],
                ['userPlaylists', 'Playlists personalizadas'],
                ['crossfade', 'Crossfade automático'],
                ['highQualityStream', 'Alta calidad'],
                ['downloadMix', 'Exportar mezclas'],
                ['analyticsAccess', 'Analytics'],
                ['customBranding', 'Branding propio'],
              ] as Array<[keyof PlanFeatures, string]>).map(([key, label]) => (
                <div key={key} className={`flex items-center gap-2 text-xs ${features[key] ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] opacity-40'}`}>
                  <Check size={12} className={features[key] ? 'text-purple-400' : 'opacity-30'} />
                  {label}
                </div>
              ))}
            </div>
            {!isPaid && (
              <Link href="/upgrade" className="mt-4 text-xs text-purple-400 hover:underline flex items-center gap-1">
                <Crown size={11} /> Desbloquear todo con Pro →
              </Link>
            )}
          </div>

          {/* Plataformas conectadas */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Link2 size={14} className="text-purple-400" />
              <h2 className="font-semibold text-sm">Plataformas conectadas</h2>
            </div>

            {localConnections.length === 0 ? (
              <div className="text-center py-6 text-[var(--muted-foreground)]">
                <Music2 size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs mb-3">No tienes plataformas conectadas</p>
                {features.spotifyConnect ? (
                  <a href="/api/auth/spotify" className="text-xs text-purple-400 hover:underline">
                    Conectar Spotify →
                  </a>
                ) : (
                  <Link href="/upgrade" className="text-xs text-purple-400 hover:underline">
                    Upgrade a Pro para conectar →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {localConnections.map(conn => (
                  <div key={conn.platform} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)]">
                    <span className="text-lg">{PLATFORM_ICONS[conn.platform]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{PLATFORM_LABELS[conn.platform]}</p>
                      {conn.platform_display_name && (
                        <p className="text-xs text-[var(--muted-foreground)] truncate">{conn.platform_display_name}</p>
                      )}
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Conectado el {new Date(conn.connected_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDisconnect(conn.platform)}
                      disabled={disconnecting === conn.platform}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted-foreground)] hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Desconectar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {features.spotifyConnect && !localConnections.some(c => c.platform === 'spotify') && (
                  <a href="/api/auth/spotify" className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-green-500/30 transition-colors">
                    🎵 Conectar Spotify
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: User info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-3 mb-4">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="" width={48} height={48} className="w-12 h-12 rounded-full object-cover" unoptimized />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400 font-bold">
                  {(user.displayName ?? user.email)[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium truncate">{user.displayName ?? 'Sin nombre'}</p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
              </div>
            </div>
            {user.username && (
              <p className="text-xs text-[var(--muted-foreground)]">@{user.username}</p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
            <Link href="/player" className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-2 rounded-lg hover:bg-white/5">
              <Music2 size={14} />
              Ir al Player
            </Link>
            <Link href="/upgrade" className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-2 rounded-lg hover:bg-white/5">
              <Crown size={14} />
              Ver planes
            </Link>
          </div>

          {isPaid && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--muted-foreground)]">
                  Para cancelar tu suscripción o cambiar de plan, usa el botón{' '}
                  <button onClick={handlePortal} className="text-purple-400 underline">Gestionar suscripción</button>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
