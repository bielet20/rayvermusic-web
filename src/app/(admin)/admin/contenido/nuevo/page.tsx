import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ContenidoForm } from '@/components/admin/ContenidoForm'
import { createContenido } from '../actions'

export const metadata: Metadata = { title: 'Admin — Nuevo contenido' }

export default function NuevoContenidoPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/contenido" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-black">Nuevo contenido</h1>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <ContenidoForm action={createContenido} />
      </div>
    </div>
  )
}
