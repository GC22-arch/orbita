'use client'

import { ArrowRight, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useBusiness } from '@/shared/hooks/use-business'
import { normalize } from '@/shared/lib/format'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi, type ModalType } from '@/shared/stores/ui-store'
import { useNavItems } from './nav-dock'
import { Avatar, cn } from './ui'

interface Result {
  key: string
  title: string
  subtitle: string
  avatar?: string
  run: () => void
}

function useResults(query: string): Result[] {
  const clients = useCrm((s) => s.clients)
  const { preset } = useBusiness()
  const nav = useNavItems()
  const router = useRouter()
  const { openClient, openModal, setSearchOpen } = useUi()

  return useMemo(() => {
    const q = normalize(query.trim())
    const close = () => setSearchOpen(false)
    const actions: { label: string; type: ModalType }[] = [
      { label: `Nuevo ${preset.appointment.one.toLowerCase()}`, type: 'appointment' },
      { label: `Nuevo ${preset.client.one.toLowerCase()}`, type: 'client' },
      { label: 'Registrar cobro', type: 'payment' },
    ]
    const clientResults: Result[] = clients
      .filter((c) => !q || normalize([c.name, c.phone, ...Object.values(c.customFields)].join(' ')).includes(q))
      .slice(0, q ? 8 : 4)
      .map((c) => ({ key: c.id, title: c.name, subtitle: c.phone, avatar: c.name, run: () => openClient(c.id) }))
    const actionResults: Result[] = actions
      .filter((a) => !q || normalize(a.label).includes(q))
      .map((a) => ({ key: a.type, title: a.label, subtitle: 'Acción rápida', run: () => openModal(a.type) }))
    const navResults: Result[] = nav
      .filter((n) => !q || normalize(n.label).includes(q))
      .map((n) => ({ key: n.href, title: `Ir a ${n.label}`, subtitle: 'Sección', run: () => (router.push(n.href), close()) }))
    return [...clientResults, ...actionResults, ...navResults]
  }, [query, clients, preset, nav, router, openClient, openModal, setSearchOpen])
}

export function CommandSearch() {
  const open = useUi((s) => s.searchOpen)
  const setOpen = useUi((s) => s.setSearchOpen)
  if (!open) return null
  return <CommandPanel onClose={() => setOpen(false)} />
}

function CommandPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const results = useResults(query)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowDown') setActive((i) => Math.min(i + 1, results.length - 1))
    if (e.key === 'ArrowUp') setActive((i) => Math.max(i - 1, 0))
    if (e.key === 'Enter') results[active]?.run()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-strong relative w-full max-w-xl animate-rise overflow-hidden rounded-4xl">
        <div className="flex items-center gap-3 border-b border-line/60 px-5">
          <Search size={20} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => (setQuery(e.target.value), setActive(0))}
            placeholder="Escribe un nombre, teléfono o lo que quieras hacer…"
            className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-muted/70"
          />
        </div>
        <ul className="scroll-thin max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-4 py-10 text-center text-muted">No encontramos nada con “{query}”.</li>}
          {results.map((r, i) => (
            <li key={r.key}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={r.run}
                className={cn('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition', i === active && 'bg-accent/10')}
              >
                {r.avatar ? (
                  <Avatar name={r.avatar} size="sm" />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink/5 text-muted">
                    <ArrowRight size={16} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{r.title}</span>
                  <span className="block truncate text-sm text-muted">{r.subtitle}</span>
                </span>
                {i === active && <kbd className="text-xs text-muted">Enter</kbd>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
