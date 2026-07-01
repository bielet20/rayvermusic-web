import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { EventoForm } from '@/components/admin/EventoForm'
import { updateEvento } from '../actions'

export const metadata: Metadata = { title: 'Admin — Editar evento' }

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
  if (!event) notFound()

  const action = updateEvento.bind(null, id)

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/eventos" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-black">Editar evento</h1>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <EventoForm action={action} defaultValues={event} />
      </div>
    </div>
  )
}
