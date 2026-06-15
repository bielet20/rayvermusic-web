'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Music2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/musica', label: 'Música' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/bio', label: 'Bio' },
  { href: '/comunidad', label: 'Comunidad' },
  { href: '/gramola', label: 'Gramola' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center glow-purple">
            <Music2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Rayver<span className="text-[var(--primary)]">Music</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-[var(--primary)]',
                pathname.startsWith(link.href)
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted-foreground)]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/comunidad"
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity glow-purple"
          >
            <Zap size={14} />
            Únete
          </Link>
          <button
            className="md:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)]">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-[var(--muted)] text-[var(--primary)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/comunidad"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-semibold"
            >
              <Zap size={14} />
              Únete a la comunidad
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
