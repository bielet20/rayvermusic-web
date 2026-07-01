import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Music2, Mic2, Headphones, Zap, Star, ArrowRight,
  CheckCircle2, Mail, MessageSquare, Clock, Globe,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Servicios · Rayver',
  description: 'Contrata a Rayver para tu evento, producción musical, remix o mastering. DJ & Productor profesional con más de 10 años de experiencia.',
}

const SERVICES = [
  {
    id: 'dj_booking',
    icon: Music2,
    color: 'purple',
    title: 'DJ Booking',
    tagline: 'Vive la experiencia Rayver en directo',
    description: 'Sets de alta energía adaptados a tu evento. Techno, trance, progressive y electrónica que mantienen el dancefloor encendido de principio a fin.',
    includes: [
      'Set personalizado según el ambiente del evento',
      'Equipamiento técnico de calidad profesional',
      'Comunicación directa para coordinar la sesión',
      'Disponibilidad en toda España y Europa',
    ],
    events: ['Clubes & Discotecas', 'Festivales', 'Eventos privados', 'Bodas & Corporativos', 'Residencias'],
    cta: 'Solicitar booking',
    href: '/contacto?servicio=dj_booking',
  },
  {
    id: 'production',
    icon: Headphones,
    color: 'blue',
    title: 'Producción Musical',
    tagline: 'Tu música, tu identidad sonora',
    description: 'Producciones originales a medida con el sello de Rayver. Desde la idea inicial hasta el track listo para distribución en plataformas.',
    includes: [
      'Composición y arreglos originales',
      'Mixing y mastering incluidos',
      'Hasta 3 revisiones por proyecto',
      'Entrega en formato WAV de alta calidad',
      'Derechos de autor según acuerdo',
    ],
    events: ['Tracks originales', 'Ghost production', 'Colaboraciones', 'Bandas sonoras'],
    cta: 'Hablar de un proyecto',
    href: '/contacto?servicio=production',
  },
  {
    id: 'remix',
    icon: Zap,
    color: 'orange',
    title: 'Remixes',
    tagline: 'Tu canción, reinventada',
    description: 'Remixes de alta calidad que transforman tu track en una pieza de club o electrónica con la esencia y el estilo característico de Rayver.',
    includes: [
      'Análisis del track original',
      'Reinterpretación completa con elementos propios',
      'Stems organizados para futuras ediciones',
      'Entrega en 2-4 semanas',
    ],
    events: ['Remix oficial', 'Club mix', 'Bootleg (uso personal)', 'Radio edit'],
    cta: 'Pedir un remix',
    href: '/contacto?servicio=remix',
  },
  {
    id: 'mastering',
    icon: Mic2,
    color: 'teal',
    title: 'Mixing & Mastering',
    tagline: 'El sonido que mereces',
    description: 'Mixing y mastering profesional para que tu música suene perfecta en cualquier sistema de sonido, desde auriculares hasta los mejores altavoces de club.',
    includes: [
      'Mezcla profesional de stems',
      'Mastering para streaming (Spotify, Apple, etc.)',
      'Mastering para club y vinilo',
      'Corrección de frecuencias y dinámica',
      'Revisión incluida si no estás satisfecho',
    ],
    events: ['Singles', 'EPs', 'Álbumes', 'Podcasts & Mixes'],
    cta: 'Solicitar presupuesto',
    href: '/contacto?servicio=mastering',
  },
]

const COLORMAP: Record<string, { icon: string; badge: string; border: string; cta: string }> = {
  purple: {
    icon: 'text-purple-400 bg-purple-500/10',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    border: 'hover:border-purple-500/40',
    cta: 'bg-purple-600 hover:bg-purple-500 text-white',
  },
  blue: {
    icon: 'text-blue-400 bg-blue-500/10',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    border: 'hover:border-blue-500/40',
    cta: 'bg-blue-600 hover:bg-blue-500 text-white',
  },
  orange: {
    icon: 'text-orange-400 bg-orange-500/10',
    badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    border: 'hover:border-orange-500/40',
    cta: 'bg-orange-600 hover:bg-orange-500 text-white',
  },
  teal: {
    icon: 'text-teal-400 bg-teal-500/10',
    badge: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    border: 'hover:border-teal-500/40',
    cta: 'bg-teal-600 hover:bg-teal-500 text-white',
  },
}

const STATS = [
  { value: '10+', label: 'Años de experiencia' },
  { value: '200+', label: 'Shows en directo' },
  { value: '50+', label: 'Producciones originales' },
  { value: '15+', label: 'Países' },
]

const PRESS = [
  'Electronic Beats', 'Mixmag España', 'DJ Mag', 'Resident Advisor',
]

export default function ServiciosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Hero */}
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-6">
          <Star size={12} />
          Servicios profesionales
        </div>
        <h1 className="text-4xl sm:text-6xl font-black mb-5 leading-tight">
          Lleva tu proyecto<br />
          <span className="text-purple-400">al siguiente nivel</span>
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
          DJ & Productor con más de 10 años de experiencia. Sets de alta energía, producciones originales, remixes y mastering profesional para artistas y marcas.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link
            href="/contacto"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors"
          >
            <Mail size={16} />
            Contactar ahora
          </Link>
          <Link
            href="/musica"
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] font-semibold hover:bg-[var(--muted)] transition-colors"
          >
            <Music2 size={16} />
            Escuchar música
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
        {STATS.map(({ value, label }) => (
          <div key={label} className="text-center p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="text-3xl font-black text-purple-400 mb-1">{value}</div>
            <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
          </div>
        ))}
      </div>

      {/* Services */}
      <section className="mb-20">
        <h2 className="text-2xl font-black mb-2">¿En qué puedo ayudarte?</h2>
        <p className="text-[var(--muted-foreground)] mb-10">Servicios a medida para cada necesidad artística y comercial.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map(service => {
            const colors = COLORMAP[service.color]
            const Icon = service.icon
            return (
              <div
                key={service.id}
                className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 flex flex-col transition-all ${colors.border}`}
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{service.title}</h3>
                    <p className={`text-sm font-medium mt-0.5 ${colors.icon.split(' ')[0]}`}>{service.tagline}</p>
                  </div>
                </div>

                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-5">
                  {service.description}
                </p>

                {/* Includes */}
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Incluye:</p>
                  <ul className="space-y-2">
                    {service.includes.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={14} className={`flex-shrink-0 mt-0.5 ${colors.icon.split(' ')[0]}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Types */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {service.events.map(ev => (
                    <span
                      key={ev}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors.badge}`}
                    >
                      {ev}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  <Link
                    href={service.href}
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full font-semibold text-sm transition-colors ${colors.cta}`}
                  >
                    {service.cta}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-20 p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)]">
        <h2 className="text-2xl font-black mb-2">¿Cómo funciona?</h2>
        <p className="text-[var(--muted-foreground)] mb-8">Proceso sencillo y transparente de inicio a fin.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '01', icon: MessageSquare, title: 'Cuéntame tu proyecto', desc: 'Escríbeme con todos los detalles: qué necesitas, cuándo, dónde y cualquier referencia que tengas.' },
            { step: '02', icon: Clock, title: 'Propuesta personalizada', desc: 'En menos de 48h recibirás una propuesta detallada adaptada a tu proyecto y presupuesto.' },
            { step: '03', icon: Zap, title: 'A trabajar', desc: 'Acordamos condiciones, fechas y empezamos. Comunicación directa en todo momento hasta la entrega.' },
          ].map(({ step, icon: StepIcon, title, desc }) => (
            <div key={step} className="relative">
              <div className="text-4xl font-black text-purple-500/20 mb-3">{step}</div>
              <div className="flex items-center gap-2 mb-2">
                <StepIcon size={16} className="text-purple-400" />
                <h3 className="font-bold">{title}</h3>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Press / As seen in */}
      <section className="mb-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-6">
          Presencia en medios
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {PRESS.map(outlet => (
            <span key={outlet} className="text-sm font-bold text-[var(--muted-foreground)] opacity-60 hover:opacity-100 transition-opacity">
              {outlet}
            </span>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center p-10 rounded-3xl border border-purple-500/20 bg-purple-500/5">
        <Globe size={32} className="text-purple-400 mx-auto mb-4" />
        <h2 className="text-3xl font-black mb-3">¿Listo para empezar?</h2>
        <p className="text-[var(--muted-foreground)] mb-7 max-w-md mx-auto">
          Sin compromisos. Cuéntame tu proyecto y encontramos la mejor manera de trabajar juntos.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/contacto"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors"
          >
            <Mail size={16} />
            Enviar mensaje
          </Link>
          <a
            href="https://instagram.com/rayvermusic"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-[var(--border)] font-bold hover:bg-[var(--muted)] transition-colors"
          >
            <MessageSquare size={16} />
            DM en Instagram
          </a>
        </div>
      </section>

    </div>
  )
}
