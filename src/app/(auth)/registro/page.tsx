import Link from 'next/link'
import { SignupForm } from '@/features/auth/components/auth-forms'

export default function RegistroPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Pon tu negocio en órbita 🚀</h1>
      <p className="mb-8 mt-2 text-muted">Crea tu cuenta en menos de un minuto.</p>
      <SignupForm />
      <p className="mt-8 border-t border-line/60 pt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-accent hover:underline">Inicia sesión</Link>
      </p>
    </>
  )
}
