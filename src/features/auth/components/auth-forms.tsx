'use client'

import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useTransition, type FormEvent, type ReactNode } from 'react'
import { login, resetPassword, signup, updatePassword, type AuthResult } from '@/actions/auth'
import { Button } from '@/shared/components/ui'

/**
 * Envía con onSubmit (y no con form action) para que React no vacíe los campos
 * cuando hay un error: la persona no tiene que volver a escribir su email.
 */
function useAuthAction(action: (fd: FormData) => Promise<AuthResult>) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, startTransition] = useTransition()

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await action(formData)
      // Si la acción redirige, este código no llega a ejecutarse
      if (result?.error) setError(result.error)
      if (result?.success) setSuccess(true)
    })
  }
  return { onSubmit, error, loading, success }
}

function InputRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
      {children}
    </div>
  )
}

function PasswordInput({ autoComplete, placeholder = 'Contraseña' }: { autoComplete: string; placeholder?: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <InputRow icon={<Lock size={18} />}>
      <input name="password" type={visible ? 'text' : 'password'} required minLength={8} autoComplete={autoComplete} placeholder={placeholder} aria-label={placeholder} className="field pl-11 pr-12" />
      <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink">
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </InputRow>
  )
}

function EmailInput() {
  return (
    <InputRow icon={<Mail size={18} />}>
      <input name="email" type="email" required autoComplete="email" placeholder="tu@email.com" aria-label="Email" className="field pl-11" />
    </InputRow>
  )
}

function FormError({ text }: { text: string | null }) {
  if (!text) return null
  return <p className="animate-rise rounded-2xl bg-bad/10 px-4 py-3 text-sm font-medium text-bad" role="alert">{text}</p>
}

export function LoginForm() {
  const params = useSearchParams()
  const { onSubmit, error, loading } = useAuthAction(login)
  const linkError = params.get('error') === 'enlace' ? 'El enlace venció o ya se usó. Inicia sesión o pide uno nuevo.' : null
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <EmailInput />
      <PasswordInput autoComplete="current-password" />
      <FormError text={error ?? linkError} />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</Button>
      <p className="text-center text-sm">
        <Link href="/recuperar" className="font-semibold text-accent hover:underline">¿Olvidaste tu contraseña?</Link>
      </p>
    </form>
  )
}

export function SignupForm() {
  const { onSubmit, error, loading } = useAuthAction(signup)
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InputRow icon={<User size={18} />}>
        <input name="fullName" required autoComplete="name" placeholder="Tu nombre" aria-label="Tu nombre" className="field pl-11" />
      </InputRow>
      <EmailInput />
      <PasswordInput autoComplete="new-password" placeholder="Contraseña (mínimo 8 caracteres)" />
      <FormError text={error} />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Creando tu cuenta…' : 'Crear cuenta gratis'}</Button>
    </form>
  )
}

export function ForgotPasswordForm() {
  const { onSubmit, error, loading, success } = useAuthAction(resetPassword)
  if (success) {
    return <p className="rounded-2xl bg-ok/10 px-4 py-4 text-center font-medium text-ok">📬 Listo. Revisa tu email: te enviamos un enlace para crear una contraseña nueva.</p>
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <EmailInput />
      <FormError text={error} />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Enviando…' : 'Enviarme el enlace'}</Button>
    </form>
  )
}

export function UpdatePasswordForm() {
  const { onSubmit, error, loading } = useAuthAction(updatePassword)
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PasswordInput autoComplete="new-password" placeholder="Contraseña nueva (mínimo 8)" />
      <FormError text={error} />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Guardando…' : 'Guardar contraseña'}</Button>
    </form>
  )
}
