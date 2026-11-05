import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components/auth-forms'

export default function RecuperarPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">¿Olvidaste tu contraseña?</h1>
      <p className="mb-8 mt-2 text-muted">No pasa nada. Escribe tu email y te mandamos un enlace para crear una nueva.</p>
      <ForgotPasswordForm />
      <p className="mt-8 text-center text-sm">
        <Link href="/login" className="font-semibold text-accent hover:underline">Volver a iniciar sesión</Link>
      </p>
    </>
  )
}
