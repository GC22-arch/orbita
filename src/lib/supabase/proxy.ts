import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieToSet = { name: string; value: string; options: CookieOptions }

/** Rutas que se ven sin cuenta. Todo lo demás requiere iniciar sesión. */
const PUBLIC_ROUTES = ['/login', '/registro', '/revisa-tu-email', '/recuperar', '/callback']
/** Rutas de acceso: si ya hay sesión, no tiene sentido mostrarlas */
const AUTH_ONLY_ROUTES = ['/login', '/registro', '/revisa-tu-email']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_ROUTES.some((r) => path.startsWith(r))

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (user && AUTH_ONLY_ROUTES.some((r) => path.startsWith(r))) {
    return NextResponse.redirect(new URL('/inicio', request.url))
  }

  return supabaseResponse
}
