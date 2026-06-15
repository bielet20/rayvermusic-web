'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { Send, Mail, AtSign } from 'lucide-react'

// export const metadata: Metadata = { title: 'Contacto' }

export default function ContactoPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2">Contacto</h1>
        <p className="text-[var(--muted-foreground)]">Bookings, colaboraciones y prensa.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Booking</h3>
            <a href="mailto:booking@rayvermusic.com"
              className="flex items-center gap-2 text-sm hover:text-purple-400 transition-colors">
              <Mail size={14} className="text-purple-400" />
              booking@rayvermusic.com
            </a>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Redes sociales</h3>
            <div className="space-y-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-purple-400 transition-colors">
                <AtSign size={14} />
                @rayvermusic
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Send size={20} className="text-green-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">Mensaje enviado</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Responderé en menos de 48 horas.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Nombre</label>
                  <input required type="text" placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Email</label>
                  <input required type="email" placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Motivo</label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500">
                  <option value="booking">Booking / Actuación</option>
                  <option value="collab">Colaboración musical</option>
                  <option value="press">Prensa / Media</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Mensaje</label>
                <textarea required rows={5} placeholder="Cuéntame..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 resize-none" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors disabled:opacity-60"
              >
                <Send size={14} />
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
