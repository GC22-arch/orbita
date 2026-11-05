import type { ReactElement } from 'react'
import { EMAIL_FROM, getResend } from '@/shared/lib/resend'

interface SendEmailParams {
  to: string
  subject: string
  react: ReactElement
}

/** Envía un email transaccional. Devuelve false si Resend no está configurado o falla. */
export async function sendEmail({ to, subject, react }: SendEmailParams): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false

  const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, react })
  if (error) {
    console.error('[email] No se pudo enviar:', error.message)
    return false
  }
  return true
}
