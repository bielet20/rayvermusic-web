import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ connections: [] })
  }

  const { data } = await supabase
    .from('platform_connections')
    .select('platform, platform_display_name, platform_avatar_url, connected_at')
    .eq('user_id', user.id)

  return NextResponse.json({ connections: data ?? [] })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform')

  if (!platform) {
    return NextResponse.json({ error: 'platform required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const validPlatforms = ['spotify', 'soundcloud', 'youtube', 'apple_music'] as const
  type Platform = typeof validPlatforms[number]
  if (!validPlatforms.includes(platform as Platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  await supabase
    .from('platform_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', platform as Platform)

  return NextResponse.json({ ok: true })
}
