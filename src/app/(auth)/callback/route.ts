import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Recibe el enlace del email (confirmación o nueva contraseña) y crea la sesión */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  // Solo rutas internas: evita redirecciones a sitios externos
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  const supabase = await createClient()

  // Enlaces propios (Resend): funcionan aunque se abran en otro dispositivo
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`)
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`)
  }

  return NextResponse.redirect(`${origin}/login?error=enlace`)
}
