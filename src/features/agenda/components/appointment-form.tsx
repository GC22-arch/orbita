'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { z } from 'zod'
import { Chips, ClientSelect, ErrorText } from '@/shared/components/form-bits'
import { Button, Field, Modal } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { formatTime, fromDateTimeInputs, toDateInput, toTimeInput } from '@/shared/lib/format'
import { required, validate, type FieldErrors } from '@/shared/lib/validation'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi, type ModalPayload } from '@/shared/stores/ui-store'
import type { AppointmentStatus } from '@/shared/types/crm'
import { STATUS_META } from './status-meta'

const schema = z.object({
  clientId: required(''),
  date: required('la fecha'),
  time: required('la hora'),
  durationMin: z.coerce.number().min(5, 'Mínimo 5 minutos'),
})

function defaultStart(): Date {
  const d = new Date()
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0)
  return d
}

export function AppointmentForm({ payload, onClose }: { payload: ModalPayload; onClose: () => void }) {
  const { appointments, services, add, update, remove } = useCrm()
  const notify = useUi((s) => s.notify)
  const { preset, money } = useBusiness()
  const existing = appointments.find((a) => a.id === payload.id)
  const start = existing?.start ?? payload.start ?? defaultStart().toISOString()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState({
    clientId: existing?.clientId ?? payload.clientId ?? '',
    serviceId: existing?.serviceId ?? services[0]?.id ?? '',
    date: toDateInput(start),
    time: toTimeInput(start),
    durationMin: String(existing?.durationMin ?? services[0]?.durationMin ?? 60),
    status: existing?.status ?? ('confirmado' as AppointmentStatus),
    notes: existing?.notes ?? '',
  })

  const clash = useMemo(() => {
    if (!form.date || !form.time) return undefined
    const s = new Date(fromDateTimeInputs(form.date, form.time)).getTime()
    const e = s + Number(form.durationMin) * 60_000
    return appointments.find((a) => {
      if (a.id === existing?.id || a.status === 'cancelado') return false
      const as = new Date(a.start).getTime()
      return as < e && as + a.durationMin * 60_000 > s
    })
  }, [appointments, form.date, form.time, form.durationMin, existing?.id])

  const save = () => {
    const result = validate(schema, form)
    if (!result.ok) return setErrors({ ...result.errors, clientId: result.errors.clientId && `Elige un ${preset.client.one.toLowerCase()}` })
    const data = {
      clientId: form.clientId,
      serviceId: form.serviceId || undefined,
      start: fromDateTimeInputs(form.date, form.time),
      durationMin: result.data.durationMin,
      status: form.status,
      notes: form.notes || undefined,
    }
    if (existing) update('appointments', existing.id, data)
    else add('appointments', data)
    notify(existing ? 'Cambios guardados' : `${preset.appointment.one} agendado`)
    onClose()
  }

  const pickService = (id: string) => {
    const svc = services.find((s) => s.id === id)
    setForm({ ...form, serviceId: id, durationMin: String(svc?.durationMin ?? form.durationMin) })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={existing ? `Editar ${preset.appointment.one.toLowerCase()}` : `Nuevo ${preset.appointment.one.toLowerCase()}`}
      footer={
        <>
          {existing && (
            <Button variant="danger" className="mr-auto" icon={<Trash2 size={18} />} onClick={() => (remove('appointments', existing.id), notify('Eliminado'), onClose())}>
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
          <ClientSelect value={form.clientId} onChange={(clientId) => setForm({ ...form, clientId })} />
          <ErrorText text={errors.clientId} />
        </Field>
        {services.length > 0 && (
          <Field label="Servicio">
            <Chips
              value={form.serviceId}
              onChange={pickService}
              options={services.map((s) => ({ value: s.id, label: `${s.name} · ${money(s.price)}` }))}
            />
          </Field>
        )}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Día">
            <input type="date" className="field px-3" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Hora">
            <input type="time" step={900} className="field px-3" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
          <Field label="Minutos">
            <input type="number" min={5} step={5} className="field px-3" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} />
          </Field>
        </div>
        <ErrorText text={errors.date ?? errors.time ?? errors.durationMin} />
        {clash && (
          <div className="flex items-center gap-2 rounded-2xl bg-warn/10 px-4 py-3 text-sm font-medium text-warn">
            <AlertTriangle size={18} /> Ya hay otro {preset.appointment.one.toLowerCase()} a las {formatTime(clash.start)}. Puedes guardarlo igual.
          </div>
        )}
        {existing && (
          <Field label="Estado">
            <Chips
              value={form.status}
              onChange={(status) => setForm({ ...form, status })}
              options={(Object.keys(STATUS_META) as AppointmentStatus[]).map((k) => ({ value: k, label: STATUS_META[k].label }))}
            />
          </Field>
        )}
        <Field label="Notas (opcional)">
          <textarea rows={2} className="field resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </div>
    </Modal>
  )
}
