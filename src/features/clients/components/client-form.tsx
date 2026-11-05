'use client'

import { useState } from 'react'
import { z } from 'zod'
import { ErrorText } from '@/shared/components/form-bits'
import { Button, Field, Modal } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { toDateInput } from '@/shared/lib/format'
import { phoneSchema, required, validate, type FieldErrors } from '@/shared/lib/validation'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'

const schema = z.object({
  name: required('el nombre'),
  phone: phoneSchema,
  email: z.string().trim().email('Ese email no parece válido').or(z.literal('')),
  birthday: z.string(),
  notes: z.string(),
})

export function ClientForm({ id, onClose }: { id?: string; onClose: () => void }) {
  const existing = useCrm((s) => s.clients.find((c) => c.id === id))
  const { add, update } = useCrm()
  const { notify, openClient } = useUi()
  const { preset } = useBusiness()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    phone: existing?.phone ?? '',
    email: existing?.email ?? '',
    birthday: existing?.birthday ? toDateInput(existing.birthday) : '',
    notes: existing?.notes ?? '',
  })
  const [custom, setCustom] = useState<Record<string, string>>(existing?.customFields ?? {})

  const save = () => {
    const result = validate(schema, form)
    if (!result.ok) return setErrors(result.errors)
    const { birthday, email, notes, ...rest } = result.data
    const data = {
      ...rest,
      email: email || undefined,
      notes: notes || undefined,
      birthday: birthday ? new Date(`${birthday}T12:00:00`).toISOString() : undefined,
      customFields: custom,
    }
    if (existing) {
      update('clients', existing.id, data)
      notify('Cambios guardados')
    } else {
      const newId = add('clients', { ...data, createdAt: new Date().toISOString() })
      notify(`${preset.client.one} agregado`)
      onClose()
      return openClient(newId)
    }
    onClose()
  }

  const bind = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value }),
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={existing ? `Editar ${preset.client.one.toLowerCase()}` : `Nuevo ${preset.client.one.toLowerCase()}`}
      subtitle="Solo el nombre y el teléfono son obligatorios"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nombre y apellido">
            <input autoFocus className="field" placeholder="Ej: María Pérez" {...bind('name')} />
            <ErrorText text={errors.name} />
          </Field>
        </div>
        <Field label="Teléfono / WhatsApp" hint="Con código de país, ej: +54 9 11…">
          <input className="field" inputMode="tel" placeholder="+52 55 1234 5678" {...bind('phone')} />
          <ErrorText text={errors.phone} />
        </Field>
        <Field label="Email (opcional)">
          <input className="field" inputMode="email" placeholder="nombre@mail.com" {...bind('email')} />
          <ErrorText text={errors.email} />
        </Field>
        <Field label="Cumpleaños (opcional)">
          <input type="date" className="field" {...bind('birthday')} />
        </Field>
        {preset.customFields.map((f) => (
          <Field key={f.key} label={f.label}>
            <input
              className="field"
              placeholder={f.placeholder}
              value={custom[f.key] ?? ''}
              onChange={(e) => setCustom({ ...custom, [f.key]: e.target.value })}
            />
          </Field>
        ))}
        <div className="sm:col-span-2">
          <Field label="Notas">
            <textarea rows={3} className="field resize-none" placeholder="Preferencias, observaciones…" {...bind('notes')} />
          </Field>
        </div>
      </div>
    </Modal>
  )
}
