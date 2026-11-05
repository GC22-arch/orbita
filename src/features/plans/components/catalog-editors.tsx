'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { Chips, ErrorText } from '@/shared/components/form-bits'
import { Button, Field, Modal, cn } from '@/shared/components/ui'
import { ACCENTS } from '@/shared/constants/business-presets'
import { amountSchema, required, validate, type FieldErrors } from '@/shared/lib/validation'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'
import type { AccentKey } from '@/shared/types/crm'

const planSchema = z.object({
  name: required('el nombre'),
  price: amountSchema,
  kind: z.enum(['mensual', 'sesiones']),
  sessions: z.coerce.number().int().min(1, 'Mínimo 1 sesión').optional(),
})

export function PlanEditor({ id, onClose }: { id?: string; onClose: () => void }) {
  const { plans, add, update, remove } = useCrm()
  const notify = useUi((s) => s.notify)
  const existing = plans.find((p) => p.id === id)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    price: String(existing?.price ?? ''),
    kind: existing?.kind ?? ('mensual' as 'mensual' | 'sesiones'),
    sessions: String(existing?.sessions ?? 4),
  })

  const save = () => {
    const result = validate(planSchema, { ...form, sessions: form.kind === 'sesiones' ? form.sessions : undefined })
    if (!result.ok) return setErrors(result.errors)
    if (existing) update('plans', existing.id, result.data)
    else add('plans', result.data)
    notify('Plan guardado')
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={existing ? 'Editar plan' : 'Nuevo plan'}
      footer={
        <>
          {existing && (
            <Button variant="danger" className="mr-auto" icon={<Trash2 size={18} />} onClick={() => (remove('plans', existing.id), onClose())}>Eliminar</Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Tipo de plan">
          <Chips value={form.kind} onChange={(kind) => setForm({ ...form, kind })} options={[{ value: 'mensual', label: '📅 Cuota mensual' }, { value: 'sesiones', label: '🎟️ Paquete de sesiones' }]} />
        </Field>
        <Field label="Nombre">
          <input autoFocus className="field" placeholder="Ej: Pase libre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <ErrorText text={errors.name} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio">
            <input className="field font-semibold" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <ErrorText text={errors.price} />
          </Field>
          {form.kind === 'sesiones' && (
            <Field label="Cantidad de sesiones">
              <input type="number" min={1} className="field" value={form.sessions} onChange={(e) => setForm({ ...form, sessions: e.target.value })} />
              <ErrorText text={errors.sessions} />
            </Field>
          )}
        </div>
      </div>
    </Modal>
  )
}

const serviceSchema = z.object({
  name: required('el nombre'),
  price: amountSchema,
  durationMin: z.coerce.number().int().min(5, 'Mínimo 5 minutos'),
  color: z.string(),
})

export function ServiceEditor({ id, onClose }: { id?: string; onClose: () => void }) {
  const { services, add, update, remove } = useCrm()
  const notify = useUi((s) => s.notify)
  const existing = services.find((s) => s.id === id)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    price: String(existing?.price ?? ''),
    durationMin: String(existing?.durationMin ?? 60),
    color: existing?.color ?? 'violeta',
  })

  const save = () => {
    const result = validate(serviceSchema, form)
    if (!result.ok) return setErrors(result.errors)
    if (existing) update('services', existing.id, result.data)
    else add('services', result.data)
    notify('Servicio guardado')
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={existing ? 'Editar servicio' : 'Nuevo servicio'}
      footer={
        <>
          {existing && (
            <Button variant="danger" className="mr-auto" icon={<Trash2 size={18} />} onClick={() => (remove('services', existing.id), onClose())}>Eliminar</Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Nombre del servicio">
          <input autoFocus className="field" placeholder="Ej: Limpieza facial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <ErrorText text={errors.name} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio">
            <input className="field font-semibold" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <ErrorText text={errors.price} />
          </Field>
          <Field label="Duración (minutos)">
            <input type="number" min={5} step={5} className="field" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} />
            <ErrorText text={errors.durationMin} />
          </Field>
        </div>
        <Field label="Color en la agenda">
          <div className="flex gap-3">
            {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-label={ACCENTS[key].label}
                onClick={() => setForm({ ...form, color: key })}
                style={{ background: `rgb(${ACCENTS[key].rgb})` }}
                className={cn('h-10 w-10 rounded-full transition hover:scale-110', form.color === key && 'ring-4 ring-ink/15 ring-offset-2 ring-offset-bg')}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  )
}
