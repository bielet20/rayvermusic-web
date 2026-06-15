'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Music2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/comunidad')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center glow-purple">
              <Music2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl">Rayver<span className="text-purple-400">Music</span></span>
          </Link>
          <h1 className="text-2xl font-black">Únete a la comunidad</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Crea tu cuenta gratis</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {[
            { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Tu nombre' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com' },
            { name: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">{label}</label>
              <input
                name={name} type={type} required value={form[name as keyof typeof form]}
                onChange={handleChange} placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 transition-colors disabled:opacity-60"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>

          <p className="text-xs text-center text-[var(--muted-foreground)]">
            Al registrarte aceptas los términos de uso.
          </p>
        </form>

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
