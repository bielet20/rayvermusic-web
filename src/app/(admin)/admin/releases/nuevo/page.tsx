import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ReleaseForm } from '@/components/admin/ReleaseForm'
import { createRelease } from '../actions'

export const metadata: Metadata = { title: 'Admin — Nuevo release' }

export default function NuevoReleasePage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/releases" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-2xl font-black">Nuevo release</h1>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <ReleaseForm action={createRelease} />
      </div>
    </div>
  )
}
