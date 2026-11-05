import type { WaTemplates } from '@/shared/stores/settings-store'
import type { BusinessType } from '@/shared/types/crm'
import { db } from './db'
import { uid } from './format'

export interface BusinessFields {
  businessName: string
  ownerName: string
  businessType: BusinessType
  currency: string
  waTemplates: WaTemplates
}

interface BusinessRow {
  id: string
  name: string
  owner_name: string
  business_type: BusinessType
  currency: string
  wa_templates: WaTemplates | null
}

function toRow(f: Partial<BusinessFields>) {
  const row: Record<string, unknown> = {}
  if (f.businessName !== undefined) row.name = f.businessName
  if (f.ownerName !== undefined) row.owner_name = f.ownerName
  if (f.businessType !== undefined) row.business_type = f.businessType
  if (f.currency !== undefined) row.currency = f.currency
  if (f.waTemplates !== undefined) row.wa_templates = f.waTemplates
  return row
}

function fromRow(row: BusinessRow): { id: string } & Partial<BusinessFields> {
  return {
    id: row.id,
    businessName: row.name,
    ownerName: row.owner_name,
    businessType: row.business_type,
    currency: row.currency,
    ...(row.wa_templates ? { waTemplates: row.wa_templates } : {}),
  }
}

/** Primer negocio del usuario (por ahora uno por cuenta) */
export async function fetchMyBusiness() {
  const { data, error } = await db().from('businesses').select('*').order('created_at').limit(1).maybeSingle()
  if (error) throw error
  return data ? fromRow(data as BusinessRow) : null
}

export async function createBusiness(fields: BusinessFields): Promise<string> {
  // Sin .select(): al insertar, la membresía del dueño todavía no es visible para la regla de lectura
  const id = uid()
  const { error } = await db().from('businesses').insert({ id, ...toRow(fields) })
  if (error) throw error
  return id
}

export async function updateBusiness(id: string, fields: Partial<BusinessFields>) {
  const { error } = await db().from('businesses').update(toRow(fields)).eq('id', id)
  if (error) throw error
}

export async function deleteBusiness(id: string) {
  const { error } = await db().from('businesses').delete().eq('id', id)
  if (error) throw error
}

export async function currentUser() {
  const { data } = await db().auth.getUser()
  return data.user
}
