import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ReleaseForm } from '@/components/admin/ReleaseForm'
import { updateRelease } from '../actions'

export const metadata: Metadata = { title: 'Admin — Editar release' }

export default async function EditarReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: release } = await supabase.from('releases').select('*').eq('id', id).single()
  if (!release) notFound()

  const action = updateRelease.bind(null, id)

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/releases" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-black">Editar release</h1>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <ReleaseForm action={action} defaultValues={release} />
      </div>
    </div>
  )
}
