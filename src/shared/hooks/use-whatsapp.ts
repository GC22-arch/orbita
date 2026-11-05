'use client'

import { useCallback } from 'react'
import { fillTemplate, formatDate, formatTime, whatsappUrl } from '@/shared/lib/format'
import { useSettings } from '@/shared/stores/settings-store'
import type { Appointment, Client } from '@/shared/types/crm'
import { useBusiness } from './use-business'

/** Arma los mensajes de WhatsApp listos para enviar con un toque */
export function useWhatsapp() {
  const templates = useSettings((s) => s.waTemplates)
  const { businessName, preset, money } = useBusiness()

  const base = useCallback((client: Client) => ({ nombre: client.name.split(' ')[0], negocio: businessName }), [businessName])

  const reminder = useCallback(
    (client: Client, appt: Appointment) =>
      whatsappUrl(
        client.phone,
        fillTemplate(templates.reminder, {
          ...base(client),
          turno: preset.appointment.one.toLowerCase(),
          fecha: formatDate(appt.start, { weekday: 'long', day: 'numeric', month: 'long' }),
          hora: formatTime(appt.start),
        }),
      ),
    [templates, base, preset],
  )

  const debt = useCallback(
    (client: Client, amount: number) => whatsappUrl(client.phone, fillTemplate(templates.debt, { ...base(client), monto: money(amount) })),
    [templates, base, money],
  )

  const expiry = useCallback(
    (client: Client, plan: string, date?: string) =>
      whatsappUrl(
        client.phone,
        fillTemplate(templates.expiry, { ...base(client), plan, fecha: date ? formatDate(date, { day: 'numeric', month: 'long' }) : 'pronto' }),
      ),
    [templates, base],
  )

  const chat = useCallback((client: Client) => whatsappUrl(client.phone, `Hola ${client.name.split(' ')[0]}! `), [])

  return { reminder, debt, expiry, chat }
}
