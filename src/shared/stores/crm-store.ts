'use client'

import { create } from 'zustand'
import { db, insertCollections, loadCollections, TABLES, toRow } from '@/shared/lib/db'
import { uid } from '@/shared/lib/format'
import type { Appointment, Client, Membership, Payment, Plan, Service, WorkOrder } from '@/shared/types/crm'
import { useUi } from './ui-store'

/**
 * Datos del negocio. La pantalla se actualiza al instante (optimista)
 * y el cambio se guarda en Supabase en segundo plano; si falla, se revierte y se avisa.
 */
export interface Collections {
  clients: Client[]
  services: Service[]
  appointments: Appointment[]
  payments: Payment[]
  plans: Plan[]
  memberships: Membership[]
  workOrders: WorkOrder[]
}

export type CollectionKey = keyof Collections
type Item<K extends CollectionKey> = Collections[K][number]

interface CrmState extends Collections {
  businessId: string | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  load: (businessId: string) => Promise<void>
  add: <K extends CollectionKey>(key: K, item: Omit<Item<K>, 'id'>) => string
  update: <K extends CollectionKey>(key: K, id: string, patch: Partial<Item<K>>) => void
  remove: <K extends CollectionKey>(key: K, id: string) => void
  removeClient: (id: string) => void
  markAttended: (appointmentId: string) => void
  seed: (data: Collections, mode?: 'replace' | 'append') => Promise<void>
  clear: () => void
}

const EMPTY: Collections = {
  clients: [],
  services: [],
  appointments: [],
  payments: [],
  plans: [],
  memberships: [],
  workOrders: [],
}

/** Ejecuta la escritura remota; si falla, restaura el estado anterior y avisa */
function persist(snapshot: Partial<Collections>, restore: (s: Partial<Collections>) => void, write: () => PromiseLike<{ error: unknown }>) {
  void Promise.resolve(write()).then(({ error }) => {
    if (!error) return
    console.error('[orbita] error al guardar', error)
    restore(snapshot)
    useUi.getState().notify('No se pudo guardar. Revisa tu conexión.', 'bad')
  })
}

export const useCrm = create<CrmState>()((set, get) => ({
  ...EMPTY,
  businessId: null,
  status: 'idle',

  load: async (businessId) => {
    set({ businessId, status: 'loading' })
    try {
      set({ ...(await loadCollections(businessId)), status: 'ready' })
    } catch (error) {
      console.error('[orbita] error al cargar', error)
      set({ status: 'error' })
    }
  },

  add: (key, item) => {
    const id = uid()
    const before = { [key]: get()[key] }
    const full = { ...item, id }
    set((s) => ({ [key]: [...s[key], full] }) as Partial<CrmState>)
    persist(before, set, () => db().from(TABLES[key]).insert(toRow(full, get().businessId ?? undefined)))
    return id
  },

  update: (key, id, patch) => {
    const before = { [key]: get()[key] }
    set((s) => ({ [key]: (s[key] as { id: string }[]).map((it) => (it.id === id ? { ...it, ...patch } : it)) }) as Partial<CrmState>)
    persist(before, set, () => db().from(TABLES[key]).update(toRow(patch)).eq('id', id))
  },

  remove: (key, id) => {
    const before = { [key]: get()[key] }
    set((s) => ({ [key]: (s[key] as { id: string }[]).filter((it) => it.id !== id) }) as Partial<CrmState>)
    persist(before, set, () => db().from(TABLES[key]).delete().eq('id', id))
  },

  removeClient: (id) => {
    const { clients, appointments, memberships, workOrders, payments } = get()
    const before = { clients, appointments, memberships, workOrders, payments }
    // La base borra en cascada turnos, planes y trabajos, y desvincula los pagos
    set((s) => ({
      clients: s.clients.filter((c) => c.id !== id),
      appointments: s.appointments.filter((a) => a.clientId !== id),
      memberships: s.memberships.filter((m) => m.clientId !== id),
      workOrders: s.workOrders.filter((w) => w.clientId !== id),
      payments: s.payments.map((p) => (p.clientId === id ? { ...p, clientId: undefined } : p)),
    }))
    persist(before, set, () => db().from('clients').delete().eq('id', id))
  },

  markAttended: (appointmentId) => {
    const { appointments, memberships, plans, update } = get()
    const appt = appointments.find((a) => a.id === appointmentId)
    if (!appt || appt.status === 'asistio') return
    // Si el cliente tiene un paquete de sesiones activo, descuenta una
    const pack = memberships.find((m) => {
      const plan = plans.find((p) => p.id === m.planId)
      return m.clientId === appt.clientId && plan?.kind === 'sesiones' && (m.sessionsLeft ?? 0) > 0
    })
    update('appointments', appointmentId, { status: 'asistio' })
    if (pack) update('memberships', pack.id, { sessionsLeft: (pack.sessionsLeft ?? 1) - 1 })
  },

  seed: async (data, mode = 'replace') => {
    const businessId = get().businessId
    if (!businessId) throw new Error('Sin negocio activo')
    await insertCollections(data, businessId)
    if (mode === 'replace') return set({ ...data, status: 'ready' })
    const s = get()
    set({
      clients: [...s.clients, ...data.clients],
      services: [...s.services, ...data.services],
      appointments: [...s.appointments, ...data.appointments],
      payments: [...s.payments, ...data.payments],
      plans: [...s.plans, ...data.plans],
      memberships: [...s.memberships, ...data.memberships],
      workOrders: [...s.workOrders, ...data.workOrders],
    })
  },

  clear: () => set({ ...EMPTY, businessId: null, status: 'idle' }),
}))
