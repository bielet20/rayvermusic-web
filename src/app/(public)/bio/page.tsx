import type { Metadata } from 'next'
import { Download } from 'lucide-react'

export const metadata: Metadata = { title: 'Bio' }

export default function BioPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid md:grid-cols-5 gap-12 items-start">
        {/* Photo */}
        <div className="md:col-span-2">
          <div className="aspect-square rounded-2xl bg-[var(--muted)] border border-[var(--border)] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)] text-sm">
              Foto del artista
            </div>
          </div>
          <a
            href="/epk.pdf"
            className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:bg-[var(--muted)] transition-colors"
          >
            <Download size={14} />
            Descargar EPK
          </a>
        </div>

        {/* Bio */}
        <div className="md:col-span-3 space-y-6">
          <div>
            <h1 className="text-4xl font-black mb-1">Rayver</h1>
            <p className="text-[var(--muted-foreground)]">DJ & Productor · España</p>
          </div>

          <div className="prose prose-invert prose-sm max-w-none space-y-4 text-[var(--foreground)]">
            <p className="leading-relaxed">
              Rayver es un DJ y productor de música electrónica con raíces en la escena techno y trance española.
              Con una carrera marcada por sets de alta energía y producciones meticulosas, ha logrado crear un sonido
              propio que transita entre lo oscuro del techno y lo elevado del trance progresivo.
            </p>
            <p className="leading-relaxed text-[var(--muted-foreground)]">
              Sus producciones se caracterizan por capas sonoras complejas, basses contundentes y melodías
              que transportan al oyente a otro estado mental. Siempre buscando la conexión directa con el público,
              Rayver convierte cada actuación en una experiencia inmersiva y única.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
            {[
              { value: '10+', label: 'Años activo' },
              { value: '50+', label: 'Tracks producidos' },
              { value: '200+', label: 'Shows en vivo' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-purple-400">{value}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Géneros</h3>
            <div className="flex flex-wrap gap-2">
              {['Techno', 'Trance', 'Progressive', 'Melodic Techno', 'Deep Tech', 'Electronic'].map(g => (
                <span key={g} className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--border)] bg-[var(--muted)]">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
