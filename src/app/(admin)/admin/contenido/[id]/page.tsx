import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ContenidoForm } from '@/components/admin/ContenidoForm'
import { updateContenido } from '../actions'

export const metadata: Metadata = { title: 'Admin — Editar contenido' }

export default async function EditarContenidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: item } = await supabase.from('exclusive_content').select('*').eq('id', id).single()
  if (!item) notFound()

  const action = updateContenido.bind(null, id)

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/contenido" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-black">Editar contenido</h1>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <ContenidoForm action={action} defaultValues={item} />
      </div>
    </div>
  )
}
