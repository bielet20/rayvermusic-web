-- Columna audio_url en releases para reproducción directa (MP3 en Supabase Storage)
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS audio_url text;
