import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type { Plan } from '@/lib/features'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
const resendKey = process.env.RESEND_API_KEY!
const artistEmail = 'bielrivero@gmail.com'

const PRICE_TO_PLAN: Record<string, Plan> = {
  [process.env.STRIPE_PRO_PRICE_ID ?? '']: 'pro',
  [process.env.STRIPE_ARTIST_PRICE_ID ?? '']: 'artist',
  [process.env.STRIPE_LABEL_PRICE_ID ?? '']: 'label',
  [process.env.STRIPE_PREMIUM_PRICE_ID ?? '']: 'pro',
}

type SubStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'

async function upsertSubscription({
  userId, customerId, stripeSubId, priceId, plan, status, cancelAtEnd,
}: {
  userId: string; customerId: string | null; stripeSubId: string; priceId: string | null
  plan: Plan; status: string; cancelAtEnd: boolean
}) {
  const supabase = await createAdminClient()
  const validStatus: SubStatus = (['active', 'canceled', 'past_due', 'trialing', 'incomplete'] as const)
    .includes(status as SubStatus) ? status as SubStatus : 'active'

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: stripeSubId,
    stripe_price_id: priceId,
    plan,
    status: validStatus,
    cancel_at_period_end: cancelAtEnd,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  await supabase.from('profiles').update({
    membership: plan,
    ...(customerId ? { stripe_customer_id: customerId } : {}),
  }).eq('id', userId)
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  // ─── Subscription: checkout completed ───────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.mode === 'subscription') {
      const userId = session.metadata?.user_id
      const plan = (session.metadata?.plan ?? 'pro') as Plan
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await upsertSubscription({
          userId,
          customerId: session.customer as string | null,
          stripeSubId: sub.id,
          priceId: sub.items.data[0]?.price?.id ?? null,
          plan,
          status: sub.status,
          cancelAtEnd: sub.cancel_at_period_end,
        })
      }
      return NextResponse.json({ received: true })
    }

    // Beat purchase (legacy path)
    const { beatTitle, licenseName, licenseType, beatId } = session.metadata ?? {}
    const customerEmail = session.customer_details?.email ?? ''
    const customerName = session.customer_details?.name ?? 'Cliente'
    const amountEur = ((session.amount_total ?? 0) / 100).toFixed(2)

    // Email al comprador
    await sendEmail({
      to: customerEmail,
      subject: `✅ Pago confirmado — ${beatTitle} (Licencia ${licenseName})`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#8a2be2;padding:24px 32px;border-radius:12px 12px 0 0">
            <h2 style="margin:0;color:#fff">¡Gracias por tu compra, ${customerName}!</h2>
          </div>
          <div style="background:#f9f9f9;padding:24px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e5e5;border-top:none">
            <p style="font-size:16px">Hemos recibido tu pago correctamente.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px 0;color:#666;width:120px">Beat</td><td style="font-weight:700">${beatTitle}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Licencia</td><td style="font-weight:700">${licenseName}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Importe</td><td style="font-weight:700">${amountEur}€</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
            <p style="color:#555;line-height:1.6">
              <strong>Recibirás el archivo en menos de 24 horas</strong> en este mismo email.
              Si tienes alguna duda, responde a este correo o escríbeme a
              <a href="mailto:bielrivero@gmail.com" style="color:#8a2be2">bielrivero@gmail.com</a>.
            </p>
            <p style="color:#555">Gracias por apoyar mi música.<br/><strong>RAYVER</strong></p>
          </div>
        </div>
      `,
    })

    // Email al artista (RAYVER)
    await sendEmail({
      to: artistEmail,
      subject: `💰 Nueva venta — ${beatTitle} · Licencia ${licenseName} · ${amountEur}€`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#8a2be2;padding:24px 32px;border-radius:12px 12px 0 0">
            <h2 style="margin:0;color:#fff">¡Nueva venta en rayvermusic.com!</h2>
          </div>
          <div style="background:#f9f9f9;padding:24px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e5e5;border-top:none">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#666;width:120px">Beat</td><td style="font-weight:700">${beatTitle}</td></tr>
              <tr><td style="padding:8px 0;color:#666">ID Beat</td><td>${beatId}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Licencia</td><td style="font-weight:700">${licenseName} (${licenseType})</td></tr>
              <tr><td style="padding:8px 0;color:#666">Importe</td><td style="font-weight:700;color:#16a34a">${amountEur}€</td></tr>
              <tr><td style="padding:8px 0;color:#666">Comprador</td><td>${customerName}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Email</td><td><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0"/>
            <p style="color:#555;font-weight:600">Acción requerida: envía el archivo a ${customerEmail} en menos de 24h.</p>
          </div>
        </div>
      `,
    })
  }

  // ─── Subscription: updated ──────────────────────────────────────────────────
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.user_id
    if (userId) {
      const priceId = sub.items.data[0]?.price?.id ?? ''
      const plan = PRICE_TO_PLAN[priceId] ?? 'pro'
      await upsertSubscription({
        userId,
        customerId: sub.customer as string | null,
        stripeSubId: sub.id,
        priceId,
        plan: sub.status === 'active' || sub.status === 'trialing' ? plan : 'free',
        status: sub.status,
        cancelAtEnd: sub.cancel_at_period_end,
      })
    }
  }

  // ─── Subscription: canceled / deleted ───────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.user_id
    if (userId) {
      const supabase = await createAdminClient()
      await supabase.from('profiles').update({ membership: 'free' }).eq('id', userId)
      await supabase.from('subscriptions').update({
        plan: 'free',
        status: 'canceled',
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)
    }
  }

  return NextResponse.json({ received: true })
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!to || !resendKey) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'RAYVER <noreply@rayvermusic.com>', to, subject, html }),
  })
}
