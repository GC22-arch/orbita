/**
 * Manda una muestra de los emails de Orbita a una casilla, para revisarlos.
 * Uso: npx tsx --env-file=.env.local scripts/send-email-preview.tsx correo@ejemplo.com
 */
import { Resend } from 'resend'
import { ResetPasswordEmail } from '../src/features/email/templates/reset-password-email'
import { WelcomeEmail } from '../src/features/email/templates/welcome-email'

const to = process.argv[2]
const apiKey = process.env.RESEND_API_KEY
if (!to || !apiKey) throw new Error('Falta el email de destino o RESEND_API_KEY')

const site = 'https://orbita-crm-latam.vercel.app'
const from = `Orbita <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`
const resend = new Resend(apiKey)

const samples = [
  { subject: '[Muestra] ¡Bienvenido a Orbita! 🚀', react: WelcomeEmail({ name: 'Gabriel', appUrl: `${site}/inicio` }) },
  { subject: '[Muestra] Crea tu contraseña nueva de Orbita', react: ResetPasswordEmail({ name: 'Gabriel', resetUrl: `${site}/recuperar` }) },
]

async function main() {
  for (const sample of samples) {
    const { error } = await resend.emails.send({ from, to, ...sample })
    console.log(error ? `✗ ${sample.subject}: ${error.message}` : `✓ ${sample.subject}`)
  }
}

void main()
