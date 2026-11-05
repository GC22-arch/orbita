import { z } from 'zod'

export type FieldErrors = Record<string, string>

export function validate<T>(schema: z.ZodType<T>, data: unknown): { ok: true; data: T } | { ok: false; errors: FieldErrors } {
  const result = schema.safeParse(data)
  if (result.success) return { ok: true, data: result.data }
  const errors: FieldErrors = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form')
    errors[key] ??= issue.message
  }
  return { ok: false, errors }
}

export const required = (label: string) => z.string().trim().min(1, `Completa ${label}`)

export const amountSchema = z.coerce
  .number({ invalid_type_error: 'Escribe un monto válido' })
  .min(0, 'El monto no puede ser negativo')

export const phoneSchema = z
  .string()
  .trim()
  .min(6, 'Escribe un teléfono (con código de país para WhatsApp)')
  .regex(/^[+\d\s()-]+$/, 'Solo números, espacios y +')
