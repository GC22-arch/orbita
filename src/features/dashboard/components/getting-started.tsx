'use client'

import { CalendarPlus, Check, UserPlus, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, cn } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi, type ModalType } from '@/shared/stores/ui-store'

interface Step {
  done: boolean
  icon: ReactNode
  title: string
  text: string
  cta: string
  modal: ModalType
}

/** Guía para negocios nuevos: desaparece sola cuando ya cargaron lo básico */
export function GettingStarted() {
  const { clients, appointments, payments } = useCrm()
  const { preset } = useBusiness()
  const openModal = useUi((s) => s.openModal)

  const steps: Step[] = [
    {
      done: clients.length > 0,
      icon: <UserPlus size={20} />,
      title: `Carga tus ${preset.client.many.toLowerCase()}`,
      text: 'Con el nombre y el WhatsApp alcanza para empezar.',
      cta: `Agregar ${preset.client.one.toLowerCase()}`,
      modal: 'client',
    },
    {
      done: appointments.length > 0,
      icon: <CalendarPlus size={20} />,
      title: `Agenda tus ${preset.appointment.many.toLowerCase()}`,
      text: 'Y manda el recordatorio por WhatsApp con un toque.',
      cta: `Agendar ${preset.appointment.one.toLowerCase()}`,
      modal: 'appointment',
    },
    {
      done: payments.length > 0,
      icon: <Wallet size={20} />,
      title: 'Registra tus cobros',
      text: 'Así sabes cuánto entró y quién te debe.',
      cta: 'Registrar cobro',
      modal: 'payment',
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  if (doneCount === steps.length) return null
  const nextIndex = steps.findIndex((s) => !s.done)

  return (
    <section className="glass-strong mb-6 animate-rise rounded-4xl p-5 sm:p-6" aria-label="Primeros pasos">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Primeros pasos</h2>
          <p className="text-sm text-muted">Carga lo tuyo y Orbita empieza a trabajar para ti.</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
          {doneCount} de {steps.length}
        </span>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.modal}
            className={cn(
              'flex flex-col gap-3 rounded-3xl p-4 transition',
              step.done ? 'bg-ok/10' : i === nextIndex ? 'bg-accent/10 ring-1 ring-accent/30' : 'bg-ink/5',
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-2xl',
                  step.done ? 'bg-ok text-white' : 'bg-surface text-accent',
                )}
              >
                {step.done ? <Check size={20} /> : step.icon}
              </span>
              <p className={cn('font-semibold', step.done && 'text-muted line-through')}>{step.title}</p>
            </div>
            {!step.done && (
              <>
                <p className="text-sm text-muted">{step.text}</p>
                <Button
                  size="sm"
                  variant={i === nextIndex ? 'primary' : 'soft'}
                  className="mt-auto self-start"
                  onClick={() => openModal(step.modal, step.modal === 'payment' ? { kind: 'ingreso' } : {})}
                >
                  {step.cta}
                </Button>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
