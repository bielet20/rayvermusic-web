import type { Database } from '@/types/database'

type Contenido = Database['public']['Tables']['exclusive_content']['Row']

interface ContenidoFormProps {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Contenido>
  cancelHref?: string
}

export function ContenidoForm({ action, defaultValues: d = {}, cancelHref = '/admin/contenido' }: ContenidoFormProps) {
  const field = 'w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-pink-500 transition-colors'
  const label = 'block text-xs font-medium text-[var(--muted-foreground)] mb-1'

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className={label}>Título *</label>
        <input name="title" required defaultValue={d.title ?? ''} className={field} placeholder="Nombre del contenido" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Tipo</label>
          <select name="type" defaultValue={d.type ?? 'post'} className={field}>
            <option value="post">Post</option>
            <option value="track">Track</option>
            <option value="video">Vídeo</option>
            <option value="download">Descarga</option>
          </select>
        </div>
        <div>
          <label className={label}>Nivel de acceso</label>
          <select name="tier" defaultValue={d.tier ?? 'free'} className={field}>
            <option value="free">Free — todos los miembros</option>
            <option value="premium">⭐ Premium — solo premium</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Cuerpo / texto</label>
        <textarea name="body" rows={6} defaultValue={d.body ?? ''} className={field} placeholder="Contenido del post, descripción, letra..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>URL media (audio/vídeo)</label>
          <input name="media_url" type="url" defaultValue={d.media_url ?? ''} className={field} placeholder="https://..." />
        </div>
        <div>
          <label className={label}>URL miniatura</label>
          <input name="thumbnail_url" type="url" defaultValue={d.thumbnail_url ?? ''} className={field} placeholder="https://..." />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_published" defaultChecked={d.is_published ?? false}
            className="w-4 h-4 rounded accent-pink-500" />
          <span className="text-sm">Publicado</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit"
          className="px-5 py-2 rounded-xl bg-pink-600 text-white text-sm font-semibold hover:bg-pink-500 transition-colors">
          Guardar
        </button>
        <a href={cancelHref} className="px-5 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
          Cancelar
        </a>
      </div>
    </form>
  )
}
