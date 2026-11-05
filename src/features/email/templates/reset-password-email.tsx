import { Text } from '@react-email/components'
import { EmailButton, EmailLayout, heading, paragraph, small } from './email-layout'

interface ResetPasswordEmailProps {
  name?: string
  resetUrl: string
}

export function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <EmailLayout
      preview="Crea una contraseña nueva para entrar a Orbita"
      footer="Si no pediste cambiar tu contraseña, ignora este email: tu cuenta sigue segura."
    >
      <Text style={heading}>{name ? `Hola, ${name}` : 'Hola'} 👋</Text>
      <Text style={paragraph}>
        Recibimos un pedido para cambiar la contraseña de tu cuenta de Orbita. Toca el botón para elegir una nueva.
      </Text>
      <EmailButton href={resetUrl}>Crear contraseña nueva</EmailButton>
      <Text style={small}>El enlace vale por 1 hora y se puede usar una sola vez.</Text>
    </EmailLayout>
  )
}
