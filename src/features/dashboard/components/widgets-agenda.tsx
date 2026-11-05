'use client'

import { Check, Clock, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { STATUS_META } from '@/features/agenda/components/status-meta'
import { WhatsappButton } from '@/shared/components/whatsapp-button'
import { Avatar, Badge, Button, cn } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { useWhatsapp } from '@/shared/hooks/use-whatsapp'
import { formatDate, formatTime, isSameDay } from '@/shared/lib/format'
import { appointmentsOn, nextAppointment } from '@/shared/lib/insights'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'

function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

function countdown(startIso: string, now: number): string {
  const mins = Math.round((new Date(startIso).getTime() - now) / 60_000)
  if (mins <= 0) return 'Ahora'
  if (mins < 60) return `en ${mins} min`
  const h = Math.floor(mins / 60)
  if (h < 24) return `en ${h} h ${mins % 60 ? `${mins % 60} min` : ''}`.trim()
  return `en ${Math.round(h / 24)} días`
}

export function NextUpWidget() {
  const { appointments, clients, services, markAttended } = useCrm()
  const { openClient, openModal, notify } = useUi()
  const { preset } = useBusiness()
  const wa = useWhatsapp()
  const now = useNow()
  const next = nextAppointment(appointments)
  const client = clients.find((c) => c.id === next?.clientId)

  if (!next || !client) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="font-display text-2xl font-bold">Agenda libre ✨</p>
        <p className="text-white/80">No tienes {preset.appointment.many.toLowerCase()} próximos.</p>
        <button type="button" onClick={() => openModal('appointment')} className="rounded-2xl bg-white/20 px-4 py-2.5 font-semibold transition hover:bg-white/30">
          Agendar uno
        </button>
      </div>
    )
  }
  const service = services.find((s) => s.id === next.serviceId)
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-5xl font-bold tracking-tight">{formatTime(next.start)}</p>
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">{countdown(next.start, now)}</span>
      </div>
      {!isSameDay(next.start, new Date()) && <p className="text-white/75">{formatDate(next.start, { weekday: 'long', day: 'numeric' })}</p>}
      <button type="button" onClick={() => openClient(client.id)} className="mt-4 flex w-full items-center gap-3 rounded-3xl bg-white/15 p-3 text-left transition hover:bg-white/25">
        <Avatar name={client.name} />
        <span className="min-w-0">
          <span className="block truncate text-lg font-semibold">{client.name}</span>
          <span className="block truncate text-white/75">{service?.name ?? preset.appointment.one}</span>
        </span>
      </button>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => (markAttended(next.id), notify('¡Listo! Marcado como que vino'))}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-slate-900 transition hover:bg-white/90"
        >
          <Check size={18} /> Llegó
        </button>
        <WhatsappButton href={wa.reminder(client, next)} compact label="Recordar por WhatsApp" className="h-11 w-11 bg-white/20 text-white hover:bg-white/30 dark:text-white" />
      </div>
    </div>
  )
}

export function TodayWidget() {
  const { appointments, clients, services, update, markAttended } = useCrm()
  const { openClient, openModal } = useUi()
  const { preset } = useBusiness()
  const today = appointmentsOn(appointments, new Date()).filter((a) => a.status !== 'cancelado')

  if (!today.length) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted">Hoy no hay {preset.appointment.many.toLowerCase()}.</p>
        <Button variant="soft" size="sm" className="mt-3" onClick={() => openModal('appointment')}>Agendar</Button>
      </div>
    )
  }
  return (
    <ul className="scroll-thin -mx-2 max-h-[320px] space-y-1 overflow-y-auto px-2">
      {today.map((a) => {
        const client = clients.find((c) => c.id === a.clientId)
        const done = a.status === 'asistio' || a.status === 'ausente'
        return (
          <li key={a.id} className={cn('flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-ink/[0.04]', done && 'opacity-60')}>
            <span className="w-12 font-display text-sm font-bold tabular-nums">{formatTime(a.start)}</span>
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => client && openClient(client.id)}>
              <span className="block truncate font-semibold">{client?.name ?? '—'}</span>
              <span className="block truncate text-sm text-muted">{services.find((s) => s.id === a.serviceId)?.name}</span>
            </button>
            {done ? (
              <Badge tone={STATUS_META[a.status].tone}>{STATUS_META[a.status].label}</Badge>
            ) : (
              <span className="flex gap-1">
                <button type="button" aria-label="Vino" title="Vino" onClick={() => markAttended(a.id)} className="grid h-9 w-9 place-items-center rounded-xl bg-ok/10 text-ok transition hover:bg-ok/20">
                  <Check size={17} />
                </button>
                <button type="button" aria-label="No vino" title="No vino" onClick={() => update('appointments', a.id, { status: 'ausente' })} className="grid h-9 w-9 place-items-center rounded-xl bg-bad/10 text-bad transition hover:bg-bad/20">
                  <X size={17} />
                </button>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function TodayCount() {
  const appointments = useCrm((s) => s.appointments)
  const n = appointmentsOn(appointments, new Date()).filter((a) => a.status !== 'cancelado').length
  return (
    <span className="flex items-center gap-1 text-sm font-semibold text-muted">
      <Clock size={14} /> {n}
    </span>
  )
}
