'use client'

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { WORK_STATUS } from '@/features/workorders/components/workorder-form'
import { WhatsappButton } from '@/shared/components/whatsapp-button'
import { Avatar, Badge, Button } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { useWhatsapp } from '@/shared/hooks/use-whatsapp'
import { formatDate, whatsappUrl } from '@/shared/lib/format'
import { dailyIncome, debtByClient, expiringMemberships, monthCash, todayCash, upcomingBirthdays } from '@/shared/lib/insights'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'
import type { WorkOrderStatus } from '@/shared/types/crm'

export function CashWidget() {
  const payments = useCrm((s) => s.payments)
  const openModal = useUi((s) => s.openModal)
  const { money } = useBusiness()
  const day = todayCash(payments)
  const month = monthCash(payments)
  return (
    <div>
      <p className="text-sm font-medium text-muted">Ingresó hoy</p>
      <p className="font-display text-4xl font-bold tracking-tight text-gradient">{money(day.income)}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-ok/10 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs font-semibold text-ok"><ArrowUpRight size={14} /> Mes</p>
          <p className="truncate font-semibold">{money(month.income)}</p>
        </div>
        <div className="rounded-2xl bg-bad/10 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs font-semibold text-bad"><ArrowDownRight size={14} /> Gastos</p>
          <p className="truncate font-semibold">{money(month.expense)}</p>
        </div>
      </div>
      <Button className="mt-4 w-full" onClick={() => openModal('payment')}>Registrar cobro</Button>
    </div>
  )
}

export function DebtorsWidget() {
  const { payments, clients } = useCrm()
  const openClient = useUi((s) => s.openClient)
  const { money } = useBusiness()
  const wa = useWhatsapp()
  const debtors = useMemo(
    () =>
      [...debtByClient(payments).entries()]
        .map(([id, amount]) => ({ client: clients.find((c) => c.id === id), amount }))
        .filter((d) => d.client)
        .sort((a, b) => b.amount - a.amount),
    [payments, clients],
  )
  const total = debtors.reduce((a, d) => a + d.amount, 0)
  if (!debtors.length) return <p className="py-6 text-center text-muted">🎉 Nadie te debe nada.</p>
  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        Te deben <span className="font-bold text-bad">{money(total)}</span> en total
      </p>
      <ul className="space-y-1.5">
        {debtors.slice(0, 4).map(({ client, amount }) => (
          <li key={client!.id} className="flex items-center gap-3">
            <button type="button" onClick={() => openClient(client!.id)} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 text-left transition hover:bg-ink/[0.04]">
              <Avatar name={client!.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{client!.name}</span>
                <span className="text-sm font-semibold text-bad">{money(amount)}</span>
              </span>
            </button>
            <WhatsappButton href={wa.debt(client!, amount)} compact label="Recordar deuda" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ExpiringWidget() {
  const { memberships, plans, clients } = useCrm()
  const openModal = useUi((s) => s.openModal)
  const wa = useWhatsapp()
  const items = expiringMemberships({ memberships, plans }).slice(0, 4)
  if (!items.length) return <p className="py-6 text-center text-muted">Todas las cuotas están al día ✅</p>
  return (
    <ul className="space-y-1.5">
      {items.map(({ membership, plan, state, days }) => {
        const client = clients.find((c) => c.id === membership.clientId)
        if (!client) return null
        const label = plan?.kind === 'sesiones' ? `${membership.sessionsLeft ?? 0} sesiones` : state === 'vencida' ? `Venció hace ${Math.abs(days ?? 0)} d` : days === 0 ? 'Vence hoy' : `Vence en ${days} d`
        return (
          <li key={membership.id} className="flex items-center gap-3">
            <button type="button" onClick={() => openModal('membership', { id: membership.id })} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 text-left transition hover:bg-ink/[0.04]">
              <Avatar name={client.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{client.name}</span>
                <span className="block truncate text-sm text-muted">{plan?.name}</span>
              </span>
              <Badge tone={state === 'vencida' ? 'bad' : 'warn'}>{label}</Badge>
            </button>
            <WhatsappButton href={wa.expiry(client, plan?.name ?? 'plan', membership.endDate)} compact label="Avisar vencimiento" />
          </li>
        )
      })}
    </ul>
  )
}

export function WorkOrdersWidget() {
  const { workOrders, clients } = useCrm()
  const openModal = useUi((s) => s.openModal)
  const { money } = useBusiness()
  const counts = (['recibido', 'en_proceso', 'listo'] as WorkOrderStatus[]).map((s) => ({ s, n: workOrders.filter((w) => w.status === s).length }))
  const ready = workOrders.filter((w) => w.status === 'listo')
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {counts.map(({ s, n }) => (
          <Link key={s} href="/trabajos" className="rounded-2xl bg-ink/[0.04] px-2 py-3 text-center transition hover:bg-accent/10">
            <p className="font-display text-2xl font-bold">{n}</p>
            <p className="truncate text-xs font-medium text-muted">{WORK_STATUS[s].emoji} {WORK_STATUS[s].short}</p>
          </Link>
        ))}
      </div>
      {ready.length > 0 && <p className="mb-1.5 mt-4 text-sm font-semibold text-ok">Listos para entregar</p>}
      <ul className="space-y-1">
        {ready.slice(0, 3).map((w) => {
          const client = clients.find((c) => c.id === w.clientId)
          return (
            <li key={w.id} className="flex items-center gap-2">
              <button type="button" onClick={() => openModal('workorder', { id: w.id })} className="min-w-0 flex-1 rounded-xl px-2 py-1.5 text-left transition hover:bg-ink/[0.04]">
                <span className="block truncate font-medium">{w.title}</span>
                <span className="block truncate text-sm text-muted">{client?.name} · {w.reference} · {money(w.price)}</span>
              </button>
              {client && <WhatsappButton compact label="Avisar que está listo" href={whatsappUrl(client.phone, `Hola ${client.name.split(' ')[0]}! Tu ${w.reference ?? 'trabajo'} ya está listo para retirar 🙌`)} />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function MonthWidget() {
  const payments = useCrm((s) => s.payments)
  const { money } = useBusiness()
  const days = useMemo(() => dailyIncome(payments, 14), [payments])
  const max = Math.max(1, ...days.map((d) => d.total))
  const total = days.reduce((a, d) => a + d.total, 0)
  const half = days.slice(7).reduce((a, d) => a + d.total, 0) - days.slice(0, 7).reduce((a, d) => a + d.total, 0)
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-muted">Últimos 14 días</p>
          <p className="font-display text-3xl font-bold tracking-tight">{money(total)}</p>
        </div>
        <Badge tone={half >= 0 ? 'ok' : 'bad'}>
          {half >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {money(Math.abs(half))} vs semana anterior
        </Badge>
      </div>
      <div className="mt-5 flex h-36 items-end gap-1.5 sm:gap-2">
        {days.map((d, i) => (
          <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-semibold text-bg group-hover:block">
              {money(d.total)}
            </span>
            <div
              style={{ height: `${Math.max(4, (d.total / max) * 100)}%`, animationDelay: `${i * 35}ms` }}
              className={`w-full origin-bottom animate-rise rounded-t-lg rounded-b-sm transition group-hover:brightness-110 ${i === days.length - 1 ? 'bg-gradient-accent shadow-glow' : 'bg-accent/25 group-hover:bg-accent/50'}`}
            />
            <span className="mt-1.5 text-center text-[10px] font-medium text-muted">{d.date.getDate()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BirthdaysWidget() {
  const clients = useCrm((s) => s.clients)
  const businessName = useBusiness().businessName
  const list = upcomingBirthdays(clients, 7)
  if (!list.length) return <p className="py-6 text-center text-muted">Sin cumpleaños esta semana.</p>
  return (
    <ul className="space-y-2">
      {list.slice(0, 4).map(({ client, date, days }) => (
        <li key={client.id} className="flex items-center gap-3">
          <Avatar name={client.name} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{client.name}</span>
            <span className="text-sm text-muted">{days === 0 ? '¡Hoy! 🎂' : days === 1 ? 'Mañana' : formatDate(date.toISOString(), { weekday: 'long', day: 'numeric' })}</span>
          </span>
          <WhatsappButton compact label="Saludar" href={whatsappUrl(client.phone, `¡Feliz cumpleaños ${client.name.split(' ')[0]}! 🎉 Te desea todo el equipo de ${businessName}.`)} />
        </li>
      ))}
    </ul>
  )
}
