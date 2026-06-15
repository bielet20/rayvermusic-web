'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Music2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/comunidad'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Email</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Contraseña</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 pr-11"
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

      <button
        type="submit" disabled={loading}
        className="w-full py-3 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 transition-colors disabled:opacity-60"
      >
        {loading ? 'Iniciando...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

export default function LoginPage() {
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
          <h1 className="text-2xl font-black">Bienvenido de vuelta</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Inicia sesión en tu cuenta</p>
        </div>

        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-[var(--muted)]" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
