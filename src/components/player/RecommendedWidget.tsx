'use client'

import { useEffect } from 'react'
import { usePlayerStore, getBestPlatform, PLATFORM_LABELS, PLATFORM_COLORS, type PlayerTrack, type PlayerPlatform } from '@/lib/player-store'
import { Play, Pause, Music2, SkipForward, ListMusic } from 'lucide-react'

function MiniTrack({ track, index, isActive, isPlaying, onPlay }: {
  track: PlayerTrack; index: number; isActive: boolean; isPlaying: boolean; onPlay: () => void
}) {
  const best = getBestPlatform(track)
  return (
    <button
      onClick={onPlay}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
        isActive ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className={`w-5 text-center text-xs flex-shrink-0 ${isActive ? 'text-purple-400' : 'text-[var(--muted-foreground)]'}`}>
        {isActive && isPlaying ? (
          <span className="inline-flex gap-0.5 items-end h-3 justify-center">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-0.5 h-full bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        ) : index + 1}
      </span>
      <div className="w-9 h-9 rounded-lg overflow-hidden bg-[var(--muted)] flex-shrink-0">
        {track.cover_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Music2 size={12} className="text-[var(--border)]" /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate leading-tight ${isActive ? 'text-white' : ''}`}>{track.title}</p>
        <p className="text-xs text-[var(--muted-foreground)] truncate">{track.artist}</p>
      </div>
      {best && (
        <span className={`hidden sm:inline px-1.5 py-0.5 rounded text-[10px] border flex-shrink-0 ${PLATFORM_COLORS[best.platform as PlayerPlatform]}`}>
          {PLATFORM_LABELS[best.platform as PlayerPlatform]}
        </span>
      )}
    </button>
  )
}

export default function RecommendedWidget() {
  const { playlist, meta, currentIndex, isPlaying, isLoaded, toggle, next, playTrack, setExpanded } = usePlayerStore()

  if (!isLoaded || !playlist.length) return null

  const current = playlist[currentIndex]
  const visible = playlist.slice(0, 6)

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              {isPlaying ? 'Reproduciendo' : 'Lista de reproducción'}
            </div>
            <h2 className="text-3xl font-black">{meta?.name ?? 'Música recomendada'}</h2>
            {meta?.description && (
              <p className="text-[var(--muted-foreground)] mt-1">{meta.description}</p>
            )}
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] text-sm font-medium hover:bg-[var(--muted)] transition-colors"
          >
            <ListMusic size={14} />
            Ver todo ({playlist.length})
          </button>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Featured track big card */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-[var(--muted)] group">
              {current.cover_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={current.cover_url} alt={current.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><Music2 size={64} className="text-[var(--border)]" /></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-black text-xl text-white leading-tight line-clamp-2">{current.title}</p>
                <p className="text-sm text-white/70 mt-1">{current.artist}</p>
                {current.genre && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-purple-600/80 text-white font-medium">
                    {current.genre}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <button
                  onClick={toggle}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                >
                  {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <SkipForward size={18} />
                </button>
              </div>
            </div>

            {/* Controls below cover */}
            <div className="flex items-center justify-between mt-4 px-1">
              <div>
                <p className="font-bold text-sm line-clamp-1">{current.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{current.artist}</p>
              </div>
              <button
                onClick={toggle}
                className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors flex-shrink-0"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
            </div>
          </div>

          {/* Track list */}
          <div className="lg:col-span-3 flex flex-col gap-1">
            {visible.map((t, i) => (
              <MiniTrack
                key={`${t.id}-${i}`}
                track={t}
                index={i}
                isActive={i === currentIndex}
                isPlaying={isPlaying}
                onPlay={() => playTrack(i)}
              />
            ))}
            {playlist.length > 6 && (
              <button
                onClick={() => setExpanded(true)}
                className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors text-left px-3 flex items-center gap-1.5"
              >
                <ListMusic size={14} />
                +{playlist.length - 6} tracks más en la playlist
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
