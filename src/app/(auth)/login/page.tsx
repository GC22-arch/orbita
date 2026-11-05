import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/components/auth-forms'

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">¡Hola de nuevo! 👋</h1>
      <p className="mb-8 mt-2 text-muted">Entra para ver cómo va tu negocio hoy.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-8 border-t border-line/60 pt-6 text-center text-sm text-muted">
        ¿Todavía no tienes cuenta?{' '}
        <Link href="/registro" className="font-semibold text-accent hover:underline">Créala gratis</Link>
      </p>
    </>
  )
}
