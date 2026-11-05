import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con service role: SOLO para el servidor (server actions / route handlers).
 * Nunca importarlo desde un componente 'use client'.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') throw new Error('createAdminClient solo puede usarse en el servidor')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
