import Link from 'next/link'
import { Music2, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <Music2 size={14} className="text-white" />
              </div>
              <span className="font-bold">Rayver<span className="text-[var(--primary)]">Music</span></span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] max-w-xs leading-relaxed">
              DJ & Productor de música electrónica. Techno, trance y sonidos que mueven cuerpos y almas.
            </p>
            <div className="flex gap-2 mt-4">
              <a href="https://instagram.com/rayvermusic" target="_blank" rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors text-xs font-bold">
                Instagram
              </a>
              <a href="https://soundcloud.com/biel-rivero-sampol" target="_blank" rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors text-xs font-bold">
                SoundCloud
              </a>
              <a href="https://www.youtube.com/@rayvermusic" target="_blank" rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors text-xs font-bold">
                YouTube
              </a>
              <a href="https://open.spotify.com/artist/0GmwWh84e70RNGNkYOwE6d" target="_blank" rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors text-xs font-bold">
                Spotify
              </a>
            </div>
            <a href="mailto:booking@rayvermusic.com"
              className="flex items-center gap-2 mt-4 text-sm text-[var(--muted-foreground)] hover:text-purple-400 transition-colors">
              <Mail size={13} />
              booking@rayvermusic.com
            </a>
          </div>

          {/* Descubre */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Descubre</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Música', '/musica'],
                ['Eventos', '/eventos'],
                ['Servicios', '/servicios'],
                ['Bio', '/bio'],
                ['Gramola', '/gramola'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comunidad + Servicios */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Comunidad</h4>
            <ul className="space-y-2 text-sm mb-6">
              {[
                ['Chat', '/comunidad/chat'],
                ['Exclusivo', '/comunidad/exclusivo'],
                ['Votaciones', '/comunidad/votaciones'],
                ['Contacto', '/contacto'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Contratar</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['DJ Booking', '/contacto?servicio=dj_booking'],
                ['Producción', '/contacto?servicio=production'],
                ['Remix', '/contacto?servicio=remix'],
                ['Mastering', '/contacto?servicio=mastering'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[var(--muted-foreground)] hover:text-purple-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted-foreground)]">
          <span>© {new Date().getFullYear()} Rayver Music. Todos los derechos reservados.</span>
          <span>Hecho con ♥ para la comunidad electrónica</span>
        </div>
      </div>
    </footer>
  )
}
