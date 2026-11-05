'use client'

import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { WhatsappButton } from '@/shared/components/whatsapp-button'
import { Badge, Button, IconButton, PageHeader, Segmented, cn } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { useWhatsapp } from '@/shared/hooks/use-whatsapp'
import { addDays, formatDate, formatTime, isSameDay, startOfDay } from '@/shared/lib/format'
import { appointmentsOn } from '@/shared/lib/insights'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'
import type { Appointment } from '@/shared/types/crm'
import { STATUS_META } from './status-meta'

const HOUR_PX = 72
const START_HOUR = 8
const END_HOUR = 21

const ACCENT_BG: Record<string, string> = {
  violeta: 'border-violet-500 bg-violet-500/10',
  azul: 'border-blue-500 bg-blue-500/10',
  cian: 'border-cyan-500 bg-cyan-500/10',
  esmeralda: 'border-emerald-500 bg-emerald-500/10',
  ambar: 'border-amber-500 bg-amber-500/10',
  coral: 'border-rose-500 bg-rose-500/10',
}

function weekStart(date: Date): Date {
  const d = startOfDay(date)
  const dow = (d.getDay() + 6) % 7 // lunes = 0
  return addDays(d, -dow)
}

export function AgendaView() {
  const appointments = useCrm((s) => s.appointments)
  const openModal = useUi((s) => s.openModal)
  const { preset } = useBusiness()
  const [selected, setSelected] = useState(() => startOfDay(new Date()))
  const [mode, setMode] = useState<'dia' | 'semana'>('dia')

  useEffect(() => {
    if (window.matchMedia('(min-width: 1280px)').matches) setMode('semana')
  }, [])

  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart(selected), i)), [selected])
  const days = mode === 'semana' ? week : [selected]
  const shift = (n: number) => setSelected(addDays(selected, mode === 'semana' ? n * 7 : n))

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle={formatDate(selected.toISOString(), { month: 'long', year: 'numeric' }).replace(/^./, (c) => c.toUpperCase())}
        actions={
          <>
            <Segmented value={mode} onChange={setMode} className="glass" options={[{ value: 'dia', label: 'Día' }, { value: 'semana', label: 'Semana' }]} />
            <Button icon={<CalendarPlus size={18} />} onClick={() => openModal('appointment', { start: atHour(selected, 10) })}>
              Nuevo {preset.appointment.one.toLowerCase()}
            </Button>
          </>
        }
      />

      <div className="glass mb-5 flex items-center gap-1 rounded-3xl p-2">
        <IconButton label="Anterior" onClick={() => shift(-1)}><ChevronLeft size={20} /></IconButton>
        <div className="grid flex-1 grid-cols-7 gap-1">
          {week.map((d) => {
            const count = appointmentsOn(appointments, d).filter((a) => a.status !== 'cancelado').length
            const isSel = mode === 'dia' ? isSameDay(d, selected) : true
            const isToday = isSameDay(d, new Date())
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => (setSelected(d), setMode('dia'))}
                className={cn('flex flex-col items-center rounded-2xl py-2 transition', mode === 'dia' && isSel ? 'bg-gradient-accent text-white shadow-glow' : 'hover:bg-ink/5')}
              >
                <span className={cn('text-[11px] font-semibold uppercase', !(mode === 'dia' && isSel) && 'text-muted')}>{formatDate(d.toISOString(), { weekday: 'short' }).replace('.', '')}</span>
                <span className={cn('font-display text-lg font-bold', isToday && !(mode === 'dia' && isSel) && 'text-accent')}>{d.getDate()}</span>
                <span className="flex h-1.5 gap-0.5">
                  {Array.from({ length: Math.min(count, 4) }, (_, i) => (
                    <span key={i} className={cn('h-1.5 w-1.5 rounded-full', mode === 'dia' && isSel ? 'bg-white/80' : 'bg-accent/60')} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
        <IconButton label="Siguiente" onClick={() => shift(1)}><ChevronRight size={20} /></IconButton>
      </div>

      {!week.some((d) => isSameDay(d, new Date())) && (
        <button type="button" onClick={() => setSelected(startOfDay(new Date()))} className="mb-4 text-sm font-semibold text-accent">← Volver a hoy</button>
      )}

      <Timeline days={days} />
    </div>
  )
}

function atHour(day: Date, hour: number, minutes = 0): string {
  const d = new Date(day)
  d.setHours(hour, minutes, 0, 0)
  return d.toISOString()
}

function Timeline({ days }: { days: Date[] }) {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
  const multi = days.length > 1
  return (
    <div className="glass overflow-hidden rounded-4xl">
      {multi && (
        <div className="grid border-b border-line/60 pl-14" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((d) => (
            <div key={d.toISOString()} className={cn('py-3 text-center text-sm font-semibold', isSameDay(d, new Date()) ? 'text-accent' : 'text-muted')}>
              {formatDate(d.toISOString(), { weekday: 'short', day: 'numeric' })}
            </div>
          ))}
        </div>
      )}
      <div className="scroll-thin relative max-h-[68vh] overflow-y-auto">
        <div className="relative flex" style={{ height: hours.length * HOUR_PX }}>
          <div className="w-14 shrink-0">
            {hours.map((h) => (
              <div key={h} style={{ height: HOUR_PX }} className="pr-2 pt-1 text-right text-xs font-semibold text-muted">{`${h}:00`}</div>
            ))}
          </div>
          <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map((d) => (
              <DayColumn key={d.toISOString()} day={d} hours={hours} compact={multi} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DayColumn({ day, hours, compact }: { day: Date; hours: number[]; compact: boolean }) {
  const appointments = useCrm((s) => s.appointments)
  const openModal = useUi((s) => s.openModal)
  const list = appointmentsOn(appointments, day).filter((a) => a.status !== 'cancelado')
  const isToday = isSameDay(day, new Date())
  const now = new Date()
  const nowTop = ((now.getHours() - START_HOUR) * 60 + now.getMinutes()) * (HOUR_PX / 60)

  return (
    <div className="relative border-l border-line/50">
      {hours.map((h) => (
        <button
          key={h}
          type="button"
          aria-label={`Agendar a las ${h}:00`}
          onClick={() => openModal('appointment', { start: atHour(day, h) })}
          style={{ height: HOUR_PX }}
          className="group block w-full border-t border-line/40 text-left transition hover:bg-accent/5"
        >
          <span className="hidden pl-2 text-xs font-semibold text-accent group-hover:inline">+ Agendar</span>
        </button>
      ))}
      {isToday && nowTop > 0 && nowTop < hours.length * HOUR_PX && (
        <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: nowTop }}>
          <span className="-ml-1.5 h-3 w-3 rounded-full bg-bad shadow-[0_0_12px_rgb(var(--bad))]" />
          <span className="h-0.5 flex-1 bg-bad/70" />
        </div>
      )}
      {list.map((a) => (
        <AppointmentBlock key={a.id} appt={a} compact={compact} />
      ))}
    </div>
  )
}

function AppointmentBlock({ appt, compact }: { appt: Appointment; compact: boolean }) {
  const { clients, services } = useCrm()
  const openModal = useUi((s) => s.openModal)
  const wa = useWhatsapp()
  const client = clients.find((c) => c.id === appt.clientId)
  const service = services.find((s) => s.id === appt.serviceId)
  const start = new Date(appt.start)
  const top = ((start.getHours() - START_HOUR) * 60 + start.getMinutes()) * (HOUR_PX / 60)
  const height = Math.max(32, appt.durationMin * (HOUR_PX / 60) - 4)
  const meta = STATUS_META[appt.status]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openModal('appointment', { id: appt.id })}
      onKeyDown={(e) => e.key === 'Enter' && openModal('appointment', { id: appt.id })}
      style={{ top: top + 2, height }}
      className={cn(
        'absolute inset-x-1 z-[5] flex animate-pop cursor-pointer gap-2 overflow-hidden rounded-2xl border-l-4 px-2.5 py-1.5 backdrop-blur-md transition hover:z-20 hover:scale-[1.02] hover:shadow-float',
        ACCENT_BG[service?.color ?? 'violeta'],
        (appt.status === 'ausente' || appt.status === 'asistio') && 'opacity-60',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{client?.name ?? '—'}</p>
        {height > 44 && (
          <p className="truncate text-xs text-muted">
            {formatTime(appt.start)} · {service?.name ?? ''}
          </p>
        )}
        {height > 64 && !compact && <Badge tone={meta.tone} className="mt-1 px-2 py-0.5 text-[11px]">{meta.label}</Badge>}
      </div>
      {!compact && client && height > 44 && appt.status !== 'asistio' && (
        <WhatsappButton href={wa.reminder(client, appt)} compact label="Enviar recordatorio" className="h-8 w-8 rounded-xl" />
      )}
    </div>
  )
}
