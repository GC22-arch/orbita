import type { BusinessType, CustomFieldDef, ModuleKey, Plan, Service, WidgetKey } from '@/shared/types/crm'

export interface BusinessPreset {
  type: BusinessType
  name: string
  emoji: string
  tagline: string
  client: { one: string; many: string }
  appointment: { one: string; many: string }
  customFields: CustomFieldDef[]
  modules: ModuleKey[]
  widgets: WidgetKey[]
  services: Omit<Service, 'id'>[]
  plans: Omit<Plan, 'id'>[]
  workOrderLabel: string
}

const BASE_WIDGETS: WidgetKey[] = ['proximo', 'hoy', 'caja', 'deudores', 'mes', 'cumples']

export const BUSINESS_PRESETS: Record<BusinessType, BusinessPreset> = {
  clinica: {
    type: 'clinica',
    name: 'Clínica o consultorio',
    emoji: '🩺',
    tagline: 'Pacientes, turnos y obras sociales',
    client: { one: 'Paciente', many: 'Pacientes' },
    appointment: { one: 'Turno', many: 'Turnos' },
    customFields: [
      { key: 'documento', label: 'Documento', placeholder: 'Ej: 30.123.456' },
      { key: 'cobertura', label: 'Obra social / seguro', placeholder: 'Ej: Particular' },
      { key: 'alergias', label: 'Alergias', placeholder: 'Ej: Penicilina' },
    ],
    modules: ['agenda', 'clientes', 'caja', 'planes'],
    widgets: BASE_WIDGETS,
    services: [
      { name: 'Consulta', price: 25000, durationMin: 30, color: 'violeta' },
      { name: 'Control', price: 15000, durationMin: 20, color: 'cian' },
      { name: 'Estudio', price: 40000, durationMin: 45, color: 'ambar' },
    ],
    plans: [{ name: 'Tratamiento 5 sesiones', price: 100000, kind: 'sesiones', sessions: 5 }],
    workOrderLabel: 'Tratamiento',
  },
  estetica: {
    type: 'estetica',
    name: 'Centro de estética',
    emoji: '💆',
    tagline: 'Clientas, sesiones y paquetes',
    client: { one: 'Cliente', many: 'Clientes' },
    appointment: { one: 'Turno', many: 'Turnos' },
    customFields: [
      { key: 'tipoPiel', label: 'Tipo de piel', placeholder: 'Ej: Mixta' },
      { key: 'instagram', label: 'Instagram', placeholder: '@usuario' },
    ],
    modules: ['agenda', 'clientes', 'caja', 'planes'],
    widgets: [...BASE_WIDGETS, 'vencimientos'],
    services: [
      { name: 'Limpieza facial', price: 30000, durationMin: 60, color: 'coral' },
      { name: 'Manicura', price: 15000, durationMin: 45, color: 'violeta' },
      { name: 'Masaje relajante', price: 35000, durationMin: 60, color: 'esmeralda' },
      { name: 'Depilación', price: 20000, durationMin: 30, color: 'ambar' },
    ],
    plans: [
      { name: 'Pack 4 faciales', price: 100000, kind: 'sesiones', sessions: 4 },
      { name: 'Pack 8 masajes', price: 240000, kind: 'sesiones', sessions: 8 },
    ],
    workOrderLabel: 'Trabajo',
  },
  taller: {
    type: 'taller',
    name: 'Taller mecánico',
    emoji: '🔧',
    tagline: 'Vehículos, órdenes de trabajo y repuestos',
    client: { one: 'Cliente', many: 'Clientes' },
    appointment: { one: 'Turno', many: 'Turnos' },
    customFields: [
      { key: 'patente', label: 'Patente / placa', placeholder: 'Ej: AB123CD' },
      { key: 'vehiculo', label: 'Vehículo', placeholder: 'Ej: Fiat Cronos 2021' },
      { key: 'km', label: 'Kilometraje', placeholder: 'Ej: 45.000' },
    ],
    modules: ['agenda', 'clientes', 'trabajos', 'caja', 'planes'],
    widgets: ['proximo', 'trabajos', 'hoy', 'caja', 'deudores', 'mes'],
    services: [
      { name: 'Service completo', price: 80000, durationMin: 120, color: 'azul' },
      { name: 'Cambio de aceite', price: 35000, durationMin: 45, color: 'ambar' },
      { name: 'Diagnóstico', price: 20000, durationMin: 30, color: 'cian' },
      { name: 'Frenos', price: 60000, durationMin: 90, color: 'coral' },
    ],
    plans: [{ name: 'Mantenimiento anual', price: 250000, kind: 'sesiones', sessions: 3 }],
    workOrderLabel: 'Orden de trabajo',
  },
  club: {
    type: 'club',
    name: 'Club deportivo',
    emoji: '⚽',
    tagline: 'Socios, cuotas y reservas de canchas',
    client: { one: 'Socio', many: 'Socios' },
    appointment: { one: 'Reserva', many: 'Reservas' },
    customFields: [
      { key: 'nroSocio', label: 'N° de socio', placeholder: 'Ej: 1024' },
      { key: 'categoria', label: 'Categoría', placeholder: 'Ej: Mayores' },
      { key: 'disciplina', label: 'Disciplina', placeholder: 'Ej: Fútbol' },
    ],
    modules: ['agenda', 'clientes', 'planes', 'caja'],
    widgets: ['proximo', 'vencimientos', 'caja', 'deudores', 'hoy', 'mes', 'cumples'],
    services: [
      { name: 'Cancha de fútbol 5', price: 30000, durationMin: 60, color: 'esmeralda' },
      { name: 'Cancha de pádel', price: 20000, durationMin: 60, color: 'azul' },
      { name: 'Quincho', price: 50000, durationMin: 240, color: 'ambar' },
    ],
    plans: [
      { name: 'Cuota social', price: 15000, kind: 'mensual' },
      { name: 'Cuota familiar', price: 35000, kind: 'mensual' },
    ],
    workOrderLabel: 'Pedido',
  },
  gimnasio: {
    type: 'gimnasio',
    name: 'Gimnasio o estudio',
    emoji: '🏋️',
    tagline: 'Alumnos, clases y cuotas',
    client: { one: 'Alumno', many: 'Alumnos' },
    appointment: { one: 'Clase', many: 'Clases' },
    customFields: [
      { key: 'objetivo', label: 'Objetivo', placeholder: 'Ej: Ganar fuerza' },
      { key: 'aptoMedico', label: 'Apto médico vence', placeholder: 'Ej: 03/2027' },
    ],
    modules: ['agenda', 'clientes', 'planes', 'caja'],
    widgets: ['proximo', 'vencimientos', 'hoy', 'caja', 'deudores', 'mes', 'cumples'],
    services: [
      { name: 'Clase de funcional', price: 8000, durationMin: 60, color: 'coral' },
      { name: 'Yoga', price: 8000, durationMin: 60, color: 'esmeralda' },
      { name: 'Entrenamiento personal', price: 20000, durationMin: 60, color: 'violeta' },
    ],
    plans: [
      { name: 'Pase libre', price: 30000, kind: 'mensual' },
      { name: '2 veces por semana', price: 20000, kind: 'mensual' },
      { name: 'Pack 10 clases', price: 60000, kind: 'sesiones', sessions: 10 },
    ],
    workOrderLabel: 'Pedido',
  },
  otro: {
    type: 'otro',
    name: 'Otro negocio',
    emoji: '✨',
    tagline: 'Clientes, turnos y cobros',
    client: { one: 'Cliente', many: 'Clientes' },
    appointment: { one: 'Turno', many: 'Turnos' },
    customFields: [{ key: 'documento', label: 'Documento', placeholder: 'Opcional' }],
    modules: ['agenda', 'clientes', 'caja', 'planes'],
    widgets: BASE_WIDGETS,
    services: [
      { name: 'Servicio estándar', price: 20000, durationMin: 60, color: 'violeta' },
      { name: 'Servicio express', price: 10000, durationMin: 30, color: 'cian' },
    ],
    plans: [{ name: 'Abono mensual', price: 25000, kind: 'mensual' }],
    workOrderLabel: 'Trabajo',
  },
}

export const ACCENTS = {
  violeta: { label: 'Violeta', rgb: '124 92 255', rgb2: '56 189 248' },
  azul: { label: 'Azul', rgb: '59 130 246', rgb2: '45 212 191' },
  cian: { label: 'Cian', rgb: '6 182 212', rgb2: '129 140 248' },
  esmeralda: { label: 'Esmeralda', rgb: '16 185 129', rgb2: '59 130 246' },
  ambar: { label: 'Ámbar', rgb: '245 158 11', rgb2: '244 63 94' },
  coral: { label: 'Coral', rgb: '244 63 94', rgb2: '168 85 247' },
} as const

export const CURRENCIES = [
  { code: 'USD', label: 'Dólar (USD)' },
  { code: 'ARS', label: 'Peso argentino (ARS)' },
  { code: 'MXN', label: 'Peso mexicano (MXN)' },
  { code: 'COP', label: 'Peso colombiano (COP)' },
  { code: 'CLP', label: 'Peso chileno (CLP)' },
  { code: 'PEN', label: 'Sol peruano (PEN)' },
  { code: 'UYU', label: 'Peso uruguayo (UYU)' },
  { code: 'EUR', label: 'Euro (EUR)' },
] as const

export const DEFAULT_WA_TEMPLATES = {
  reminder: 'Hola {nombre} 👋 Te recordamos tu {turno} en {negocio} el {fecha} a las {hora}. ¿Nos confirmas? ¡Gracias!',
  debt: 'Hola {nombre}, te escribimos de {negocio}. Tienes un saldo pendiente de {monto}. Cuando puedas, avísanos. ¡Gracias!',
  expiry: 'Hola {nombre}! Tu plan "{plan}" en {negocio} vence el {fecha}. ¿Lo renovamos? 🙌',
}
