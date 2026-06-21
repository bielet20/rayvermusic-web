'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Music2, ShoppingCart, Check, ExternalLink, Zap } from 'lucide-react'

type Genre = 'all' | 'trance' | 'electronica' | 'orquestal' | 'pop'

interface Beat {
  id: string
  title: string
  genre: Genre
  bpm: number
  key: string
  price: number
  tags: string[]
}

const BEATS: Beat[] = [
  { id: 'hearts-in-motion',        title: 'Hearts In Motion',         genre: 'trance',     bpm: 128, key: 'Am', price: 49,  tags: ['Épico', 'Stems incluidos'] },
  { id: 'eternal-frequencies',     title: 'Eternal Frequencies',      genre: 'orquestal',  bpm: 120, key: 'Dm', price: 49,  tags: ['Sync', 'Cinematográfico'] },
  { id: 'summum',                  title: 'Summum',                   genre: 'electronica', bpm: 124, key: 'Gm', price: 49,  tags: ['Dark', 'Profundo'] },
  { id: 'shine-together',          title: 'Shine Together',           genre: 'electronica', bpm: 130, key: 'Em', price: 49,  tags: ['Uplifting', 'Festival'] },
  { id: 'vuelven-las-emociones',   title: 'Vuelven las Emociones',    genre: 'pop',        bpm: 118, key: 'C',  price: 39,  tags: ['Emotivo', 'IA'] },
  { id: 'classic-essence',         title: 'Classic Essence',          genre: 'orquestal',  bpm: 80,  key: 'Fm', price: 69,  tags: ['Épico', 'Orquesta'] },
  { id: 'cuando-el-silencio-grita',title: 'Cuando el Silencio Grita', genre: 'pop',        bpm: 90,  key: 'Am', price: 39,  tags: ['Balada', 'Íntimo'] },
  { id: 'deepbrave',               title: 'DEEPBRAVE',                genre: 'trance',     bpm: 138, key: 'Bm', price: 49,  tags: ['Hypnótico', 'Oscuro'] },
  { id: 'entre-lo-que-fui',        title: 'Entre lo que fui y lo que soy', genre: 'pop',   bpm: 95,  key: 'Dm', price: 39,  tags: ['Lírico', 'Stems incluidos'] },
  { id: 'los-buenos-recuerdos',    title: 'Los Buenos Recuerdos',     genre: 'pop',        bpm: 88,  key: 'G',  price: 39,  tags: ['Nostálgico', 'Stems incluidos'] },
]

const GENRE_LABELS: Record<Genre, string> = {
  all: 'Todos',
  trance: 'Trance',
  electronica: 'Electrónica',
  orquestal: 'Orquestal',
  pop: 'Pop / Balada',
}

const GENRE_COLORS: Record<Exclude<Genre, 'all'>, string> = {
  trance:     'from-violet-900/60 to-indigo-950/80',
  electronica:'from-blue-950/60 to-slate-950/80',
  orquestal:  'from-stone-900/60 to-zinc-950/80',
  pop:        'from-fuchsia-950/60 to-violet-950/80',
}

const LICENSES = [
  {
    name: 'Básica',
    price: '49€',
    highlight: false,
    features: [
      { ok: true,  text: 'MP3 320 kbps' },
      { ok: true,  text: 'YouTube & redes sociales' },
      { ok: true,  text: 'Hasta 100.000 streams' },
      { ok: true,  text: 'Crédito al productor' },
      { ok: false, text: 'WAV sin comprimir' },
      { ok: false, text: 'Stems separados' },
      { ok: false, text: 'Uso comercial amplio' },
    ],
  },
  {
    name: 'Premium',
    price: '149€',
    highlight: true,
    features: [
      { ok: true,  text: 'WAV sin comprimir' },
      { ok: true,  text: 'Stems separados' },
      { ok: true,  text: 'Streams ilimitados' },
      { ok: true,  text: 'Uso comercial completo' },
      { ok: true,  text: 'Radio y TV local' },
      { ok: true,  text: 'Reventa como artista' },
      { ok: false, text: 'Derechos exclusivos' },
    ],
  },
  {
    name: 'Exclusiva',
    price: 'Consultar',
    highlight: false,
    features: [
      { ok: true, text: 'Derechos exclusivos totales' },
      { ok: true, text: 'WAV + Stems + Proyecto DAW' },
      { ok: true, text: 'Sync: cine, TV, publicidad' },
      { ok: true, text: 'Beat retirado del catálogo' },
      { ok: true, text: 'Streams ilimitados' },
      { ok: true, text: 'Puedes registrar la obra' },
      { ok: true, text: 'Sesión de producción incluida' },
    ],
  },
]

export default function BeatsPage() {
  const [filter, setFilter] = useState<Genre>('all')

  const visible = filter === 'all' ? BEATS : BEATS.filter(b => b.genre === filter)

  function whatsapp(beat: Beat, license: string) {
    const msg = `Hola RAYVER! Me interesa el beat "${beat.title}" con licencia ${license}. ¿Hablamos?`
    window.open(`https://wa.me/34TUNUMERO?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header */}
      <div className="mb-12 max-w-2xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Beats disponibles
        </span>
        <h1 className="text-4xl sm:text-5xl font-black mb-3">
          Beats <span className="text-[var(--primary)]">&amp; Licencias</span>
        </h1>
        <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
          Producciones originales — sin intermediarios. Elige licencia y contacta directo.
          Entrega en menos de 24&nbsp;h.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(Object.keys(GENRE_LABELS) as Genre[]).map(g => (
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
            {/* Cover */}
            <div className={`aspect-square bg-gradient-to-br ${GENRE_COLORS[beat.genre as Exclude<Genre,'all'>]} relative flex items-center justify-center`}>
              <Music2 size={40} className="text-white/20 group-hover:text-white/30 transition-colors" />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white capitalize">
                {GENRE_LABELS[beat.genre as Genre]}
              </span>
              <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                {beat.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-600/80 text-white">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-bold text-sm leading-tight mb-1">{beat.title}</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                {beat.bpm} BPM · Key {beat.key}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)] text-xs">
                  desde <strong className="text-[var(--primary)] text-base">{beat.price}€</strong>
                </span>
                <button
                  onClick={() => whatsapp(beat, 'Básica')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart size={11} />
                  Licenciar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* License tiers */}
      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-black mb-2">Tipos de licencia</h2>
        <p className="text-[var(--muted-foreground)] mb-8 text-sm">Sin letra pequeña. Pago único, tuyo para siempre.</p>

        <div className="grid md:grid-cols-3 gap-4">
          {LICENSES.map(lic => (
            <div
              key={lic.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                lic.highlight
                  ? 'border-[var(--primary)] bg-purple-950/20'
                  : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              {lic.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold bg-[var(--primary)] text-white">
                  MÁS POPULAR
                </span>
              )}
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-1">{lic.name}</div>
              <div className="text-4xl font-black mb-5">{lic.price}</div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {lic.features.map(f => (
                  <li key={f.text} className={`flex items-start gap-2 text-sm ${f.ok ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                    <Check size={14} className={`mt-0.5 shrink-0 ${f.ok ? 'text-[var(--primary)]' : 'opacity-20'}`} />
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link
                href={`/contacto?motivo=beats&licencia=${lic.name.toLowerCase()}`}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-opacity ${
                  lic.highlight
                    ? 'bg-[var(--primary)] text-white hover:opacity-90'
                    : 'border border-[var(--border)] hover:border-purple-500/40 hover:text-[var(--primary)]'
                }`}
              >
                <Zap size={13} />
                {lic.name === 'Exclusiva' ? 'Consultar precio' : 'Contratar'}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Sync callout */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="text-4xl">🎬</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">¿Música para publicidad, cine o podcast?</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Licencias de sync personalizadas para proyectos audiovisuales. Respondo en menos de 24&nbsp;h.
          </p>
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
