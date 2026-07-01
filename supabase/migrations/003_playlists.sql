-- ============================================================
-- Migración 003: Sistema de playlists para el reproductor híbrido
-- ============================================================

CREATE TABLE IF NOT EXISTS public.playlists (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         text NOT NULL,
  description  text,
  cover_url    text,
  is_default   boolean NOT NULL DEFAULT false,
  is_active    boolean NOT NULL DEFAULT true,
  sort_by      text NOT NULL DEFAULT 'custom'
               CHECK (sort_by IN ('custom', 'newest', 'featured', 'plays')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  release_id  uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  position    int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (playlist_id, release_id)
);

CREATE INDEX IF NOT EXISTS playlist_tracks_playlist_idx ON public.playlist_tracks (playlist_id, position);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Playlists activas visibles para todos
CREATE POLICY "Playlists activas visibles" ON public.playlists
  FOR SELECT USING (is_active = true);

CREATE POLICY "Tracks de playlists visibles" ON public.playlist_tracks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND is_active = true)
  );

-- Solo admin puede gestionar
CREATE POLICY "Admin gestiona playlists" ON public.playlists FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'artist'))
);
CREATE POLICY "Admin gestiona playlist_tracks" ON public.playlist_tracks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'artist'))
);

-- Función: sólo una playlist puede ser default
CREATE OR REPLACE FUNCTION public.enforce_single_default_playlist()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.playlists SET is_default = false WHERE id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER single_default_playlist
  BEFORE INSERT OR UPDATE ON public.playlists
  FOR EACH ROW WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.enforce_single_default_playlist();

-- Playlist por defecto inicial: "Recomendados" (tracks se añaden desde el admin)
INSERT INTO public.playlists (name, description, is_default, is_active, sort_by)
VALUES ('Recomendados', 'Selección personal de los mejores tracks', true, true, 'featured')
ON CONFLICT DO NOTHING;
