import { NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const TO_EMAIL = 'forter2k17@gmail.com'
const FROM_EMAIL = 'noreply@rayvermusic.com'

export async function POST(request: Request) {
  const { name, email, motivo, mensaje } = await request.json()

  if (!name || !email || !mensaje) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email no configurado' }, { status: 500 })
  }

  const subject = `[rayvermusic.com] ${motivo || 'Contacto'} — ${name}`

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
      <div style="background:#a855f7;padding:24px 32px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;color:#fff;font-size:20px">Nuevo mensaje — rayvermusic.com</h2>
      </div>
      <div style="background:#f9f9f9;padding:24px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e5e5;border-top:none">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#666;width:100px">Nombre</td><td style="padding:6px 0;font-weight:600">${name}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:#a855f7">${email}</a></td></tr>
          <tr><td style="padding:6px 0;color:#666">Motivo</td><td style="padding:6px 0">${motivo || '—'}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
        <p style="white-space:pre-wrap;margin:0;line-height:1.6">${mensaje}</p>
      </div>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: TO_EMAIL, reply_to: email, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Error al enviar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
