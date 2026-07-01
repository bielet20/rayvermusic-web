'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type Room = Database['public']['Tables']['chat_rooms']['Row']
type Message = Database['public']['Tables']['chat_messages']['Row'] & {
  profiles: { display_name: string | null; avatar_url: string | null; role: string } | null
}

interface Props {
  rooms: Room[]
  initialMessages: Message[]
  defaultRoomId: string
  currentUser: { id: string; display_name: string | null; role: string }
}

export default function ChatClient({ rooms, initialMessages, defaultRoomId, currentUser }: Props) {
  const supabase = createClient()
  const [activeRoom, setActiveRoom] = useState(defaultRoomId)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    setMessages(initialMessages)
  }, [activeRoom]) // eslint-disable-line

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${activeRoom}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${activeRoom}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('chat_messages')
          .select('*, profiles(display_name, avatar_url, role)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data as unknown as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeRoom, supabase])

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    await supabase.from('chat_messages').insert({
      room_id: activeRoom,
      user_id: currentUser.id,
      content: text.trim(),
      type: 'text',
    })
    setText('')
    setSending(false)
  }, [text, sending, activeRoom, currentUser.id, supabase])

  async function switchRoom(roomId: string) {
    setActiveRoom(roomId)
    const { data } = await supabase
      .from('chat_messages')
      .select('*, profiles(display_name, avatar_url, role)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50)
    setMessages((data as unknown as Message[]) ?? [])
  }

  return (
    <div className="flex h-screen">
      {/* Rooms sidebar */}
      <aside className="w-44 border-r border-[var(--border)] p-3 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-2 mb-2">Salas</p>
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => switchRoom(room.id)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors',
              activeRoom === room.id
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
            )}
          >
            <Hash size={13} />
            {room.name}
          </button>
        ))}
      </aside>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => {
            const isMe = msg.user_id === currentUser.id
            const name = msg.profiles?.display_name ?? 'Fan'
            const isArtist = msg.profiles?.role === 'artist' || msg.profiles?.role === 'admin'
            return (
              <div key={msg.id} className={cn('flex gap-2.5', isMe && 'flex-row-reverse')}>
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  isArtist ? 'bg-purple-600 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                )}>
                  {name[0]?.toUpperCase()}
                </div>
                <div className={cn('max-w-xs', isMe && 'items-end flex flex-col')}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn('text-xs font-semibold', isArtist && 'text-purple-400')}>
                      {name}
                      {isArtist && <span className="ml-1 text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">Artista</span>}
                    </span>
                  </div>
                  <div className={cn(
                    'px-3 py-2 rounded-2xl text-sm leading-relaxed',
                    isMe
                      ? 'bg-purple-600 text-white rounded-tr-sm'
                      : 'bg-[var(--muted)] text-[var(--foreground)] rounded-tl-sm'
                  )}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-[var(--border)] flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}
