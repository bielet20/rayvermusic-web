'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Music2, Check, ExternalLink, Zap, Loader2 } from 'lucide-react'
import { BEATS, LICENSES, type Genre, type LicenseType } from '@/lib/beats-catalog'

const GENRE_LABELS: Record<Genre | 'all', string> = {
  all: 'Todos',
  trance: 'Trance',
  electronica: 'Electrónica',
  orquestal: 'Orquestal',
  pop: 'Pop / Balada',
}

const GENRE_COLORS: Record<Genre, string> = {
  trance:     'from-violet-900/60 to-indigo-950/80',
  electronica:'from-blue-950/60 to-slate-950/80',
  orquestal:  'from-stone-900/60 to-zinc-950/80',
  pop:        'from-fuchsia-950/60 to-violet-950/80',
}

export default function BeatsPage() {
  const [filter, setFilter] = useState<Genre | 'all'>('all')
  const [loading, setLoading] = useState<string | null>(null) // beatId:licenseType

  const visible = filter === 'all' ? BEATS : BEATS.filter(b => b.genre === filter)

  async function handleBuy(beatId: string, licenseType: LicenseType) {
    const key = `${beatId}:${licenseType}`
    setLoading(key)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beatId, licenseType }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Error al procesar el pago. Inténtalo de nuevo.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header */}
      <div className="mb-12 max-w-2xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Pago seguro con Stripe · Entrega en &lt; 24 h
        </span>
        <h1 className="text-4xl sm:text-5xl font-black mb-3">
          Beats <span className="text-[var(--primary)]">&amp; Licencias</span>
        </h1>
        <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
          Producciones originales. Elige beat, elige licencia y paga con tarjeta.
          Recibes el archivo en tu email en menos de 24&nbsp;h.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(Object.keys(GENRE_LABELS) as (Genre | 'all')[]).map(g => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === g
                ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-purple-500/40'
            }`}
          >
            {GENRE_LABELS[g]}
          </button>
        ))}
      </div>

      {/* Beats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-20">
        {visible.map(beat => (
          <div
            key={beat.id}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-purple-500/40 transition-all"
          >
            <div className={`aspect-square bg-gradient-to-br ${GENRE_COLORS[beat.genre]} relative flex items-center justify-center`}>
              <Music2 size={40} className="text-white/20 group-hover:text-white/30 transition-colors" />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white capitalize">
                {GENRE_LABELS[beat.genre]}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-sm leading-tight mb-1">{beat.title}</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">
                {beat.bpm} BPM · Key {beat.key}
              </p>

              <div className="space-y-2">
                {LICENSES.map(lic => {
                  const key = `${beat.id}:${lic.type}`
                  const isLoading = loading === key
                  return (
                    <button
                      key={lic.type}
                      onClick={() => handleBuy(beat.id, lic.type)}
                      disabled={!!loading}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all disabled:opacity-50 ${
                        lic.type === 'premium'
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white hover:opacity-90'
                          : 'border-[var(--border)] hover:border-purple-500/40 hover:text-[var(--primary)]'
                      }`}
                    >
                      <span>{lic.name}</span>
                      {isLoading
                        ? <Loader2 size={12} className="animate-spin" />
                        : <span className="font-bold">{lic.type === 'exclusiva' ? 'Consultar' : `${lic.priceEur}€`}</span>
                      }
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* License detail */}
      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-black mb-2">¿Qué incluye cada licencia?</h2>
        <p className="text-[var(--muted-foreground)] mb-8 text-sm">Pago único · Sin suscripciones · Tuyo para siempre</p>

        <div className="grid md:grid-cols-3 gap-4">
          {LICENSES.map(lic => (
            <div
              key={lic.type}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                lic.type === 'premium'
                  ? 'border-[var(--primary)] bg-purple-950/20'
                  : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              {lic.type === 'premium' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold bg-[var(--primary)] text-white whitespace-nowrap">
                  MÁS POPULAR
                </span>
              )}
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-1">{lic.name}</div>
              <div className="text-4xl font-black mb-1">
                {lic.type === 'exclusiva' ? 'Consultar' : `${lic.priceEur}€`}
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-5 leading-relaxed">{lic.description}</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {lic.includes.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                    {f}
                  </li>
                ))}
              </ul>
              {lic.type === 'exclusiva' ? (
                <Link
                  href="/contacto?motivo=beats"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold border border-[var(--border)] hover:border-purple-500/40 hover:text-[var(--primary)] transition-colors"
                >
                  <Zap size={13} />
                  Consultar precio
                </Link>
              ) : (
                <button
                  onClick={() => handleBuy(visible[0]?.id ?? BEATS[0].id, lic.type)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-opacity ${
                    lic.type === 'premium'
                      ? 'bg-[var(--primary)] text-white hover:opacity-90'
                      : 'border border-[var(--border)] hover:border-purple-500/40 hover:text-[var(--primary)]'
                  }`}
                >
                  <Zap size={13} />
                  Contratar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sync */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="text-4xl">🎬</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">¿Música para publicidad, cine o podcast?</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Licencias de sync personalizadas. Presupuesto en menos de 24&nbsp;h.</p>
        </div>
        <Link
          href="/contacto?motivo=sync"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--primary)] text-[var(--primary)] text-sm font-semibold hover:bg-purple-500/10 transition-colors"
        >
          <ExternalLink size={13} />
          Consultar sync
        </Link>
      </div>
    </div>
  )
}
