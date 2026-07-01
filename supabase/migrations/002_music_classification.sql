-- ============================================================
-- Migración 002: Clasificación musical avanzada + búsqueda
-- ============================================================

-- Campos adicionales en releases
ALTER TABLE public.releases
  ADD COLUMN IF NOT EXISTS genre        text,
  ADD COLUMN IF NOT EXISTS bpm          smallint,
  ADD COLUMN IF NOT EXISTS key_musical  text,
  ADD COLUMN IF NOT EXISTS tags         text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preview_url  text,
  ADD COLUMN IF NOT EXISTS download_url text,
  ADD COLUMN IF NOT EXISTS label        text,
  ADD COLUMN IF NOT EXISTS plays_count  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Índice GIN para búsqueda full-text
CREATE INDEX IF NOT EXISTS releases_search_idx
  ON public.releases USING gin(search_vector);

-- Índices para filtros frecuentes
CREATE INDEX IF NOT EXISTS releases_genre_idx    ON public.releases (genre) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS releases_type_idx     ON public.releases (type) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS releases_date_idx     ON public.releases (release_date DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS releases_featured_idx ON public.releases (is_featured) WHERE is_published = true;

-- Función que recalcula el vector de búsqueda
CREATE OR REPLACE FUNCTION public.update_release_search()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(NEW.artist, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(NEW.genre, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(NEW.label, '')), 'C') ||
    setweight(to_tsvector('spanish', coalesce(NEW.description, '')), 'D');
  RETURN NEW;
END;
$$;

-- Trigger para mantener el vector actualizado
DROP TRIGGER IF EXISTS releases_search_update ON public.releases;
CREATE TRIGGER releases_search_update
  BEFORE INSERT OR UPDATE ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.update_release_search();

-- Poblar vectors existentes en filas ya creadas
UPDATE public.releases SET title = title WHERE search_vector IS NULL;

-- Función segura para incrementar plays (callable desde cliente)
CREATE OR REPLACE FUNCTION public.increment_release_plays(release_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.releases
  SET plays_count = plays_count + 1
  WHERE id = release_id AND is_published = true;
$$;

-- Permitir que cualquiera llame a la función de plays
GRANT EXECUTE ON FUNCTION public.increment_release_plays(uuid) TO anon, authenticated;

-- ============================================================
-- Servicios / Booking requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text NOT NULL,
  email         text NOT NULL,
  service_type  text NOT NULL CHECK (service_type IN ('dj_booking', 'production', 'remix', 'mastering', 'sync', 'other')),
  event_date    date,
  venue         text,
  city          text,
  budget        text,
  message       text NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'declined')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede enviar booking" ON public.booking_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Solo admin ve bookings" ON public.booking_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'artist'))
  );

CREATE POLICY "Admin actualiza bookings" ON public.booking_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'artist'))
  );
