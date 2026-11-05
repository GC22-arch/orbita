import type { Collections } from '@/shared/stores/crm-store'
import type { Appointment, Client, Membership, Payment, Plan } from '@/shared/types/crm'
import { addDays, daysBetween, isSameDay, isSameMonth, startOfDay } from './format'

/** Lógica de negocio derivada: lo que el dueño necesita ver sin hacer cuentas */

export function debtByClient(payments: Payment[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const p of payments) {
    if (p.kind === 'ingreso' && !p.paid && p.clientId) map.set(p.clientId, (map.get(p.clientId) ?? 0) + p.amount)
  }
  return map
}

export function cashSummary(payments: Payment[], predicate: (p: Payment) => boolean) {
  let income = 0
  let expense = 0
  for (const p of payments) {
    if (!p.paid || !predicate(p)) continue
    if (p.kind === 'ingreso') income += p.amount
    else expense += p.amount
  }
  return { income, expense, balance: income - expense }
}

export const todayCash = (payments: Payment[]) => cashSummary(payments, (p) => isSameDay(p.date, new Date()))
export const monthCash = (payments: Payment[], ref = new Date()) => cashSummary(payments, (p) => isSameMonth(p.date, ref))

export function appointmentsOn(appointments: Appointment[], day: Date): Appointment[] {
  return appointments.filter((a) => isSameDay(a.start, day)).sort((a, b) => a.start.localeCompare(b.start))
}

export function nextAppointment(appointments: Appointment[]): Appointment | undefined {
  const now = Date.now()
  return appointments
    .filter((a) => new Date(a.start).getTime() + a.durationMin * 60_000 > now && (a.status === 'confirmado' || a.status === 'pendiente'))
    .sort((a, b) => a.start.localeCompare(b.start))[0]
}

export type MembershipState = 'activa' | 'por_vencer' | 'vencida'

export function membershipState(m: Membership, plan?: Plan): { state: MembershipState; days?: number } {
  if (plan?.kind === 'sesiones') {
    const left = m.sessionsLeft ?? 0
    return { state: left <= 0 ? 'vencida' : left <= 1 ? 'por_vencer' : 'activa' }
  }
  if (!m.endDate) return { state: 'activa' }
  const days = daysBetween(new Date(), m.endDate)
  return { state: days < 0 ? 'vencida' : days <= 5 ? 'por_vencer' : 'activa', days }
}

export function expiringMemberships(data: Pick<Collections, 'memberships' | 'plans'>) {
  return data.memberships
    .map((m) => {
      const plan = data.plans.find((p) => p.id === m.planId)
      return { membership: m, plan, ...membershipState(m, plan) }
    })
    .filter((x) => x.state !== 'activa')
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
}

export function upcomingBirthdays(clients: Client[], withinDays = 7) {
  const today = startOfDay(new Date())
  return clients
    .filter((c) => c.birthday)
    .map((c) => {
      const b = new Date(c.birthday as string)
      let next = new Date(today.getFullYear(), b.getMonth(), b.getDate())
      if (next < today) next = new Date(today.getFullYear() + 1, b.getMonth(), b.getDate())
      return { client: c, date: next, days: daysBetween(today, next) }
    })
    .filter((x) => x.days <= withinDays)
    .sort((a, b) => a.days - b.days)
}

/** Ingresos de los últimos N días (para el mini gráfico) */
export function dailyIncome(payments: Payment[], days = 14): { date: Date; total: number }[] {
  const today = startOfDay(new Date())
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - days + 1)
    const total = payments
      .filter((p) => p.kind === 'ingreso' && p.paid && isSameDay(p.date, date))
      .reduce((acc, p) => acc + p.amount, 0)
    return { date, total }
  })
}

export function clientHistory(data: Collections, clientId: string) {
  return {
    appointments: data.appointments.filter((a) => a.clientId === clientId).sort((a, b) => b.start.localeCompare(a.start)),
    payments: data.payments.filter((p) => p.clientId === clientId).sort((a, b) => b.date.localeCompare(a.date)),
    memberships: data.memberships.filter((m) => m.clientId === clientId),
    workOrders: data.workOrders.filter((w) => w.clientId === clientId),
  }
}
