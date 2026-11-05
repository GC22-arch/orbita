import { Resend } from 'resend'

let client: Resend | null = null

/** Cliente de Resend (solo servidor). Devuelve null si no hay clave configurada. */
export function getResend(): Resend | null {
  if (typeof window !== 'undefined') throw new Error('Resend solo se usa en el servidor')
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  client ??= new Resend(apiKey)
  return client
}

// Sin dominio propio verificado, Resend solo entrega desde onboarding@resend.dev al dueño de la cuenta
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
export const EMAIL_FROM = `Orbita <${fromEmail}>`
