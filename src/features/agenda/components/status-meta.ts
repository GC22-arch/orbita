import type { Tone } from '@/shared/components/ui'
import type { AppointmentStatus } from '@/shared/types/crm'

export const STATUS_META: Record<AppointmentStatus, { label: string; tone: Tone }> = {
  pendiente: { label: 'Sin confirmar', tone: 'warn' },
  confirmado: { label: 'Confirmado', tone: 'accent' },
  asistio: { label: 'Vino', tone: 'ok' },
  ausente: { label: 'No vino', tone: 'bad' },
  cancelado: { label: 'Cancelado', tone: 'neutral' },
}
