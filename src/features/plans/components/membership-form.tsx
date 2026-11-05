'use client'

import { Layers, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Chips, ClientSelect, ErrorText } from '@/shared/components/form-bits'
import { Button, EmptyState, Field, Modal } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { addDays, toDateInput } from '@/shared/lib/format'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi, type ModalPayload } from '@/shared/stores/ui-store'

export function MembershipForm({ payload, onClose }: { payload: ModalPayload; onClose: () => void }) {
  const { memberships, plans, add, update, remove } = useCrm()
  const notify = useUi((s) => s.notify)
  const { preset, money } = useBusiness()
  const existing = memberships.find((m) => m.id === payload.id)
  const [error, setError] = useState('')
  const [charge, setCharge] = useState(!existing)
  const [form, setForm] = useState({
    clientId: existing?.clientId ?? payload.clientId ?? '',
    planId: existing?.planId ?? plans[0]?.id ?? '',
    startDate: toDateInput(existing?.startDate ?? new Date()),
  })
  const plan = plans.find((p) => p.id === form.planId)

  const save = () => {
    if (!form.clientId || !plan) return setError(`Elige un ${preset.client.one.toLowerCase()} y un plan`)
    const start = new Date(`${form.startDate}T12:00:00`)
    const data = {
      clientId: form.clientId,
      planId: plan.id,
      startDate: start.toISOString(),
      endDate: plan.kind === 'mensual' ? addDays(start, 30).toISOString() : undefined,
      sessionsLeft: plan.kind === 'sesiones' ? (existing?.planId === plan.id ? existing.sessionsLeft : plan.sessions) : undefined,
    }
    if (existing) update('memberships', existing.id, data)
    else add('memberships', data)
    if (charge) {
      add('payments', { kind: 'ingreso', clientId: form.clientId, concept: plan.name, amount: plan.price, method: 'efectivo', date: new Date().toISOString(), paid: true })
    }
    notify(existing ? 'Plan actualizado' : charge ? 'Plan activado y cobrado' : 'Plan activado')
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={existing ? 'Renovar o cambiar plan' : 'Activar plan'}
      subtitle="Cuotas mensuales o paquetes de sesiones"
      footer={
        <>
          {existing && (
            <Button variant="danger" className="mr-auto" icon={<Trash2 size={18} />} onClick={() => (remove('memberships', existing.id), notify('Plan quitado'), onClose())}>
              Quitar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!plans.length}>Guardar</Button>
        </>
      }
    >
      {plans.length === 0 ? (
        <EmptyState icon={<Layers size={28} />} title="Primero crea un plan" text="Ve a Planes y crea una cuota o un paquete de sesiones." />
      ) : (
        <div className="grid gap-4">
          <Field label={preset.client.one}>
            <ClientSelect value={form.clientId} onChange={(clientId) => setForm({ ...form, clientId })} />
          </Field>
          <Field label="Plan">
            <Chips
              value={form.planId}
              onChange={(planId) => setForm({ ...form, planId })}
              options={plans.map((p) => ({ value: p.id, label: `${p.name} · ${money(p.price)}` }))}
            />
          </Field>
          <Field label="Desde" hint={plan?.kind === 'mensual' ? 'Vence a los 30 días' : `Incluye ${plan?.sessions ?? 0} sesiones`}>
            <input type="date" className="field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-accent/5 px-4 py-3">
            <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--accent))]" checked={charge} onChange={(e) => setCharge(e.target.checked)} />
            <span className="font-medium">Registrar el cobro de {plan ? money(plan.price) : ''} en la caja</span>
          </label>
          <ErrorText text={error} />
        </div>
      )}
    </Modal>
  )
}
