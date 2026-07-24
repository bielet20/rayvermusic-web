import Link from 'next/link'
import { CheckCircle2, Mail, Music2 } from 'lucide-react'

export default function ExitoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-400" />
        </div>

        <h1 className="text-3xl font-black mb-3">¡Pago completado!</h1>
        <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
          Gracias por tu compra. Recibirás el archivo en tu email en{' '}
          <strong className="text-[var(--foreground)]">menos de 24 horas</strong>.
        </p>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 mb-8 text-left space-y-3">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-[var(--primary)] mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Revisa tu email</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                Te hemos enviado la confirmación. Si no aparece, revisa spam.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Music2 size={18} className="text-[var(--primary)] mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Entrega en &lt; 24 h</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                RAYVER te enviará el beat en el formato de tu licencia.
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/beats"
            className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-semibold hover:border-purple-500/40 transition-colors"
          >
            Ver más beats
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
