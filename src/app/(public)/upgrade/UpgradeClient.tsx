'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Crown, Zap, Music2, Users, Code } from 'lucide-react'
import type { Plan, PlanFeatures } from '@/lib/features'

interface Props {
  currentPlan: Plan
  isLoggedIn: boolean
  plans: Plan[]
  planNames: Record<Plan, string>
  planPrices: Record<Plan, number>
  planDescriptions: Record<Plan, string>
  planFeatures: Record<Plan, PlanFeatures>
}

const PLAN_ICONS: Record<Plan, React.ReactNode> = {
  free: <Music2 size={20} />,
  pro: <Zap size={20} />,
  artist: <Crown size={20} />,
  label: <Users size={20} />,
}

const PLAN_COLORS: Record<Plan, string> = {
  free: 'border-[var(--border)]',
  pro: 'border-purple-500/50',
  artist: 'border-purple-400/70',
  label: 'border-yellow-500/50',
}

const PLAN_HIGHLIGHT: Record<Plan, boolean> = {
  free: false,
  pro: true,
  artist: false,
  label: false,
}

const FEATURE_ROWS: Array<{ key: keyof PlanFeatures; label: string }> = [
  { key: 'spotifyConnect', label: 'Conectar Spotify' },
  { key: 'soundcloudConnect', label: 'Conectar SoundCloud' },
  { key: 'youtubeConnect', label: 'Conectar YouTube' },
  { key: 'appleMusicConnect', label: 'Conectar Apple Music' },
  { key: 'userPlaylists', label: 'Playlists personalizadas' },
  { key: 'crossfade', label: 'Crossfade automático' },
  { key: 'highQualityStream', label: 'Streaming alta calidad' },
  { key: 'downloadMix', label: 'Exportar mezclas' },
  { key: 'analyticsAccess', label: 'Analytics de escuchas' },
  { key: 'customBranding', label: 'Branding personalizado' },
  { key: 'apiAccess', label: 'Acceso API' },
]

export default function UpgradeClient({
  currentPlan, isLoggedIn, plans, planNames, planPrices, planDescriptions, planFeatures,
}: Props) {
  const [loading, setLoading] = useState<Plan | null>(null)

  async function handleUpgrade(plan: Plan) {
    if (plan === 'free' || plan === currentPlan) return
    if (!isLoggedIn) {
      window.location.href = '/login?redirect=/upgrade'
      return
    }
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // silencioso
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen px-4 py-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-4">
          <Zap size={12} />
          Planes y precios
        </span>
        <h1 className="text-4xl sm:text-5xl font-black mb-3">
          Tu música, <span className="text-purple-400">tu control</span>
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
          Conecta tus plataformas favoritas y gestiona toda tu música desde un único reproductor.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {plans.map(plan => {
          const isCurrent = plan === currentPlan
          const highlight = PLAN_HIGHLIGHT[plan]
          const price = planPrices[plan]

          return (
            <div
              key={plan}
              className={`relative rounded-2xl border p-5 flex flex-col gap-4 ${PLAN_COLORS[plan]} ${
                highlight ? 'bg-purple-600/5 shadow-lg shadow-purple-500/10' : 'bg-[var(--card)]'
              }`}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
                    Más popular
                  </span>
                </div>
              )}

              <div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                  plan === 'free' ? 'bg-gray-500/10 text-gray-400'
                  : plan === 'pro' ? 'bg-purple-600/20 text-purple-400'
                  : plan === 'artist' ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {PLAN_ICONS[plan]}
                </div>
                <h2 className="text-lg font-bold">{planNames[plan]}</h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{planDescriptions[plan]}</p>
              </div>

              <div>
                {price === 0 ? (
                  <p className="text-3xl font-black">Gratis</p>
                ) : (
                  <p className="text-3xl font-black">
                    {price.toFixed(2).replace('.', ',')}€
                    <span className="text-sm font-normal text-[var(--muted-foreground)]">/mes</span>
                  </p>
                )}
              </div>

              <ul className="space-y-2 flex-1">
                {FEATURE_ROWS.filter(f => planFeatures[plan][f.key]).map(f => (
                  <li key={f.key} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
                    <Check size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    {f.label}
                  </li>
                ))}
                {plan === 'label' && (
                  <li className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
                    <Code size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    Hasta 10 miembros del equipo
                  </li>
                )}
              </ul>

              {isCurrent ? (
                <div className="w-full text-center py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                  Plan actual
                </div>
              ) : plan === 'free' ? (
                <Link
                  href="/player"
                  className="block w-full text-center py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Continuar gratis
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading === plan}
                  className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                    highlight
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-[var(--card)] hover:bg-white/10 border border-[var(--border)] text-[var(--foreground)]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan ? 'Redirigiendo...' : `Elegir ${planNames[plan]}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Feature comparison table */}
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 font-semibold text-[var(--muted-foreground)] w-48">Característica</th>
                {plans.map(plan => (
                  <th key={plan} className="px-4 py-3 text-center font-semibold">
                    <span className={plan === currentPlan ? 'text-purple-400' : ''}>{planNames[plan]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {FEATURE_ROWS.map(({ key, label }) => (
                <tr key={key} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">{label}</td>
                  {plans.map(plan => (
                    <td key={plan} className="px-4 py-3 text-center">
                      {planFeatures[plan][key] ? (
                        <Check size={16} className="text-purple-400 mx-auto" />
                      ) : (
                        <span className="text-[var(--border)] text-base">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">Playlists máx.</td>
                {plans.map(plan => (
                  <td key={plan} className="px-4 py-3 text-center text-xs text-[var(--muted-foreground)]">
                    {planFeatures[plan].maxUserPlaylists === -1
                      ? '∞'
                      : planFeatures[plan].maxUserPlaylists || '—'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">Miembros del equipo</td>
                {plans.map(plan => (
                  <td key={plan} className="px-4 py-3 text-center text-xs text-[var(--muted-foreground)]">
                    {planFeatures[plan].teamMembers}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
        Precios sin IVA · Cancela cuando quieras · Soporte por email incluido
      </p>
    </div>
  )
}
