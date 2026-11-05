import { BUSINESS_PRESETS } from '@/shared/constants/business-presets'
import type { Collections } from '@/shared/stores/crm-store'
import type { AppointmentStatus, BusinessType, Client, WorkOrderStatus } from '@/shared/types/crm'
import { addDays, startOfDay, uid } from './format'

const NAMES = [
  'Valentina Rojas', 'Mateo González', 'Camila Fernández', 'Santiago López', 'Lucía Martínez',
  'Joaquín Herrera', 'Martina Díaz', 'Tomás Romero', 'Sofía Castro', 'Benjamín Torres',
  'Isabella Morales', 'Emiliano Vargas', 'Renata Suárez', 'Thiago Medina', 'Antonella Ríos',
]

const SAMPLE_FIELDS: Record<string, string[]> = {
  documento: ['30.512.884', '27.901.443', '35.220.118', '41.009.672'],
  cobertura: ['Particular', 'OSDE 310', 'Swiss Medical', 'Sancor Salud'],
  alergias: ['Ninguna', 'Penicilina', 'Ninguna', 'Látex'],
  tipoPiel: ['Mixta', 'Seca', 'Grasa', 'Sensible'],
  instagram: ['@vale.rojas', '@cami.fz', '@luciam', '@sofi.castro'],
  patente: ['AE451KD', 'AB902TR', 'AF118PL', 'AD774MN'],
  vehiculo: ['Fiat Cronos 2021', 'Toyota Hilux 2019', 'VW Gol Trend 2017', 'Ford Ranger 2022'],
  km: ['45.200', '98.700', '120.300', '23.900'],
  nroSocio: ['1024', '1187', '0932', '1450'],
  categoria: ['Mayores', 'Juveniles', 'Veteranos', 'Infantiles'],
  disciplina: ['Fútbol', 'Pádel', 'Natación', 'Hockey'],
  objetivo: ['Ganar fuerza', 'Bajar de peso', 'Movilidad', 'Resistencia'],
  aptoMedico: ['03/2027', '11/2026', '06/2027', '01/2027'],
}

const WORK_TITLES = ['Cambio de pastillas de freno', 'Service de 60.000 km', 'Ruido en tren delantero', 'Cambio de embrague']

function pick<T>(list: readonly T[], i: number): T {
  return list[i % list.length]
}

function buildClients(type: BusinessType): Client[] {
  const fields = BUSINESS_PRESETS[type].customFields
  return NAMES.map((name, i) => ({
    id: uid(),
    name,
    phone: `+54 9 11 ${String(4000 + i * 137).slice(0, 4)}-${String(1000 + i * 293).slice(0, 4)}`,
    email: `${name.split(' ')[0].toLowerCase()}@mail.com`,
    birthday: addDays(new Date(1990 + (i % 15), 0, 1), (i * 47 + 300) % 365).toISOString(),
    notes: i % 4 === 0 ? 'Prefiere turnos por la mañana.' : undefined,
    customFields: Object.fromEntries(fields.map((f) => [f.key, pick(SAMPLE_FIELDS[f.key] ?? ['—'], i)])),
    createdAt: addDays(new Date(), -90 + i * 5).toISOString(),
  }))
}

function birthdayToday(clients: Client[]): Client[] {
  // Un cumpleaños cerca de hoy para que el widget tenga vida
  const today = new Date()
  return clients.map((c, i) =>
    i === 2 ? { ...c, birthday: new Date(1994, today.getMonth(), today.getDate() + 1).toISOString() } : c,
  )
}

export function buildDemoData(type: BusinessType): Collections {
  const preset = BUSINESS_PRESETS[type]
  const clients = birthdayToday(buildClients(type))
  const services = preset.services.map((s) => ({ ...s, id: uid() }))
  const plans = preset.plans.map((p) => ({ ...p, id: uid() }))
  const today = startOfDay(new Date())

  const appointments = Array.from({ length: 26 }, (_, i) => {
    const day = addDays(today, Math.floor(i / 4) - 1)
    const start = new Date(day)
    start.setHours(9 + ((i * 2) % 9), i % 2 === 0 ? 0 : 30)
    const service = pick(services, i)
    const isPast = start.getTime() < Date.now()
    const status: AppointmentStatus = isPast ? (i % 5 === 0 ? 'ausente' : 'asistio') : i % 3 === 0 ? 'pendiente' : 'confirmado'
    return { id: uid(), clientId: pick(clients, i * 3).id, serviceId: service.id, start: start.toISOString(), durationMin: service.durationMin, status }
  })

  const payments = Array.from({ length: 22 }, (_, i) => {
    const service = pick(services, i)
    const isExpense = i % 7 === 6
    return {
      id: uid(),
      kind: isExpense ? ('gasto' as const) : ('ingreso' as const),
      clientId: isExpense ? undefined : pick(clients, i * 2).id,
      concept: isExpense ? pick(['Insumos', 'Alquiler', 'Luz e internet'], i) : service.name,
      amount: isExpense ? service.price * 2 : service.price,
      method: pick(['efectivo', 'transferencia', 'tarjeta'] as const, i),
      date: addDays(today, -Math.floor(i * 1.3)).toISOString(),
      paid: isExpense || i % 6 !== 1,
    }
  })

  const memberships = clients.slice(0, 9).map((c, i) => {
    const plan = pick(plans, i)
    const start = addDays(today, -25 + i * 3)
    return {
      id: uid(),
      clientId: c.id,
      planId: plan.id,
      startDate: start.toISOString(),
      endDate: plan.kind === 'mensual' ? addDays(start, 30).toISOString() : undefined,
      sessionsLeft: plan.kind === 'sesiones' ? Math.max(1, (plan.sessions ?? 4) - (i % 4)) : undefined,
    }
  })

  const statuses: WorkOrderStatus[] = ['recibido', 'en_proceso', 'en_proceso', 'listo', 'entregado']
  const workOrders = preset.modules.includes('trabajos')
    ? Array.from({ length: 6 }, (_, i) => {
        const client = pick(clients, i + 1)
        return {
          id: uid(),
          clientId: client.id,
          title: pick(WORK_TITLES, i),
          reference: client.customFields.patente,
          detail: 'Revisar y presupuestar antes de avanzar.',
          price: pick(services, i).price + 15000,
          status: pick(statuses, i),
          createdAt: addDays(today, -i).toISOString(),
        }
      })
    : []

  return { clients, services, appointments, payments, plans, memberships, workOrders }
}

export function buildStarterData(type: BusinessType): Collections {
  const preset = BUSINESS_PRESETS[type]
  return {
    clients: [],
    services: preset.services.map((s) => ({ ...s, id: uid() })),
    plans: preset.plans.map((p) => ({ ...p, id: uid() })),
    appointments: [],
    payments: [],
    memberships: [],
    workOrders: [],
  }
}
