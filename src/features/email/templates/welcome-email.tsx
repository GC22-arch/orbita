import { Text } from '@react-email/components'
import { EmailButton, EmailLayout, heading, paragraph } from './email-layout'

interface WelcomeEmailProps {
  name: string
  appUrl: string
}

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview="Tu cuenta de Orbita está lista"
      footer="Recibiste este email porque creaste una cuenta en Orbita."
    >
      <Text style={heading}>¡Bienvenido a Orbita, {name}! 🚀</Text>
      <Text style={paragraph}>
        Tu cuenta ya está lista. Desde Orbita vas a ver de un vistazo los turnos de hoy, la caja y quién te debe, y
        mandar recordatorios por WhatsApp con un toque.
      </Text>
      <Text style={paragraph}>Guarda este email: el botón te lleva directo a tu negocio desde cualquier dispositivo.</Text>
      <EmailButton href={appUrl}>Entrar a Orbita</EmailButton>
    </EmailLayout>
  )
}
