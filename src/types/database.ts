export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'fan' | 'artist' | 'admin'
          membership: 'free' | 'premium'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'fan' | 'artist' | 'admin'
          membership?: 'free' | 'premium'
          stripe_customer_id?: string | null
        }
        Update: {
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'fan' | 'artist' | 'admin'
          membership?: 'free' | 'premium'
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      releases: {
        Row: {
          id: string
          type: 'track' | 'ep' | 'album' | 'remix'
          title: string
          artist: string
          cover_url: string | null
          release_date: string | null
          description: string | null
          spotify_url: string | null
          apple_url: string | null
          youtube_url: string | null
          soundcloud_url: string | null
          beatport_url: string | null
          is_featured: boolean
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type?: 'track' | 'ep' | 'album' | 'remix'
          title: string
          artist?: string
          cover_url?: string | null
          release_date?: string | null
          description?: string | null
          spotify_url?: string | null
          apple_url?: string | null
          youtube_url?: string | null
          soundcloud_url?: string | null
          beatport_url?: string | null
          is_featured?: boolean
          is_published?: boolean
        }
        Update: {
          type?: 'track' | 'ep' | 'album' | 'remix'
          title?: string
          artist?: string
          cover_url?: string | null
          release_date?: string | null
          description?: string | null
          spotify_url?: string | null
          apple_url?: string | null
          youtube_url?: string | null
          soundcloud_url?: string | null
          beatport_url?: string | null
          is_featured?: boolean
          is_published?: boolean
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          venue: string | null
          city: string | null
          country: string | null
          date: string
          description: string | null
          ticket_url: string | null
          cover_url: string | null
          is_featured: boolean
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          venue?: string | null
          city?: string | null
          country?: string | null
          date: string
          description?: string | null
          ticket_url?: string | null
          cover_url?: string | null
          is_featured?: boolean
          is_published?: boolean
        }
        Update: {
          title?: string
          venue?: string | null
          city?: string | null
          country?: string | null
          date?: string
          description?: string | null
          ticket_url?: string | null
          cover_url?: string | null
          is_featured?: boolean
          is_published?: boolean
        }
        Relationships: []
      }
      exclusive_content: {
        Row: {
          id: string
          type: 'post' | 'track' | 'video' | 'download'
          title: string
          body: string | null
          media_url: string | null
          thumbnail_url: string | null
          tier: 'free' | 'premium'
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type?: 'post' | 'track' | 'video' | 'download'
          title: string
          body?: string | null
          media_url?: string | null
          thumbnail_url?: string | null
          tier?: 'free' | 'premium'
          is_published?: boolean
        }
        Update: {
          type?: 'post' | 'track' | 'video' | 'download'
          title?: string
          body?: string | null
          media_url?: string | null
          thumbnail_url?: string | null
          tier?: 'free' | 'premium'
          is_published?: boolean
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_public?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          is_public?: boolean
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          content: string
          type: 'text' | 'image' | 'audio' | 'system'
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          content: string
          type?: 'text' | 'image' | 'audio' | 'system'
        }
        Update: {
          content?: string
          type?: 'text' | 'image' | 'audio' | 'system'
        }
        Relationships: []
      }
      polls: {
        Row: {
          id: string
          question: string
          description: string | null
          options: Json
          ends_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          description?: string | null
          options: Json
          ends_at?: string | null
          is_active?: boolean
        }
        Update: {
          question?: string
          description?: string | null
          options?: Json
          ends_at?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string
          user_id: string
          option_index: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          user_id: string
          option_index: number
        }
        Update: never
        Relationships: []
      }
      jukebox_tracks: {
        Row: {
          id: string
          title: string
          artist: string | null
          source_url: string
          source_platform: string
          embed_url: string | null
          thumbnail_url: string | null
          duration_ms: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist?: string | null
          source_url: string
          source_platform?: string
          embed_url?: string | null
          thumbnail_url?: string | null
          duration_ms?: number | null
          is_active?: boolean
        }
        Update: {
          title?: string
          artist?: string | null
          source_url?: string
          source_platform?: string
          embed_url?: string | null
          thumbnail_url?: string | null
          duration_ms?: number | null
          is_active?: boolean
        }
        Relationships: []
      }
      jukebox_queue: {
        Row: {
          id: string
          track_id: string | null
          title: string
          artist: string | null
          source_url: string
          source_platform: string
          embed_url: string | null
          thumbnail_url: string | null
          requested_by: string | null
          requester_name: string | null
          tip_amount: number
          is_priority: boolean
          position: number
          status: 'pending' | 'playing' | 'played' | 'skipped'
          created_at: string
        }
        Insert: {
          id?: string
          track_id?: string | null
          title: string
          artist?: string | null
          source_url: string
          source_platform?: string
          embed_url?: string | null
          thumbnail_url?: string | null
          requested_by?: string | null
          requester_name?: string | null
          tip_amount?: number
          is_priority?: boolean
          position?: number
          status?: 'pending' | 'playing' | 'played' | 'skipped'
        }
        Update: {
          title?: string
          artist?: string | null
          source_url?: string
          source_platform?: string
          embed_url?: string | null
          thumbnail_url?: string | null
          requester_name?: string | null
          tip_amount?: number
          is_priority?: boolean
          position?: number
          status?: 'pending' | 'playing' | 'played' | 'skipped'
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          is_active?: boolean
        }
        Update: {
          email?: string
          name?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
