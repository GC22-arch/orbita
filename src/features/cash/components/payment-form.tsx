'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { Chips, ClientSelect, ErrorText } from '@/shared/components/form-bits'
import { Button, Field, Modal } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { toDateInput } from '@/shared/lib/format'
import { amountSchema, required, validate, type FieldErrors } from '@/shared/lib/validation'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi, type ModalPayload } from '@/shared/stores/ui-store'
import type { PaymentMethod } from '@/shared/types/crm'

const schema = z.object({
  concept: required('el concepto'),
  amount: amountSchema.refine((n) => n > 0, 'Escribe un monto mayor a cero'),
  date: required('la fecha'),
})

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
}

export function PaymentForm({ payload, onClose }: { payload: ModalPayload; onClose: () => void }) {
  const { payments, services, add, update, remove } = useCrm()
  const notify = useUi((s) => s.notify)
  const { preset, money } = useBusiness()
  const existing = payments.find((p) => p.id === payload.id)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState({
    kind: existing?.kind ?? payload.kind ?? ('ingreso' as const),
    clientId: existing?.clientId ?? payload.clientId ?? '',
    concept: existing?.concept ?? payload.concept ?? '',
    amount: String(existing?.amount ?? payload.amount ?? ''),
    method: existing?.method ?? ('efectivo' as PaymentMethod),
    date: toDateInput(existing?.date ?? new Date()),
    paid: existing?.paid ?? true,
  })
  const isIncome = form.kind === 'ingreso'

  const save = () => {
    const result = validate(schema, form)
    if (!result.ok) return setErrors(result.errors)
    const data = {
      kind: form.kind,
      clientId: isIncome ? form.clientId || undefined : undefined,
      concept: result.data.concept,
      amount: result.data.amount,
      method: form.method,
      date: new Date(`${form.date}T12:00:00`).toISOString(),
      paid: isIncome ? form.paid : true,
    }
    if (existing) update('payments', existing.id, data)
    else add('payments', data)
    notify(existing ? 'Cambios guardados' : isIncome ? (form.paid ? 'Cobro registrado' : 'Deuda anotada') : 'Gasto registrado')
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={existing ? 'Editar movimiento' : isIncome ? 'Registrar cobro' : 'Registrar gasto'}
      footer={
        <>
          {existing && (
            <Button variant="danger" className="mr-auto" icon={<Trash2 size={18} />} onClick={() => (remove('payments', existing.id), notify('Eliminado'), onClose())}>
              Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Chips
          value={form.kind}
          onChange={(kind) => setForm({ ...form, kind })}
          options={[
            { value: 'ingreso', label: '💰 Entra dinero' },
            { value: 'gasto', label: '💸 Sale dinero' },
          ]}
        />
        {isIncome && (
          <Field label={`${preset.client.one} (opcional)`}>
            <ClientSelect optional value={form.clientId} onChange={(clientId) => setForm({ ...form, clientId })} />
          </Field>
        )}
        {isIncome && services.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setForm({ ...form, concept: s.name, amount: String(s.price) })}
                className="rounded-xl bg-ink/5 px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:bg-accent/10 hover:text-accent"
              >
                {s.name} · {money(s.price)}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Concepto">
            <input className="field" placeholder={isIncome ? 'Ej: Consulta' : 'Ej: Insumos'} value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} />
            <ErrorText text={errors.concept} />
          </Field>
          <Field label="Monto">
            <input className="field text-lg font-semibold" inputMode="decimal" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <ErrorText text={errors.amount} />
          </Field>
        </div>
        <Field label="Medio de pago">
          <Chips value={form.method} onChange={(method) => setForm({ ...form, method })} options={Object.entries(METHOD_LABELS).map(([value, label]) => ({ value: value as PaymentMethod, label }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha">
            <input type="date" className="field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          {isIncome && (
            <Field label="¿Ya pagó?">
              <Chips
                value={form.paid ? 'si' : 'no'}
                onChange={(v) => setForm({ ...form, paid: v === 'si' })}
                options={[
                  { value: 'si', label: 'Sí' },
                  { value: 'no', label: 'Debe' },
                ]}
              />
            </Field>
          )}
        </div>
      </div>
    </Modal>
  )
}
