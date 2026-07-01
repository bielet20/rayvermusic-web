'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Mail, AtSign, Phone, CheckCircle, AlertCircle } from 'lucide-react'

const SERVICE_OPTIONS = [
  { value: 'dj_booking',  label: '🎧 DJ Booking / Actuación' },
  { value: 'production',  label: '🎛️ Producción musical' },
  { value: 'remix',       label: '🔄 Remix' },
  { value: 'mastering',   label: '🔊 Mixing & Mastering' },
  { value: 'sync',        label: '🎬 Sincronización / Licencias' },
  { value: 'other',       label: '💬 Otro' },
]

const BUDGET_OPTIONS = [
  { value: '',           label: 'Seleccionar (opcional)' },
  { value: '<500',       label: 'Hasta 500€' },
  { value: '500-1000',   label: '500€ – 1.000€' },
  { value: '1000-3000',  label: '1.000€ – 3.000€' },
  { value: '3000+',      label: 'Más de 3.000€' },
  { value: 'custom',     label: 'Hablamos del presupuesto' },
]

function ContactForm() {
  const searchParams = useSearchParams()
  const preselected = searchParams.get('servicio') ?? 'dj_booking'

  const [form, setForm] = useState({
    name: '', email: '', service_type: preselected,
    event_date: '', venue: '', city: '', budget: '', message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setForm(f => ({ ...f, service_type: preselected }))
  }, [preselected])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.message.trim().length < 10) {
      setErrorMsg('El mensaje debe tener al menos 10 caracteres.')
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Error desconocido')
        setStatus('error')
      } else {
        setStatus('ok')
      }
    } catch {
      setErrorMsg('Error de red. Comprueba tu conexión.')
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-5">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h3 className="font-black text-xl mb-2">¡Mensaje recibido!</h3>
        <p className="text-[var(--muted-foreground)] text-sm max-w-sm">
          Responderé en menos de 48 horas. Mientras tanto, sígueme en redes para no perderte nada.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm text-purple-400 underline hover:text-purple-300"
        >
          Enviar otro mensaje
        </button>
      </div>
    )
  }

  const isBooking = form.service_type === 'dj_booking'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={15} />
          {errorMsg}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Nombre *</label>
          <input required type="text" value={form.name} onChange={set('name')} placeholder="Tu nombre"
            maxLength={100} minLength={2}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Email *</label>
          <input required type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com"
            maxLength={254}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Servicio *</label>
        <select required value={form.service_type} onChange={set('service_type')}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors">
          {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {isBooking && (
        <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Fecha del evento</label>
            <input type="date" value={form.event_date} onChange={set('event_date')}
              className="w-full px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Venue / Sala</label>
            <input type="text" value={form.venue} onChange={set('venue')} placeholder="Nombre del local"
              maxLength={200}
              className="w-full px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Ciudad</label>
            <input type="text" value={form.city} onChange={set('city')} placeholder="Barcelona"
              maxLength={100}
              className="w-full px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Presupuesto estimado</label>
        <select value={form.budget} onChange={set('budget')}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors">
          {BUDGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Mensaje *</label>
        <textarea required rows={5} value={form.message} onChange={set('message')}
          minLength={10} maxLength={2000}
          placeholder="Cuéntame los detalles de tu proyecto o evento..."
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 resize-none transition-colors" />
        <p className="text-xs text-[var(--muted-foreground)] mt-1 text-right">
          {form.message.length}/2000
        </p>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors disabled:opacity-60"
      >
        <Send size={15} />
        {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
      </button>

      <p className="text-xs text-center text-[var(--muted-foreground)]">
        Respondo en menos de 48 horas. Tus datos solo se usan para gestionar tu solicitud.
      </p>
    </form>
  )
}

export default function ContactoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-4">
          <Mail size={12} />
          Contacto profesional
        </div>
        <h1 className="text-4xl font-black mb-2">Hablemos</h1>
        <p className="text-[var(--muted-foreground)]">Bookings, producciones, remixes, colaboraciones y prensa.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Sidebar info */}
        <div className="md:col-span-2 space-y-7">
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
              {[
                { label: '@rayvermusic', href: 'https://instagram.com/rayvermusic', platform: 'Instagram' },
                { label: '@rayvermusic', href: 'https://soundcloud.com/rayvermusic', platform: 'SoundCloud' },
                { label: '@rayvermusic', href: 'https://youtube.com/@rayvermusic', platform: 'YouTube' },
              ].map(s => (
                <a key={s.platform} href={s.href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-purple-400 transition-colors">
                  <AtSign size={14} />
                  <span>{s.label}</span>
                  <span className="text-xs text-[var(--muted-foreground)]/60">· {s.platform}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">Tiempo de respuesta</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Respondo todos los mensajes en menos de <strong className="text-[var(--foreground)]">48 horas</strong>.
              Para urgencias, DM en Instagram.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Servicios disponibles</p>
            <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
              <li>🎧 DJ Booking (clubs, festivales, privados)</li>
              <li>🎛️ Producción original y ghost production</li>
              <li>🔄 Remixes oficiales</li>
              <li>🔊 Mixing & Mastering</li>
              <li>🎬 Sincronización y licencias</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          <Suspense>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
