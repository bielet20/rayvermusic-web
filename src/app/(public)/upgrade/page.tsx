import { createClient } from '@/lib/supabase/server'
import { PLAN_FEATURES, PLAN_NAMES, PLAN_PRICES, PLAN_DESCRIPTIONS, type Plan } from '@/lib/features'
import UpgradeClient from './UpgradeClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planes',
  description: 'Elige tu plan y conecta tus plataformas de música favoritas.',
}

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: Plan = 'free'
  if (user) {
    const { data } = await supabase.from('profiles').select('membership').eq('id', user.id).single()
    currentPlan = (data?.membership ?? 'free') as Plan
  }

  return (
    <UpgradeClient
      currentPlan={currentPlan}
      isLoggedIn={!!user}
      plans={['free', 'pro', 'artist', 'label'] as Plan[]}
      planNames={PLAN_NAMES}
      planPrices={PLAN_PRICES}
      planDescriptions={PLAN_DESCRIPTIONS}
      planFeatures={PLAN_FEATURES}
    />
  )
}
