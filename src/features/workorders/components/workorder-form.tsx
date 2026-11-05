'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { Chips, ClientSelect, ErrorText } from '@/shared/components/form-bits'
import { Button, Field, Modal } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { amountSchema, required, validate, type FieldErrors } from '@/shared/lib/validation'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi, type ModalPayload } from '@/shared/stores/ui-store'
import type { WorkOrderStatus } from '@/shared/types/crm'

export const WORK_STATUS: Record<WorkOrderStatus, { label: string; short: string; emoji: string }> = {
  recibido: { label: 'Recibido', short: 'Recibido', emoji: '📥' },
  en_proceso: { label: 'En proceso', short: 'En proceso', emoji: '🛠️' },
  listo: { label: 'Listo para entregar', short: 'Listo', emoji: '✅' },
  entregado: { label: 'Entregado', short: 'Entregado', emoji: '🤝' },
}

const schema = z.object({
  clientId: required(''),
  title: required('qué hay que hacer'),
  price: amountSchema,
})

export function WorkOrderForm({ payload, onClose }: { payload: ModalPayload; onClose: () => void }) {
  const { workOrders, clients, add, update, remove } = useCrm()
  const notify = useUi((s) => s.notify)
  const { preset } = useBusiness()
  const existing = workOrders.find((w) => w.id === payload.id)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState({
    clientId: existing?.clientId ?? payload.clientId ?? '',
    title: existing?.title ?? '',
    reference: existing?.reference ?? '',
    detail: existing?.detail ?? '',
    price: String(existing?.price ?? ''),
    status: existing?.status ?? ('recibido' as WorkOrderStatus),
  })

  const pickClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    const ref = client?.customFields.patente || client?.customFields.vehiculo || form.reference
    setForm({ ...form, clientId, reference: ref })
  }

  const save = () => {
    const result = validate(schema, form)
    if (!result.ok) return setErrors({ ...result.errors, clientId: result.errors.clientId && `Elige un ${preset.client.one.toLowerCase()}` })
    const data = { ...form, price: result.data.price, reference: form.reference || undefined, detail: form.detail || undefined }
    if (existing) update('workOrders', existing.id, data)
    else add('workOrders', { ...data, createdAt: new Date().toISOString() })
    notify(existing ? 'Cambios guardados' : 'Orden creada')
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={existing ? `Editar ${preset.workOrderLabel.toLowerCase()}` : `Nueva ${preset.workOrderLabel.toLowerCase()}`}
      footer={
        <>
          {existing && (
            <Button variant="danger" className="mr-auto" icon={<Trash2 size={18} />} onClick={() => (remove('workOrders', existing.id), notify('Eliminada'), onClose())}>
              Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label={preset.client.one}>
          <ClientSelect value={form.clientId} onChange={pickClient} />
          <ErrorText text={errors.clientId} />
        </Field>
        <Field label="¿Qué hay que hacer?">
          <input className="field" placeholder="Ej: Cambio de pastillas de freno" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <ErrorText text={errors.title} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Referencia" hint="Patente, equipo, etc.">
            <input className="field" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </Field>
          <Field label="Presupuesto">
            <input className="field font-semibold" inputMode="decimal" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <ErrorText text={errors.price} />
          </Field>
        </div>
        <Field label="Detalle (opcional)">
          <textarea rows={3} className="field resize-none" value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
        </Field>
        <Field label="Estado">
          <Chips
            value={form.status}
            onChange={(status) => setForm({ ...form, status })}
            options={(Object.keys(WORK_STATUS) as WorkOrderStatus[]).map((k) => ({ value: k, label: `${WORK_STATUS[k].emoji} ${WORK_STATUS[k].label}` }))}
          />
        </Field>
      </div>
    </Modal>
  )
}
