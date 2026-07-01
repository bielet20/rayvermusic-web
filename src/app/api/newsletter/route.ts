import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

// In-memory rate limiting: max 3 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  if (entry.count >= 3) return true
  entry.count++
  return false
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
  }

  const { email, name } = body as Record<string, unknown>

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (email.length > 254) {
    return NextResponse.json({ error: 'Email demasiado largo' }, { status: 400 })
  }
  if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email: email.toLowerCase().trim(), name: (name as string)?.trim() || null, is_active: true },
      { onConflict: 'email' }
    )

  if (error) return NextResponse.json({ error: 'Error al suscribirse' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
