# rayvermusic — Web oficial Rayver Music

Next.js 16 (App Router, TypeScript) + Supabase + Stripe. Sitio web del DJ Rayver: releases, eventos, comunidad con auth, gramola/jukebox y player de música.

> ⚠️ Next.js 16 tiene cambios de API respecto a versiones anteriores. Consulta `node_modules/next/dist/docs/` ante cualquier duda.

## Stack

- **Framework:** Next.js 16.2.9, React 19, TypeScript
- **DB/Auth/Realtime/Storage:** Supabase (local en puerto 54321)
- **Estilos:** Tailwind CSS v4, shadcn/ui
- **Estado:** Zustand v5
- **Pagos:** Stripe v22 (membresías premium)
- **Deploy:** Docker (`output: standalone`), Nginx

## Dev

```bash
npm run dev           # Puerto 3000 por defecto
```

Supabase local: `npx supabase start`
- API: http://127.0.0.1:54321
- Studio: http://127.0.0.1:54323
- DB: postgresql://postgres:postgres@127.0.0.1:54322/postgres

Migraciones en `supabase/migrations/`:
- `001_initial_schema.sql` — profiles, releases, eventos, chat, votaciones, queue
- `002_music_classification.sql` — BPM, genre, key, tags en releases
- `003_playlists.sql` — sistema de playlists del player

Aplicar SQL manualmente:
```bash
npx supabase db query "SQL aquí"   # una sentencia por llamada
```

## Estructura de rutas

```
src/app/
├── (public)/          # bio, contacto, eventos, musica, servicios
├── (admin)/admin/     # releases, playlists, eventos, contenido, comunidad, gramola
├── (community)/       # chat realtime, exclusivo (premium), votaciones
├── (gramola)/         # jukebox con cola en tiempo real
├── login/, register/, auth/callback/
└── api/
    ├── admin/playlists/
    ├── gramola/resolve/
    ├── player/playlist/
    ├── contacto/
    └── newsletter/
```

## Player de música

**Archivos:**
- `src/lib/player-store.ts` — Zustand store + helpers (`isPlayable`, `getBestPlatform`, `extractYouTubeId`, etc.)
- `src/components/player/PlayerProvider.tsx` — carga playlist default vía `/api/player/playlist?id=default`
- `src/components/player/HybridPlayer.tsx` — motor YouTube (IFrame API) + SoundCloud (Widget API) + barra de controles

**Reglas clave:**
- `isPlayable(track)` = tiene `youtube_url` OR `soundcloud_url` — Spotify y Apple Music son solo links externos, no reproducen
- `next()` salta automáticamente tracks no reproducibles
- `repeat: 'all'` por defecto (reproducción continua)
- Plataformas: YouTube > SoundCloud > Spotify > Apple (prioridad en `getBestPlatform`)

## DB — Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Usuario: `role` (fan/artist/admin), `membership` (free/premium) |
| `releases` | Música: type, title, artist, bpm, genre, tags, urls por plataforma |
| `playlists` / `playlist_tracks` | Playlists del player |

## Variables de entorno (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_PRICE_ID=
NEXT_PUBLIC_APP_URL=https://rayvermusic.com
```

## Git remotes

```
origin  git@github.com:bielet20/rayvermusic-web.git   # rama principal web
djweb   git@github.com:bielet20/DJWEBRAYVER.git        # rama DJ web
```

## Seguridad

CSP configurada en `next.config.ts`: permite iframes de YouTube, Spotify, SoundCloud y Apple Music. No modificar sin revisar los `frame-src`.
