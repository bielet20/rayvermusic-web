import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight, Music2, Zap, Calendar, Users, Radio, ChevronDown } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-800/8 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            DJ & Productor · Música Electrónica
          </span>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none">
            <span className="block text-white">RAYVER</span>
            <span className="block text-purple-400 text-glow">MUSIC</span>
          </h1>

          <p className="max-w-lg text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed">
            Techno, trance y electrónica que mueven cuerpos y almas.
            Únete a la comunidad, pide canciones en la Gramola y vive la experiencia en directo.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link
              href="/comunidad"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors glow-purple"
            >
              <Zap size={16} />
              Únete a la comunidad
            </Link>
            <Link
              href="/musica"
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--muted)] transition-colors"
            >
              <Music2 size={16} />
              Escucha la música
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--muted-foreground)] animate-bounce">
          <span className="text-xs">Explora</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-2">Todo en un solo lugar</h2>
          <p className="text-center text-[var(--muted-foreground)] mb-12">Música, comunidad y experiencias en vivo</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Music2,
                title: 'Releases',
                desc: 'Tracks, EPs y álbumes. Escucha en tu plataforma favorita.',
                href: '/musica',
                color: 'text-purple-400',
              },
              {
                icon: Calendar,
                title: 'Eventos',
                desc: 'Próximos gigs, fechas y localidades. No te pierdas ningún show.',
                href: '/eventos',
                color: 'text-blue-400',
              },
              {
                icon: Users,
                title: 'Comunidad',
                desc: 'Chat en vivo, contenido exclusivo y votaciones para fans.',
                href: '/comunidad',
                color: 'text-green-400',
              },
              {
                icon: Radio,
                title: 'Gramola',
                desc: 'Pide tu canción favorita vía QR y aparece en el set en vivo.',
                href: '/gramola',
                color: 'text-orange-400',
              },
            ].map(({ icon: Icon, title, desc, href, color }) => (
              <Link
                key={href}
                href={href}
                className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-purple-500/50 hover:bg-[var(--muted)] transition-all"
              >
                <Icon size={28} className={`${color} mb-4`} />
                <h3 className="font-bold text-lg mb-1 group-hover:text-purple-400 transition-colors">{title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorar <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Mantente al día</h2>
          <p className="text-[var(--muted-foreground)] mb-6 text-sm">Nuevos tracks, eventos y contenido exclusivo directo a tu inbox.</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-4 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors whitespace-nowrap"
            >
              Suscríbete
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}
