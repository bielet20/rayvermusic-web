import { createClient } from '@/lib/supabase/server'
import ChatClient from '@/components/community/ChatClient'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: true })

  const defaultRoom = rooms?.[0]

  // Cargar últimos mensajes del room por defecto
  const { data: initialMessages } = defaultRoom
    ? await supabase
        .from('chat_messages')
        .select('*, profiles(display_name, avatar_url, role)')
        .eq('room_id', defaultRoom.id)
        .order('created_at', { ascending: true })
        .limit(50)
    : { data: [] }

  return (
    <ChatClient
      rooms={rooms ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialMessages={(initialMessages ?? []) as any[]}
      defaultRoomId={defaultRoom?.id ?? ''}
      currentUser={{ id: user!.id, display_name: profile?.display_name ?? null, role: profile?.role ?? 'fan' }}
    />
  )
}
