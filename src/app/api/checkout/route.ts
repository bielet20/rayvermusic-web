import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getBeat, getLicense, type LicenseType } from '@/lib/beats-catalog'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { beatId, licenseType } = await request.json()

  const beat = getBeat(beatId)
  const license = getLicense(licenseType as LicenseType)

  if (!beat || !license) {
    return NextResponse.json({ error: 'Beat o licencia no encontrados' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://rayvermusic.com'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    locale: 'es',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: license.priceCents,
          product_data: {
            name: `${beat.title} — Licencia ${license.name}`,
            description: license.description,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      beatId: beat.id,
      beatTitle: beat.title,
      licenseType: license.type,
      licenseName: license.name,
    },
    success_url: `${baseUrl}/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/beats`,
  })

  return NextResponse.json({ url: session.url })
}
