-- ============================================================
-- RayverMusic — Schema inicial
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- PERFILES DE USUARIO
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique,
  display_name text,
  avatar_url  text,
  bio         text,
  role        text not null default 'fan' check (role in ('fan', 'artist', 'admin')),
  membership  text not null default 'free' check (membership in ('free', 'premium')),
  stripe_customer_id text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Perfiles visibles para todos" on public.profiles for select using (true);
create policy "Usuario edita su propio perfil" on public.profiles for update using (auth.uid() = id);
create policy "Trigger inserta perfil" on public.profiles for insert with check (auth.uid() = id);

-- Trigger: crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- RELEASES (Tracks, EPs, Álbumes)
-- ============================================================
create table public.releases (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null default 'track' check (type in ('track', 'ep', 'album', 'remix')),
  title       text not null,
  artist      text not null default 'Rayver',
  cover_url   text,
  release_date date,
  description text,
  spotify_url text,
  apple_url   text,
  youtube_url text,
  soundcloud_url text,
  beatport_url text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.releases enable row level security;
create policy "Releases publicados visibles para todos" on public.releases for select using (is_published = true);
create policy "Admin gestiona releases" on public.releases for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'artist'))
);

-- ============================================================
-- EVENTOS
-- ============================================================
create table public.events (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  venue       text,
  city        text,
  country     text default 'España',
  date        timestamptz not null,
  description text,
  ticket_url  text,
  cover_url   text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;
create policy "Eventos publicados visibles para todos" on public.events for select using (is_published = true);
create policy "Admin gestiona eventos" on public.events for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'artist'))
);

-- ============================================================
-- CONTENIDO EXCLUSIVO (posts, tracks, videos para members)
-- ============================================================
create table public.exclusive_content (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null default 'post' check (type in ('post', 'track', 'video', 'download')),
  title       text not null,
  body        text,
  media_url   text,
  thumbnail_url text,
  tier        text not null default 'free' check (tier in ('free', 'premium')),
  is_published boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.exclusive_content enable row level security;
create policy "Contenido free visible para autenticados" on public.exclusive_content
  for select using (
    is_published = true and (
      tier = 'free' or
      exists (select 1 from public.profiles where id = auth.uid() and membership = 'premium') or
      exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'artist'))
    )
  );
create policy "Admin gestiona contenido exclusivo" on public.exclusive_content for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'artist'))
);

-- ============================================================
-- CHAT EN TIEMPO REAL
-- ============================================================
create table public.chat_rooms (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.chat_messages (
  id          uuid primary key default uuid_generate_v4(),
  room_id     uuid not null references public.chat_rooms(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  type        text not null default 'text' check (type in ('text', 'image', 'audio', 'system')),
  created_at  timestamptz not null default now()
);

alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;

create policy "Salas públicas visibles para autenticados" on public.chat_rooms for select using (auth.uid() is not null);
create policy "Mensajes visibles para autenticados" on public.chat_messages for select using (auth.uid() is not null);
create policy "Autenticados pueden enviar mensajes" on public.chat_messages for insert with check (auth.uid() = user_id);
create policy "Usuarios borran sus mensajes" on public.chat_messages for delete using (auth.uid() = user_id);

-- Sala general por defecto
insert into public.chat_rooms (name, description) values ('general', 'Canal principal de la comunidad Rayver');
insert into public.chat_rooms (name, description) values ('off-topic', 'Habla de lo que quieras');

-- ============================================================
-- VOTACIONES / POLLS
-- ============================================================
create table public.polls (
  id          uuid primary key default uuid_generate_v4(),
  question    text not null,
  description text,
  options     jsonb not null default '[]',
  ends_at     timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.poll_votes (
  id          uuid primary key default uuid_generate_v4(),
  poll_id     uuid not null references public.polls(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  option_index int not null,
  created_at  timestamptz not null default now(),
  unique (poll_id, user_id)
);

alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;

create policy "Polls visibles para autenticados" on public.polls for select using (auth.uid() is not null);
create policy "Admin gestiona polls" on public.polls for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'artist'))
);
create policy "Autenticados votan" on public.poll_votes for insert with check (auth.uid() = user_id);
create policy "Votos visibles para autenticados" on public.poll_votes for select using (auth.uid() is not null);

-- ============================================================
-- GRAMOLA / JUKEBOX
-- ============================================================
create table public.jukebox_tracks (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  artist          text,
  source_url      text not null,
  source_platform text not null default 'youtube',
  embed_url       text,
  thumbnail_url   text,
  duration_ms     int,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table public.jukebox_queue (
  id              uuid primary key default uuid_generate_v4(),
  track_id        uuid references public.jukebox_tracks(id) on delete set null,
  title           text not null,
  artist          text,
  source_url      text not null,
  source_platform text not null default 'youtube',
  embed_url       text,
  thumbnail_url   text,
  requested_by    uuid references public.profiles(id) on delete set null,
  requester_name  text,
  tip_amount      numeric(10,2) default 0,
  is_priority     boolean not null default false,
  position        int not null default 0,
  status          text not null default 'pending' check (status in ('pending', 'playing', 'played', 'skipped')),
  created_at      timestamptz not null default now()
);

alter table public.jukebox_tracks enable row level security;
alter table public.jukebox_queue enable row level security;

create policy "Tracks visibles para todos" on public.jukebox_tracks for select using (is_active = true);
create policy "Queue visible para todos" on public.jukebox_queue for select using (true);
create policy "Cualquiera puede añadir a la cola" on public.jukebox_queue for insert with check (true);
create policy "Admin gestiona cola" on public.jukebox_queue for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'artist'))
);
create policy "Admin gestiona tracks" on public.jukebox_tracks for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'artist'))
);

-- ============================================================
-- NEWSLETTER / SUSCRIPTORES
-- ============================================================
create table public.newsletter_subscribers (
  id          uuid primary key default uuid_generate_v4(),
  email       text unique not null,
  name        text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
create policy "Solo admin ve suscriptores" on public.newsletter_subscribers for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'artist'))
);
create policy "Cualquiera puede suscribirse" on public.newsletter_subscribers for insert with check (true);

-- ============================================================
-- REALTIME — habilitar para chat y queue
-- ============================================================
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.jukebox_queue;
