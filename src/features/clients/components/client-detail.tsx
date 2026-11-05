'use client'

import { CalendarPlus, Cake, HandCoins, Pencil, Phone, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { STATUS_META } from '@/features/agenda/components/status-meta'
import { WhatsappButton } from '@/shared/components/whatsapp-button'
import { Avatar, Badge, Button, IconButton, Segmented } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { useWhatsapp } from '@/shared/hooks/use-whatsapp'
import { formatDate, formatTime } from '@/shared/lib/format'
import { clientHistory, membershipState } from '@/shared/lib/insights'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'

type Tab = 'turnos' | 'pagos' | 'trabajos'

export function ClientDetail() {
  const id = useUi((s) => s.detailClientId)
  const openClient = useUi((s) => s.openClient)
  const client = useCrm((s) => s.clients.find((c) => c.id === id))

  useEffect(() => {
    if (!id) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && openClient(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [id, openClient])

  if (!id || !client) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-label={client.name}>
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => openClient(null)} />
      <aside className="glass-strong scroll-thin relative h-full w-full max-w-md animate-rise overflow-y-auto p-6 sm:m-3 sm:h-[calc(100%-1.5rem)] sm:rounded-4xl">
        <DetailBody clientId={client.id} />
      </aside>
    </div>
  )
}

function DetailBody({ clientId }: { clientId: string }) {
  const data = useCrm()
  const { openModal, openClient, notify } = useUi()
  const { preset, money } = useBusiness()
  const wa = useWhatsapp()
  const [tab, setTab] = useState<Tab>('turnos')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const client = data.clients.find((c) => c.id === clientId)!
  const history = useMemo(() => clientHistory(data, clientId), [data, clientId])
  const debt = history.payments.filter((p) => p.kind === 'ingreso' && !p.paid).reduce((a, p) => a + p.amount, 0)
  const totalPaid = history.payments.filter((p) => p.kind === 'ingreso' && p.paid).reduce((a, p) => a + p.amount, 0)

  const settleDebt = () => {
    history.payments.filter((p) => !p.paid).forEach((p) => data.update('payments', p.id, { paid: true, date: new Date().toISOString() }))
    notify('Deuda saldada')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <Avatar name={client.name} size="lg" />
        <div className="min-w-0 flex-1 pt-1">
          <h2 className="font-display text-2xl font-bold leading-tight">{client.name}</h2>
          <p className="mt-0.5 text-muted">{client.phone}</p>
          {client.birthday && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Cake size={14} /> {formatDate(client.birthday, { day: 'numeric', month: 'long' })}
            </p>
          )}
        </div>
        <IconButton label="Cerrar" onClick={() => openClient(null)} className="-mr-2 -mt-2">
          <X size={20} />
        </IconButton>
      </div>

      <div className="flex flex-wrap gap-2">
        <WhatsappButton href={wa.chat(client)} />
        <a href={`tel:${client.phone.replace(/[^\d+]/g, '')}`} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-ink/5 px-4 font-semibold transition hover:bg-ink/10">
          <Phone size={18} /> Llamar
        </a>
        <IconButton label="Editar" onClick={() => openModal('client', { id: client.id })} className="bg-ink/5">
          <Pencil size={18} />
        </IconButton>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="soft" icon={<CalendarPlus size={18} />} onClick={() => openModal('appointment', { clientId })}>
          {preset.appointment.one}
        </Button>
        <Button variant="soft" icon={<HandCoins size={18} />} onClick={() => openModal('payment', { clientId })}>
          Cobrar
        </Button>
      </div>

      {debt > 0 && (
        <div className="rounded-3xl border border-bad/20 bg-bad/5 p-4">
          <p className="text-sm font-semibold text-bad">Debe {money(debt)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={settleDebt}>Marcar como pagado</Button>
            <WhatsappButton href={wa.debt(client, debt)} label="Recordar" className="h-9 text-sm" />
          </div>
        </div>
      )}

      <MembershipCards clientId={clientId} />

      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Total pagado" value={money(totalPaid)} />
        <Stat label={`${preset.appointment.many}`} value={String(history.appointments.length)} />
        {preset.customFields.map((f) => (
          <Stat key={f.key} label={f.label} value={client.customFields[f.key] || '—'} />
        ))}
      </dl>

      {client.notes && <p className="rounded-3xl bg-warn/10 p-4 text-sm">📝 {client.notes}</p>}

      <Segmented
        value={tab}
        onChange={setTab}
        className="w-full [&>button]:flex-1"
        options={[
          { value: 'turnos', label: preset.appointment.many },
          { value: 'pagos', label: 'Pagos' },
          ...(preset.modules.includes('trabajos') ? [{ value: 'trabajos' as const, label: 'Trabajos' }] : []),
        ]}
      />
      <HistoryList tab={tab} history={history} />

      <div className="border-t border-line/60 pt-4">
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">¿Seguro? Se borra su historial.</span>
            <Button size="sm" variant="danger" onClick={() => (data.removeClient(clientId), openClient(null), notify('Eliminado'))}>Sí, eliminar</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>No</Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" className="text-bad" icon={<Trash2 size={16} />} onClick={() => setConfirmDelete(true)}>
            Eliminar {preset.client.one.toLowerCase()}
          </Button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink/[0.03] px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold">{value}</dd>
    </div>
  )
}

function MembershipCards({ clientId }: { clientId: string }) {
  const memberships = useCrm((s) => s.memberships)
  const plans = useCrm((s) => s.plans)
  const openModal = useUi((s) => s.openModal)
  const mine = memberships.filter((m) => m.clientId === clientId)
  if (!mine.length) {
    return (
      <button type="button" onClick={() => openModal('membership', { clientId })} className="w-full rounded-3xl border border-dashed border-line px-4 py-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent">
        + Activar plan o cuota
      </button>
    )
  }
  return (
    <div className="space-y-2">
      {mine.map((m) => {
        const plan = plans.find((p) => p.id === m.planId)
        const { state, days } = membershipState(m, plan)
        const tone = state === 'activa' ? 'ok' : state === 'por_vencer' ? 'warn' : 'bad'
        const detail = plan?.kind === 'sesiones' ? `${m.sessionsLeft ?? 0} sesiones restantes` : days !== undefined && days >= 0 ? `Vence en ${days} días` : 'Vencida'
        return (
          <button key={m.id} type="button" onClick={() => openModal('membership', { id: m.id })} className="flex w-full items-center justify-between gap-3 rounded-3xl bg-accent/5 px-4 py-3 text-left transition hover:bg-accent/10">
            <span>
              <span className="block font-semibold">{plan?.name ?? 'Plan'}</span>
              <span className="text-sm text-muted">{detail}</span>
            </span>
            <Badge tone={tone}>{state === 'activa' ? 'Al día' : state === 'por_vencer' ? 'Por vencer' : 'Vencida'}</Badge>
          </button>
        )
      })}
    </div>
  )
}

function HistoryList({ tab, history }: { tab: Tab; history: ReturnType<typeof clientHistory> }) {
  const services = useCrm((s) => s.services)
  const openModal = useUi((s) => s.openModal)
  const { money } = useBusiness()
  const rows =
    tab === 'turnos'
      ? history.appointments.map((a) => ({
          id: a.id,
          title: services.find((s) => s.id === a.serviceId)?.name ?? 'Turno',
          sub: `${formatDate(a.start, { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatTime(a.start)}`,
          badge: <Badge tone={STATUS_META[a.status].tone}>{STATUS_META[a.status].label}</Badge>,
          open: () => openModal('appointment', { id: a.id }),
        }))
      : tab === 'pagos'
        ? history.payments.map((p) => ({
            id: p.id,
            title: p.concept,
            sub: formatDate(p.date, { day: 'numeric', month: 'long' }),
            badge: <Badge tone={p.paid ? 'ok' : 'bad'}>{money(p.amount)}</Badge>,
            open: () => openModal('payment', { id: p.id }),
          }))
        : history.workOrders.map((w) => ({
            id: w.id,
            title: w.title,
            sub: w.reference ?? '',
            badge: <Badge tone="accent">{money(w.price)}</Badge>,
            open: () => openModal('workorder', { id: w.id }),
          }))

  if (!rows.length) return <p className="py-6 text-center text-sm text-muted">Todavía no hay nada aquí.</p>
  return (
    <ul className="space-y-1.5">
      {rows.slice(0, 12).map((r) => (
        <li key={r.id}>
          <button type="button" onClick={r.open} className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-ink/5">
            <span className="min-w-0">
              <span className="block truncate font-medium">{r.title}</span>
              <span className="block truncate text-sm text-muted">{r.sub}</span>
            </span>
            {r.badge}
          </button>
        </li>
      ))}
    </ul>
  )
}
