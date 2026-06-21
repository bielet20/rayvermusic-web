import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CanceladoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-400" />
        </div>
        <h1 className="text-3xl font-black mb-3">Pago cancelado</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          No se ha realizado ningún cargo. Puedes volver al catálogo cuando quieras.
        </p>
        <Link
          href="/beats"
          className="px-6 py-3 rounded-full bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Volver a los beats
        </Link>
      </div>
    </div>
  )
}
