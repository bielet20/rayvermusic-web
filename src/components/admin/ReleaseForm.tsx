import type { Database } from '@/types/database'

type Release = Database['public']['Tables']['releases']['Row']

interface ReleaseFormProps {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Release>
  cancelHref?: string
}

export function ReleaseForm({ action, defaultValues: d = {}, cancelHref = '/admin/releases' }: ReleaseFormProps) {
  const field = 'w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-purple-500 transition-colors'
  const label = 'block text-xs font-medium text-[var(--muted-foreground)] mb-1'

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Título *</label>
          <input name="title" required defaultValue={d.title ?? ''} className={field} placeholder="Nombre del release" />
        </div>
        <div>
          <label className={label}>Artista</label>
          <input name="artist" defaultValue={d.artist ?? 'Rayver'} className={field} placeholder="Rayver" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Tipo</label>
          <select name="type" defaultValue={d.type ?? 'track'} className={field}>
            <option value="track">Track</option>
            <option value="ep">EP</option>
            <option value="album">Álbum</option>
            <option value="remix">Remix</option>
          </select>
        </div>
        <div>
          <label className={label}>Fecha de lanzamiento</label>
          <input name="release_date" type="date" defaultValue={d.release_date?.slice(0, 10) ?? ''} className={field} />
        </div>
      </div>

      <div>
        <label className={label}>URL portada</label>
        <input name="cover_url" type="url" defaultValue={d.cover_url ?? ''} className={field} placeholder="https://..." />
      </div>

      <div>
        <label className={label}>Descripción</label>
        <textarea name="description" rows={3} defaultValue={d.description ?? ''} className={field} placeholder="Descripción del release..." />
      </div>

      <div>
        <p className={label}>Links a plataformas</p>
        <div className="space-y-2">
          {[
            { name: 'spotify_url', label: 'Spotify' },
            { name: 'apple_url', label: 'Apple Music' },
            { name: 'youtube_url', label: 'YouTube' },
            { name: 'soundcloud_url', label: 'SoundCloud' },
            { name: 'beatport_url', label: 'Beatport' },
          ].map(p => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)] w-28 flex-shrink-0">{p.label}</span>
              <input
                name={p.name}
                type="url"
                defaultValue={(d[p.name as keyof Release] as string) ?? ''}
                className={field}
                placeholder="https://..."
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_published" defaultChecked={d.is_published ?? false}
            className="w-4 h-4 rounded accent-purple-500" />
          <span className="text-sm">Publicado</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_featured" defaultChecked={d.is_featured ?? false}
            className="w-4 h-4 rounded accent-purple-500" />
          <span className="text-sm">Destacado</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit"
          className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors">
          Guardar
        </button>
        <a href={cancelHref} className="px-5 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
          Cancelar
        </a>
      </div>
    </form>
  )
}
