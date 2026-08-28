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
          membership: 'free' | 'pro' | 'artist' | 'label' | 'premium'
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
          membership?: 'free' | 'pro' | 'artist' | 'label' | 'premium'
          stripe_customer_id?: string | null
        }
        Update: {
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'fan' | 'artist' | 'admin'
          membership?: 'free' | 'pro' | 'artist' | 'label' | 'premium'
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
          genre: string | null
          bpm: number | null
          key_musical: string | null
          tags: string[]
          preview_url: string | null
          download_url: string | null
          audio_url: string | null
          label: string | null
          plays_count: number
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
          genre?: string | null
          bpm?: number | null
          key_musical?: string | null
          tags?: string[]
          preview_url?: string | null
          download_url?: string | null
          audio_url?: string | null
          label?: string | null
          plays_count?: number
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
          genre?: string | null
          bpm?: number | null
          key_musical?: string | null
          tags?: string[]
          preview_url?: string | null
          download_url?: string | null
          audio_url?: string | null
          label?: string | null
          plays_count?: number
          is_featured?: boolean
          is_published?: boolean
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          id: string
          name: string
          email: string
          service_type: 'dj_booking' | 'production' | 'remix' | 'mastering' | 'sync' | 'other'
          event_date: string | null
          venue: string | null
          city: string | null
          budget: string | null
          message: string
          status: 'pending' | 'contacted' | 'confirmed' | 'declined'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          service_type: 'dj_booking' | 'production' | 'remix' | 'mastering' | 'sync' | 'other'
          event_date?: string | null
          venue?: string | null
          city?: string | null
          budget?: string | null
          message: string
          status?: 'pending' | 'contacted' | 'confirmed' | 'declined'
        }
        Update: {
          status?: 'pending' | 'contacted' | 'confirmed' | 'declined'
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
      playlists: {
        Row: {
          id: string
          name: string
          description: string | null
          cover_url: string | null
          is_default: boolean
          is_active: boolean
          sort_by: 'custom' | 'newest' | 'featured' | 'plays'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          cover_url?: string | null
          is_default?: boolean
          is_active?: boolean
          sort_by?: 'custom' | 'newest' | 'featured' | 'plays'
        }
        Update: {
          name?: string
          description?: string | null
          cover_url?: string | null
          is_default?: boolean
          is_active?: boolean
          sort_by?: 'custom' | 'newest' | 'featured' | 'plays'
        }
        Relationships: []
      }
      playlist_tracks: {
        Row: {
          id: string
          playlist_id: string
          release_id: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          release_id: string
          position?: number
        }
        Update: {
          position?: number
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          id: string
          user_id: string
          platform: 'spotify' | 'soundcloud' | 'youtube' | 'apple_music'
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          platform_user_id: string | null
          platform_username: string | null
          platform_display_name: string | null
          platform_avatar_url: string | null
          scopes: string[] | null
          connected_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'spotify' | 'soundcloud' | 'youtube' | 'apple_music'
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          platform_user_id?: string | null
          platform_username?: string | null
          platform_display_name?: string | null
          platform_avatar_url?: string | null
          scopes?: string[] | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          platform_user_id?: string | null
          platform_username?: string | null
          platform_display_name?: string | null
          platform_avatar_url?: string | null
          scopes?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          plan: 'free' | 'pro' | 'artist' | 'label'
          status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan?: 'free' | 'pro' | 'artist' | 'label'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          updated_at?: string
        }
        Update: {
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan?: 'free' | 'pro' | 'artist' | 'label'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          cover_url: string | null
          is_public: boolean
          source_platform: 'local' | 'spotify' | 'soundcloud' | 'youtube' | null
          source_id: string | null
          track_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          cover_url?: string | null
          is_public?: boolean
          source_platform?: 'local' | 'spotify' | 'soundcloud' | 'youtube' | null
          source_id?: string | null
          track_count?: number
        }
        Update: {
          name?: string
          description?: string | null
          cover_url?: string | null
          is_public?: boolean
          track_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_playlist_tracks: {
        Row: {
          id: string
          playlist_id: string
          position: number
          title: string
          artist: string | null
          album: string | null
          cover_url: string | null
          duration_ms: number | null
          spotify_id: string | null
          spotify_url: string | null
          youtube_id: string | null
          youtube_url: string | null
          soundcloud_url: string | null
          apple_url: string | null
          release_id: string | null
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          position?: number
          title: string
          artist?: string | null
          album?: string | null
          cover_url?: string | null
          duration_ms?: number | null
          spotify_id?: string | null
          spotify_url?: string | null
          youtube_id?: string | null
          youtube_url?: string | null
          soundcloud_url?: string | null
          apple_url?: string | null
          release_id?: string | null
        }
        Update: {
          position?: number
          title?: string
          artist?: string | null
          cover_url?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_release_plays: {
        Args: { release_id: string }
        Returns: void
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
