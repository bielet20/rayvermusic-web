import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PLAN_FEATURES, PLAN_NAMES, PLAN_PRICES, type Plan } from '@/lib/features'
import CuentaClient from './CuentaClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Cuenta',
  description: 'Gestiona tu suscripción y plataformas conectadas.',
}

function normalizePlan(m: string | null | undefined): Plan {
  if (m === 'premium') return 'pro'
  if (m === 'pro' || m === 'artist' || m === 'label') return m
  return 'free'
}

export default async function CuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/cuenta')

  const [profileRes, subRes, connRes] = await Promise.all([
    supabase.from('profiles').select('membership, display_name, username, avatar_url, stripe_customer_id').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('platform_connections').select('platform, platform_display_name, platform_avatar_url, connected_at').eq('user_id', user.id),
  ])

  const plan = normalizePlan(profileRes.data?.membership)
  const features = PLAN_FEATURES[plan]

  return (
    <CuentaClient
      user={{
        id: user.id,
        email: user.email ?? '',
        displayName: profileRes.data?.display_name ?? null,
        username: profileRes.data?.username ?? null,
        avatarUrl: profileRes.data?.avatar_url ?? null,
      }}
      plan={plan}
      planName={PLAN_NAMES[plan]}
      planPrice={PLAN_PRICES[plan]}
      features={features}
      subscription={subRes.data ?? null}
      connections={connRes.data ?? []}
    />
  )
}
