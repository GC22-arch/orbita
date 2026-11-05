'use client'

import { CalendarDays, LayoutGrid, Layers, Settings, Users, Wallet, Wrench, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBusiness } from '@/shared/hooks/use-business'
import type { ModuleKey } from '@/shared/types/crm'
import { OrbitaLogo } from './aurora-background'
import { cn } from './ui'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  module?: ModuleKey
}

export function useNavItems(): NavItem[] {
  const { preset } = useBusiness()
  const items: NavItem[] = [
    { href: '/inicio', label: 'Inicio', icon: LayoutGrid },
    { href: '/agenda', label: 'Agenda', icon: CalendarDays, module: 'agenda' },
    { href: '/clientes', label: preset.client.many, icon: Users, module: 'clientes' },
    { href: '/trabajos', label: 'Trabajos', icon: Wrench, module: 'trabajos' },
    { href: '/caja', label: 'Caja', icon: Wallet, module: 'caja' },
    { href: '/planes', label: 'Planes', icon: Layers, module: 'planes' },
    { href: '/ajustes', label: 'Ajustes', icon: Settings },
  ]
  return items.filter((i) => !i.module || preset.modules.includes(i.module))
}

/** Barra lateral flotante (escritorio) */
export function SideDock() {
  const items = useNavItems()
  const pathname = usePathname()
  return (
    <nav className="glass fixed bottom-4 left-4 top-4 z-30 hidden w-[92px] flex-col items-center gap-1 rounded-4xl py-5 lg:flex">
      <Link href="/inicio" className="mb-4 transition hover:scale-105" aria-label="Orbita inicio">
        <OrbitaLogo size={40} />
      </Link>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'group relative flex w-[76px] flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold transition',
              active ? 'text-accent' : 'text-muted hover:text-ink',
            )}
          >
            {active && <span className="absolute inset-0 -z-10 rounded-2xl bg-accent/10 animate-pop" />}
            <Icon size={22} strokeWidth={active ? 2.4 : 2} className="transition group-hover:scale-110" />
            <span className="max-w-full truncate px-1">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/** Barra inferior flotante (celular y tablet) */
export function BottomDock() {
  const items = useNavItems().filter((i) => i.href !== '/ajustes' && i.href !== '/planes')
  const pathname = usePathname()
  return (
    <nav className="glass-strong fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-3xl px-1 py-1.5 lg:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-semibold transition',
              active ? 'bg-accent/10 text-accent' : 'text-muted',
            )}
          >
            <Icon size={21} strokeWidth={active ? 2.4 : 2} />
            <span className="max-w-full truncate px-0.5">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
