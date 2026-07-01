import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'artist'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const body = await request.json()
  const { name, description, sort_by, is_default, is_active, tracks } = body

  const admin = await createAdminClient()

  // Update playlist meta
  const { error: pErr } = await admin.from('playlists').update({
    name, description, sort_by, is_default, is_active,
  }).eq('id', id)

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

  // Replace tracks (only for custom sort)
  if (sort_by === 'custom' && Array.isArray(tracks)) {
    await admin.from('playlist_tracks').delete().eq('playlist_id', id)
    if (tracks.length > 0) {
      await admin.from('playlist_tracks').insert(
        tracks.map((t: { release_id: string; position: number }) => ({
          playlist_id: id, release_id: t.release_id, position: t.position,
        }))
      )
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const admin = await createAdminClient()
  const { error } = await admin.from('playlists').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
