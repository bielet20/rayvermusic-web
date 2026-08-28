-- 005_freemium.sql — Freemium tier expansion + platform connections

-- 1. Expand membership to 4 tiers
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_membership_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_membership_check
  CHECK (membership IN ('free', 'premium', 'pro', 'artist', 'label'));

-- 2. Platform OAuth connections (Spotify, SoundCloud, YouTube, Apple Music)
CREATE TABLE public.platform_connections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform       text NOT NULL CHECK (platform IN ('spotify', 'soundcloud', 'youtube', 'apple_music')),
  access_token   text,
  refresh_token  text,
  token_expires_at timestamptz,
  platform_user_id     text,
  platform_username    text,
  platform_display_name text,
  platform_avatar_url  text,
  scopes         text[],
  connected_at   timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connections" ON public.platform_connections
  FOR ALL USING (auth.uid() = user_id);

-- 3. Stripe subscription tracking
CREATE TABLE public.subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id       text,
  plan                  text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'artist', 'label')),
  status                text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean DEFAULT false,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 4. User-created playlists (separate from admin playlists table)
CREATE TABLE public.user_playlists (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  cover_url       text,
  is_public       boolean DEFAULT false,
  source_platform text CHECK (source_platform IN ('local', 'spotify', 'soundcloud', 'youtube')),
  source_id       text,
  track_count     integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own playlists" ON public.user_playlists
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public playlists visible to all" ON public.user_playlists
  FOR SELECT USING (is_public = true);

-- 5. User playlist tracks (platform-agnostic — any source)
CREATE TABLE public.user_playlist_tracks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES public.user_playlists(id) ON DELETE CASCADE,
  position    integer NOT NULL DEFAULT 0,
  title       text NOT NULL,
  artist      text,
  album       text,
  cover_url   text,
  duration_ms integer,
  spotify_id  text,
  spotify_url text,
  youtube_id  text,
  youtube_url text,
  soundcloud_url text,
  apple_url   text,
  release_id  uuid REFERENCES public.releases(id),
  added_at    timestamptz DEFAULT now()
);

ALTER TABLE public.user_playlist_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User manages tracks in own playlists" ON public.user_playlist_tracks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_playlists WHERE id = playlist_id AND user_id = auth.uid())
  );
CREATE POLICY "Public playlist tracks visible" ON public.user_playlist_tracks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_playlists WHERE id = playlist_id AND is_public = true)
  );
