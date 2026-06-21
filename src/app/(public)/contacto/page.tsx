'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Mail, AtSign, CheckCircle2, AlertCircle } from 'lucide-react'

const MOTIVOS = [
  { value: 'beats',   label: 'Licencia de beat' },
  { value: 'sync',    label: 'Sync / Publicidad' },
  { value: 'booking', label: 'Booking / Actuación' },
  { value: 'collab',  label: 'Colaboración musical' },
  { value: 'press',   label: 'Prensa / Media' },
  { value: 'other',   label: 'Otro' },
]

export default function ContactoPage() {
  const searchParams = useSearchParams()
  const [motivo, setMotivo] = useState('booking')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  useEffect(() => {
    const m = searchParams.get('motivo')
    if (m && MOTIVOS.find(x => x.value === m)) setMotivo(m)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')

    const form = e.currentTarget
    const data = {
      name:    (form.elements.namedItem('name')    as HTMLInputElement).value,
      email:   (form.elements.namedItem('email')   as HTMLInputElement).value,
      motivo:  MOTIVOS.find(x => x.value === motivo)?.label ?? motivo,
      mensaje: (form.elements.namedItem('mensaje') as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2">Contacto</h1>
        <p className="text-[var(--muted-foreground)]">Beats, bookings, colaboraciones y prensa. Respondo en menos de 24&nbsp;h.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Email</h3>
            <a
              href="mailto:forter2k17@gmail.com"
              className="flex items-center gap-2 text-sm hover:text-purple-400 transition-colors"
            >
              <Mail size={14} className="text-purple-400" />
              forter2k17@gmail.com
            </a>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Redes sociales</h3>
            <div className="space-y-2">
              <a
                href="https://instagram.com/rayvermusic"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-purple-400 transition-colors"
              >
                <AtSign size={14} />
                @rayvermusic
              </a>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
            ¿Buscas un beat específico?{' '}
            <a href="/beats" className="text-purple-400 hover:underline font-medium">
              Explora el catálogo →
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          {status === 'ok' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">Mensaje enviado</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Responderé antes de 24&nbsp;h.</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 text-sm text-purple-400 hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Nombre</label>
                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Email</label>
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Motivo</label>
                <select
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {MOTIVOS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Mensaje</label>
                <textarea
                  required
                  name="mensaje"
                  rows={5}
                  placeholder={
                    motivo === 'beats'
                      ? 'Dime qué beat te interesa y para qué proyecto...'
                      : motivo === 'sync'
                      ? 'Cuéntame el proyecto: tipo de contenido, duración, presupuesto...'
                      : 'Cuéntame...'
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={14} />
                  Error al enviar. Escríbeme directamente a forter2k17@gmail.com
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
              >
                <Send size={14} />
                {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
