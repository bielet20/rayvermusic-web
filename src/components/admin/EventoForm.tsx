import type { Database } from '@/types/database'

type Evento = Database['public']['Tables']['events']['Row']

interface EventoFormProps {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Evento>
  cancelHref?: string
}

export function EventoForm({ action, defaultValues: d = {}, cancelHref = '/admin/eventos' }: EventoFormProps) {
  const field = 'w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-green-500 transition-colors'
  const label = 'block text-xs font-medium text-[var(--muted-foreground)] mb-1'

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className={label}>Nombre del evento *</label>
        <input name="title" required defaultValue={d.title ?? ''} className={field} placeholder="Ej: Club Session @ Fabric" />
      </div>

      <div>
        <label className={label}>Fecha y hora *</label>
        <input name="date" type="datetime-local" required
          defaultValue={d.date ? d.date.slice(0, 16) : ''}
          className={field} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={label}>Local / Club</label>
          <input name="venue" defaultValue={d.venue ?? ''} className={field} placeholder="Fabric" />
        </div>
        <div>
          <label className={label}>Ciudad</label>
          <input name="city" defaultValue={d.city ?? ''} className={field} placeholder="Londres" />
        </div>
        <div>
          <label className={label}>País</label>
          <input name="country" defaultValue={d.country ?? ''} className={field} placeholder="UK" />
        </div>
      </div>

      <div>
        <label className={label}>Descripción</label>
        <textarea name="description" rows={3} defaultValue={d.description ?? ''} className={field} placeholder="Info del evento..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>URL entradas</label>
          <input name="ticket_url" type="url" defaultValue={d.ticket_url ?? ''} className={field} placeholder="https://ra.co/..." />
        </div>
        <div>
          <label className={label}>URL portada</label>
          <input name="cover_url" type="url" defaultValue={d.cover_url ?? ''} className={field} placeholder="https://..." />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_published" defaultChecked={d.is_published ?? false}
            className="w-4 h-4 rounded accent-green-500" />
          <span className="text-sm">Publicado</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_featured" defaultChecked={d.is_featured ?? false}
            className="w-4 h-4 rounded accent-green-500" />
          <span className="text-sm">Destacado</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit"
          className="px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-colors">
          Guardar
        </button>
        <a href={cancelHref} className="px-5 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
          Cancelar
        </a>
      </div>
    </form>
  )
}
