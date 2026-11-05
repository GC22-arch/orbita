export type BusinessType = 'clinica' | 'estetica' | 'taller' | 'club' | 'gimnasio' | 'otro'

export type ModuleKey = 'agenda' | 'clientes' | 'caja' | 'planes' | 'trabajos'

export interface CustomFieldDef {
  key: string
  label: string
  placeholder?: string
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  birthday?: string
  notes?: string
  customFields: Record<string, string>
  createdAt: string
}

export interface Service {
  id: string
  name: string
  price: number
  durationMin: number
  color: string
}

export type AppointmentStatus = 'pendiente' | 'confirmado' | 'asistio' | 'ausente' | 'cancelado'

export interface Appointment {
  id: string
  clientId: string
  serviceId?: string
  start: string
  durationMin: number
  status: AppointmentStatus
  notes?: string
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro'

export interface Payment {
  id: string
  kind: 'ingreso' | 'gasto'
  clientId?: string
  concept: string
  amount: number
  method: PaymentMethod
  date: string
  paid: boolean
}

export interface Plan {
  id: string
  name: string
  price: number
  kind: 'mensual' | 'sesiones'
  sessions?: number
}

export interface Membership {
  id: string
  clientId: string
  planId: string
  startDate: string
  endDate?: string
  sessionsLeft?: number
}

export type WorkOrderStatus = 'recibido' | 'en_proceso' | 'listo' | 'entregado'

export interface WorkOrder {
  id: string
  clientId: string
  title: string
  reference?: string
  detail?: string
  price: number
  status: WorkOrderStatus
  createdAt: string
}

export type WidgetKey =
  | 'proximo'
  | 'hoy'
  | 'caja'
  | 'deudores'
  | 'vencimientos'
  | 'trabajos'
  | 'mes'
  | 'cumples'

export type ThemeMode = 'light' | 'dark' | 'system'

export type AccentKey = 'violeta' | 'azul' | 'cian' | 'esmeralda' | 'ambar' | 'coral'
