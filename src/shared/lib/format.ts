const LOCALE = 'es'

/** UUID compatible con las columnas id de Supabase */
export function uid(): string {
  return crypto.randomUUID()
}

// Cada moneda con el formato de su país: $80.000 en Argentina, $80,000 en México
const CURRENCY_LOCALE: Record<string, string> = {
  ARS: 'es-AR',
  MXN: 'es-MX',
  COP: 'es-CO',
  CLP: 'es-CL',
  PEN: 'es-PE',
  UYU: 'es-UY',
  EUR: 'es-ES',
  USD: 'es-US',
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? 'es-419', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat(LOCALE, opts).format(new Date(iso))
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
}

export function formatLongDate(date: Date): string {
  const text = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const x = new Date(a)
  const y = new Date(b)
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
}

export function isSameMonth(a: Date | string, b: Date | string): boolean {
  const x = new Date(a)
  const y = new Date(b)
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth()
}

export function daysBetween(from: Date | string, to: Date | string): number {
  const ms = startOfDay(new Date(to)).getTime() - startOfDay(new Date(from)).getTime()
  return Math.round(ms / 86_400_000)
}

/** Valor para <input type="date"> en hora local */
export function toDateInput(date: Date | string): string {
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function toTimeInput(date: Date | string): string {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function fromDateTimeInputs(date: string, time = '00:00'): string {
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  return new Date(y, m - 1, d, h, min).toISOString()
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
