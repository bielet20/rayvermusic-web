'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NuevaPlaylistPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: '', description: '', sort_by: 'custom', is_default: false, is_active: true })
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (data.id) startTransition(() => router.push(`/admin/playlists/${data.id}`))
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/playlists" className="p-2 rounded-lg hover:bg-[var(--muted)]">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-black">Nueva playlist</h1>
      </div>

      <div className="space-y-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Nombre *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Tracks de verano"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Descripción</label>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descripción breve..."
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Tipo</label>
          <select value={form.sort_by} onChange={e => setForm(f => ({ ...f, sort_by: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500">
            <option value="custom">Manual — eliges los tracks tú</option>
            <option value="newest">Automática — más recientes</option>
            <option value="featured">Automática — destacados</option>
            <option value="plays">Automática — más escuchados</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="def" checked={form.is_default}
            onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
            className="w-4 h-4 accent-purple-500" />
          <label htmlFor="def" className="text-sm cursor-pointer">Establecer como playlist por defecto</label>
        </div>

        <button onClick={handleCreate} disabled={saving || !form.name.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors disabled:opacity-60">
          <Save size={15} />
          {saving ? 'Creando...' : 'Crear playlist'}
        </button>
      </div>
    </div>
  )
}
