import { UpdatePasswordForm } from '@/features/auth/components/auth-forms'

export default function NuevaClavePage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">Crea tu contraseña nueva</h1>
      <p className="mb-8 mt-2 text-muted">Elige una que recuerdes fácil y que tenga al menos 8 caracteres.</p>
      <UpdatePasswordForm />
    </>
  )
}
