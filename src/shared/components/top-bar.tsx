'use client'

import { Search, Settings } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { useBusiness } from '@/shared/hooks/use-business'
import { useUi } from '@/shared/stores/ui-store'
import { OrbitaLogo } from './aurora-background'
import { ThemeToggle } from './theme-controller'
import { IconButton } from './ui'

export function TopBar() {
  const setSearchOpen = useUi((s) => s.setSearchOpen)
  const { businessName, preset } = useBusiness()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 pb-2 pt-4 sm:px-6 lg:px-8">
      <Link href="/inicio" className="flex items-center gap-2 lg:hidden">
        <OrbitaLogo size={32} />
        <span className="font-display text-lg font-bold">Orbita</span>
      </Link>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="glass ml-auto hidden h-12 w-full max-w-md items-center gap-3 rounded-2xl px-4 text-left text-muted transition hover:text-ink sm:flex lg:ml-0"
      >
        <Search size={18} />
        <span className="flex-1 truncate text-[15px]">Buscar {preset.client.one.toLowerCase()}, teléfono o acción…</span>
        <kbd className="rounded-lg border border-line px-1.5 py-0.5 text-[11px] font-semibold">Ctrl K</kbd>
      </button>

      <div className="glass ml-auto flex items-center gap-0.5 rounded-2xl p-0.5 sm:ml-0 lg:ml-auto">
        <IconButton label="Buscar" onClick={() => setSearchOpen(true)} className="sm:hidden">
          <Search size={20} />
        </IconButton>
        <ThemeToggle />
        <Link href="/ajustes" aria-label="Ajustes" title="Ajustes" className="grid h-11 w-11 place-items-center rounded-2xl text-ink/80 transition hover:bg-ink/5">
          <Settings size={20} />
        </Link>
        <div className="hidden items-center gap-2 pl-1 pr-3 md:flex">
          <span className="text-lg">{preset.emoji}</span>
          <span className="max-w-[160px] truncate text-sm font-semibold">{businessName}</span>
        </div>
      </div>
    </header>
  )
}
