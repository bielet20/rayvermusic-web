import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email, name } = await request.json()
  if (!email || typeof email !== 'string') return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: email.toLowerCase().trim(), name: name?.trim() || null, is_active: true }, { onConflict: 'email' })

  if (error) return NextResponse.json({ error: 'Error al suscribirse' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
