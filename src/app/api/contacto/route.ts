import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const VALID_SERVICES = ['dj_booking', 'production', 'remix', 'mastering', 'sync', 'other'] as const

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }
  if (entry.count >= 5) return true
  entry.count++
  return false
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
  }

  const {
    name, email, service_type, event_date, venue, city, budget, message,
  } = body as Record<string, unknown>

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.length > 254) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (!service_type || !VALID_SERVICES.includes(service_type as typeof VALID_SERVICES[number])) {
    return NextResponse.json({ error: 'Servicio inválido' }, { status: 400 })
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 2000) {
    return NextResponse.json({ error: 'Mensaje inválido (mín. 10 caracteres)' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { error } = await supabase.from('booking_requests').insert({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    service_type: service_type as typeof VALID_SERVICES[number],
    event_date: event_date ? String(event_date) : null,
    venue: venue ? String(venue).slice(0, 200) : null,
    city: city ? String(city).slice(0, 100) : null,
    budget: budget ? String(budget).slice(0, 100) : null,
    message: message.trim(),
  })

  if (error) return NextResponse.json({ error: 'Error al enviar. Inténtalo de nuevo.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
