'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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

  const [audioUrl, setAudioUrl] = useState(d.audio_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `releases/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('audio').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('audio').getPublicUrl(path)
      setAudioUrl(data.publicUrl)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir el archivo')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

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

      {/* Audio directo */}
      <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">Audio directo (MP3)</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Sube el MP3 descargado de DistroKid. Tiene prioridad sobre YouTube y SoundCloud en el player.
        </p>

        <input type="hidden" name="audio_url" value={audioUrl} />

        {audioUrl && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
            <audio controls src={audioUrl} className="h-8 flex-1 min-w-0" />
            <button
              type="button"
              onClick={() => setAudioUrl('')}
              className="text-xs text-red-400 hover:text-red-300 flex-shrink-0"
            >
              Quitar
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-wait' : 'hover:border-purple-500'}`}>
            {uploading ? 'Subiendo...' : audioUrl ? 'Cambiar archivo' : 'Subir MP3'}
            <input
              ref={fileRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/aac"
              className="hidden"
              disabled={uploading}
              onChange={handleAudioUpload}
            />
          </label>
          {!audioUrl && (
            <span className="text-xs text-[var(--muted-foreground)]">o pega la URL:</span>
          )}
          {!audioUrl && (
            <input
              type="url"
              value={audioUrl}
              onChange={e => setAudioUrl(e.target.value)}
              placeholder="https://..."
              className={`${field} flex-1`}
            />
          )}
        </div>
        {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
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
