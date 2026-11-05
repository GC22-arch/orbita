'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/features/email/services/email-service'
import { ResetPasswordEmail } from '@/features/email/templates/reset-password-email'
import { WelcomeEmail } from '@/features/email/templates/welcome-email'
import { getResend } from '@/shared/lib/resend'

export type AuthResult = { error?: string; success?: boolean } | undefined

const emailSchema = z.string().trim().toLowerCase().email('Escribe un email válido')
const passwordSchema = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')

const credentialsSchema = z.object({ email: emailSchema, password: passwordSchema })

const SUPABASE_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'User already registered': 'Ya existe una cuenta con ese email. Prueba iniciar sesión.',
  'Email not confirmed': 'Primero confirma tu email: te enviamos un enlace.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
}

function translate(message: string): string {
  return SUPABASE_ERRORS[message] ?? 'Algo salió mal. Intenta de nuevo en un momento.'
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Revisa los datos'
}

async function siteUrl(): Promise<string> {
  const h = await headers()
  return process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`
}

export async function login(formData: FormData): Promise<AuthResult> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstIssue(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: translate(error.message) }

  revalidatePath('/', 'layout')
  redirect('/inicio')
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const schema = credentialsSchema.extend({ fullName: z.string().trim().min(1, 'Escribe tu nombre') })
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstIssue(parsed.error) }

  const { email, password, fullName } = parsed.data
  // La cuenta se crea ya confirmada: el email gratuito de Supabase no llega a clientes externos.
  // Cuando haya un proveedor de email propio (Resend), se puede volver a pedir confirmación.
  const { error: createError } = await createAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (createError) {
    const taken = createError.status === 422 || /already/i.test(createError.message)
    return { error: taken ? SUPABASE_ERRORS['User already registered'] : translate(createError.message) }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: translate(error.message) }

  // La bienvenida no debe frenar el alta: si falla, solo queda en el log
  await sendEmail({
    to: email,
    subject: '¡Bienvenido a Orbita! 🚀',
    react: WelcomeEmail({ name: fullName.split(' ')[0], appUrl: `${await siteUrl()}/inicio` }),
  }).catch(() => false)

  revalidatePath('/', 'layout')
  redirect('/bienvenida')
}

export async function signout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const parsed = emailSchema.safeParse(formData.get('email'))
  if (!parsed.success) return { error: firstIssue(parsed.error) }

  const base = await siteUrl()
  if (!getResend()) {
    // Sin Resend queda el email de Supabase (solo llega a miembros del equipo)
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${base}/callback?next=/nueva-clave`,
    })
    if (error) return { error: translate(error.message) }
    return { success: true }
  }

  const { data, error } = await createAdminClient().auth.admin.generateLink({
    type: 'recovery',
    email: parsed.data,
  })
  // Si el email no tiene cuenta respondemos igual "listo", para no revelar quién está registrado
  if (error || !data.properties?.hashed_token) return { success: true }

  const resetUrl = `${base}/callback?token_hash=${data.properties.hashed_token}&type=recovery&next=/nueva-clave`
  const sent = await sendEmail({
    to: parsed.data,
    subject: 'Crea tu contraseña nueva de Orbita',
    react: ResetPasswordEmail({ name: data.user.user_metadata?.full_name?.split(' ')[0], resetUrl }),
  })
  if (!sent) return { error: 'No pudimos enviar el email. Intenta de nuevo en un momento.' }
  return { success: true }
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const parsed = passwordSchema.safeParse(formData.get('password'))
  if (!parsed.success) return { error: firstIssue(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data })
  if (error) return { error: translate(error.message) }

  revalidatePath('/', 'layout')
  redirect('/inicio')
}
