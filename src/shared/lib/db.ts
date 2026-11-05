import { createClient } from '@/lib/supabase/client'
import type { Collections, CollectionKey } from '@/shared/stores/crm-store'

/** Traducción entre el store (camelCase) y las tablas de Supabase (snake_case) */

export const TABLES: Record<CollectionKey, string> = {
  clients: 'clients',
  services: 'services',
  plans: 'plans',
  appointments: 'appointments',
  payments: 'payments',
  memberships: 'memberships',
  workOrders: 'work_orders',
}

/** Orden de inserción respetando las relaciones (primero lo que otros referencian) */
export const INSERT_ORDER: CollectionKey[] = ['clients', 'services', 'plans', 'appointments', 'payments', 'memberships', 'workOrders']

const toSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
const toCamel = (key: string) => key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

type Row = Record<string, unknown>

export function toRow(item: object, businessId?: string): Row {
  const row: Row = {}
  for (const [k, v] of Object.entries(item)) row[toSnake(k)] = v === undefined ? null : v
  if (businessId) row.business_id = businessId
  return row
}

export function fromRow<T>(row: Row): T {
  const item: Row = {}
  for (const [k, v] of Object.entries(row)) {
    if (k === 'business_id' || v === null) continue
    item[toCamel(k)] = v
  }
  return item as T
}

let client: ReturnType<typeof createClient> | null = null
export function db() {
  client ??= createClient()
  return client
}

export async function loadCollections(businessId: string): Promise<Collections> {
  const entries = await Promise.all(
    INSERT_ORDER.map(async (key) => {
      const { data, error } = await db().from(TABLES[key]).select('*').eq('business_id', businessId)
      if (error) throw error
      return [key, (data ?? []).map((r) => fromRow(r))] as const
    }),
  )
  return Object.fromEntries(entries) as unknown as Collections
}

export async function insertCollections(data: Collections, businessId: string): Promise<void> {
  for (const key of INSERT_ORDER) {
    const rows = data[key].map((it) => toRow(it, businessId))
    if (!rows.length) continue
    const { error } = await db().from(TABLES[key]).insert(rows)
    if (error) throw error
  }
}
