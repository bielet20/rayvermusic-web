import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/player?error=spotify_denied`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login?redirect=/player`)
  }

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${appUrl}/api/auth/spotify/callback`,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/player?error=spotify_token`)
  }

  const tokens = await tokenRes.json()

  const profileRes = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const sp = profileRes.ok ? await profileRes.json() : {}

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await supabase.from('platform_connections').upsert({
    user_id: user.id,
    platform: 'spotify',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    token_expires_at: expiresAt,
    platform_user_id: sp.id ?? null,
    platform_username: sp.id ?? null,
    platform_display_name: sp.display_name ?? null,
    platform_avatar_url: sp.images?.[0]?.url ?? null,
    scopes: tokens.scope?.split(' ') ?? [],
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,platform' })

  return NextResponse.redirect(`${appUrl}/player?connected=spotify`)
}
