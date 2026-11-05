'use client'

import { ArrowRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { WhatsappButton } from '@/shared/components/whatsapp-button'
import { Button, PageHeader, cn } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { formatDate, whatsappUrl } from '@/shared/lib/format'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'
import type { WorkOrder, WorkOrderStatus } from '@/shared/types/crm'
import { WORK_STATUS } from './workorder-form'

const COLUMNS: WorkOrderStatus[] = ['recibido', 'en_proceso', 'listo', 'entregado']

export function WorkOrdersView() {
  const { workOrders, update } = useCrm()
  const { openModal, notify } = useUi()
  const { preset } = useBusiness()
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<WorkOrderStatus | null>(null)

  const moveTo = (order: WorkOrder, status: WorkOrderStatus) => {
    if (order.status === status) return
    update('workOrders', order.id, { status })
    if (status === 'entregado') {
      // Al entregar, ofrecemos cobrar en el mismo paso
      openModal('payment', { clientId: order.clientId, amount: order.price, concept: order.title })
    } else {
      notify(`Movido a “${WORK_STATUS[status].label}”`)
    }
  }

  return (
    <div>
      <PageHeader
        title="Trabajos"
        subtitle="Arrastra cada tarjeta a medida que avanza"
        actions={<Button icon={<Plus size={18} />} onClick={() => openModal('workorder')}>Nueva {preset.workOrderLabel.toLowerCase()}</Button>}
      />
      <div className="scroll-thin -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {COLUMNS.map((status) => {
          const items = workOrders.filter((w) => w.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          return (
            <section
              key={status}
              onDragOver={(e) => (e.preventDefault(), setOver(status))}
              onDragLeave={() => setOver(null)}
              onDrop={() => {
                const order = workOrders.find((w) => w.id === dragId)
                if (order) moveTo(order, status)
                setDragId(null)
                setOver(null)
              }}
              className={cn('glass flex min-h-[420px] w-[82vw] max-w-sm shrink-0 snap-start flex-col rounded-4xl p-3 transition sm:w-80 lg:w-auto lg:max-w-none', over === status && 'scale-[1.01] outline-dashed outline-2 outline-accent/50')}
            >
              <header className="mb-3 flex items-center gap-2 px-2 pt-1">
                <span className="text-xl">{WORK_STATUS[status].emoji}</span>
                <h2 className="flex-1 font-display font-semibold">{WORK_STATUS[status].label}</h2>
                <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-sm font-bold">{items.length}</span>
              </header>
              <div className="flex flex-1 flex-col gap-2.5">
                {items.map((w) => (
                  <OrderCard key={w.id} order={w} dragging={dragId === w.id} onDragStart={() => setDragId(w.id)} onAdvance={(s) => moveTo(w, s)} />
                ))}
                {!items.length && <p className="grid flex-1 place-items-center rounded-3xl border-2 border-dashed border-line/70 p-6 text-center text-sm text-muted">Suelta aquí</p>}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function OrderCard({ order, dragging, onDragStart, onAdvance }: { order: WorkOrder; dragging: boolean; onDragStart: () => void; onAdvance: (s: WorkOrderStatus) => void }) {
  const client = useCrm((s) => s.clients.find((c) => c.id === order.clientId))
  const openModal = useUi((s) => s.openModal)
  const { money } = useBusiness()
  const nextStatus = COLUMNS[COLUMNS.indexOf(order.status) + 1]

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onClick={() => openModal('workorder', { id: order.id })}
      className={cn('group cursor-grab animate-pop rounded-3xl border border-line/60 bg-surface/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-float active:cursor-grabbing', dragging && 'opacity-40')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold leading-snug">{order.title}</p>
        {order.reference && <span className="shrink-0 rounded-lg bg-ink/5 px-2 py-0.5 font-mono text-xs font-bold">{order.reference}</span>}
      </div>
      <p className="mt-1 text-sm text-muted">{client?.name} · {formatDate(order.createdAt)}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="flex-1 font-display font-bold">{money(order.price)}</span>
        {order.status === 'listo' && client && (
          <WhatsappButton compact label="Avisar que está listo" href={whatsappUrl(client.phone, `Hola ${client.name.split(' ')[0]}! Tu ${order.reference ?? 'trabajo'} ya está listo para retirar 🙌`)} className="h-9 w-9" />
        )}
        {nextStatus && (
          <button
            type="button"
            onClick={(e) => (e.stopPropagation(), onAdvance(nextStatus))}
            title={`Pasar a ${WORK_STATUS[nextStatus].label}`}
            className="flex h-9 items-center gap-1 rounded-xl bg-accent/10 px-3 text-sm font-semibold text-accent transition hover:bg-accent/20"
          >
            {WORK_STATUS[nextStatus].short} <ArrowRight size={15} />
          </button>
        )}
      </div>
    </article>
  )
}
