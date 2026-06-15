import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Lock, FileText, Music, Video, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const TYPE_ICONS = { post: FileText, track: Music, video: Video, download: Download }
const TYPE_LABELS = { post: 'Post', track: 'Track', video: 'Video', download: 'Descarga' }

export default async function ExclusivoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const isPremium = profile?.membership === 'premium' || profile?.role === 'admin' || profile?.role === 'artist'

  const { data: content } = await supabase
    .from('exclusive_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Contenido exclusivo</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Solo para miembros de la comunidad</p>
        </div>
        {!isPremium && (
          <Link href="/premium"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors">
            ⭐ Premium
          </Link>
        )}
      </div>

      {content && content.length > 0 ? (
        <div className="space-y-3">
          {content.map(item => {
            const Icon = TYPE_ICONS[item.type] ?? FileText
            const locked = item.tier === 'premium' && !isPremium
            return (
              <div key={item.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${locked ? 'border-[var(--border)] opacity-70' : 'border-[var(--border)] hover:border-purple-500/40 hover:bg-[var(--muted)]'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${locked ? 'bg-[var(--muted)]' : 'bg-purple-500/15'}`}>
                  {locked ? <Lock size={16} className="text-[var(--muted-foreground)]" /> : <Icon size={16} className="text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    {item.tier === 'premium' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                        Premium
                      </span>
                    )}
                    <span className="text-xs text-[var(--muted-foreground)] capitalize">{TYPE_LABELS[item.type]}</span>
                  </div>
                  {item.body && !locked && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">{item.body}</p>
                  )}
                  {locked && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Hazte Premium para acceder a este contenido</p>
                  )}
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">{formatDate(item.created_at)}</p>
                </div>
                {!locked && item.media_url && (
                  <a href={item.media_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 whitespace-nowrap">
                    Ver →
                  </a>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-2xl">
          <Lock size={40} className="mx-auto mb-3 opacity-30" />
          <p>Próximamente contenido exclusivo</p>
        </div>
      )}
    </div>
  )
}
