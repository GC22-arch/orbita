'use client'

import { CalendarPlus, HandCoins, Plus, UserPlus, Wrench, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBusiness } from '@/shared/hooks/use-business'
import { useUi, type ModalType } from '@/shared/stores/ui-store'
import { cn } from './ui'

interface QuickAction {
  type: ModalType
  label: string
  icon: LucideIcon
}

/** Orbe flotante con las acciones más usadas, siempre a un toque */
export function QuickActions() {
  const [open, setOpen] = useState(false)
  const openModal = useUi((s) => s.openModal)
  const { preset } = useBusiness()

  const actions: QuickAction[] = [
    { type: 'appointment', label: `Nuevo ${preset.appointment.one.toLowerCase()}`, icon: CalendarPlus },
    { type: 'client', label: `Nuevo ${preset.client.one.toLowerCase()}`, icon: UserPlus },
    { type: 'payment', label: 'Registrar cobro', icon: HandCoins },
    ...(preset.modules.includes('trabajos') ? [{ type: 'workorder' as const, label: 'Nueva orden', icon: Wrench }] : []),
  ]

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-bg/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 sm:right-6 lg:bottom-6">
        {open &&
          actions.map(({ type, label, icon: Icon }, i) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setOpen(false)
                openModal(type)
              }}
              style={{ animationDelay: `${(actions.length - i - 1) * 40}ms` }}
              className="glass-strong flex animate-rise items-center gap-3 rounded-2xl py-2 pl-4 pr-2 text-[15px] font-semibold transition hover:-translate-x-1"
            >
              {label}
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon size={20} />
              </span>
            </button>
          ))}
        <button
          type="button"
          aria-label={open ? 'Cerrar acciones rápidas' : 'Acciones rápidas'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="group relative grid h-16 w-16 place-items-center rounded-full bg-gradient-accent text-white shadow-glow transition hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/30 [animation-duration:3s]" />
          <Plus size={30} strokeWidth={2.5} className={cn('relative transition duration-300', open && 'rotate-[135deg]')} />
        </button>
      </div>
    </>
  )
}
