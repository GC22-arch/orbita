'use client'

import { Clock, Layers, Plus, Sparkles, Ticket } from 'lucide-react'
import { useState } from 'react'
import { WhatsappButton } from '@/shared/components/whatsapp-button'
import { Avatar, Badge, Button, Card, EmptyState, PageHeader } from '@/shared/components/ui'
import { ACCENTS } from '@/shared/constants/business-presets'
import { useBusiness } from '@/shared/hooks/use-business'
import { useWhatsapp } from '@/shared/hooks/use-whatsapp'
import { membershipState } from '@/shared/lib/insights'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'
import type { AccentKey } from '@/shared/types/crm'
import { PlanEditor, ServiceEditor } from './catalog-editors'

type Editing = { kind: 'plan' | 'service'; id?: string } | null

export function PlansView() {
  const { plans, services, memberships } = useCrm()
  const openModal = useUi((s) => s.openModal)
  const { money } = useBusiness()
  const [editing, setEditing] = useState<Editing>(null)

  return (
    <div>
      <PageHeader
        title="Planes y servicios"
        subtitle="Lo que ofreces y cuánto cuesta"
        actions={<Button icon={<Sparkles size={18} />} onClick={() => openModal('membership')}>Activar plan a alguien</Button>}
      />

      <SectionTitle title="Planes y cuotas" onAdd={() => setEditing({ kind: 'plan' })} />
      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((p, i) => {
          const active = memberships.filter((m) => m.planId === p.id && membershipState(m, p).state !== 'vencida').length
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setEditing({ kind: 'plan', id: p.id })}
              style={{ animationDelay: `${i * 60}ms` }}
              className="glass group relative animate-rise overflow-hidden rounded-4xl p-6 text-left transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-accent opacity-20 blur-2xl transition group-hover:opacity-40" />
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/10 text-accent">{p.kind === 'mensual' ? <Layers size={20} /> : <Ticket size={20} />}</span>
              <p className="mt-4 font-display text-xl font-semibold">{p.name}</p>
              <p className="mt-1 font-display text-3xl font-bold text-gradient">{money(p.price)}</p>
              <p className="mt-1 text-sm text-muted">{p.kind === 'mensual' ? 'por mes' : `${p.sessions} sesiones`}</p>
              <Badge tone="accent" className="mt-4">{active} {active === 1 ? 'activo' : 'activos'}</Badge>
            </button>
          )
        })}
        {!plans.length && <AddCard text="Crea tu primera cuota o paquete" onClick={() => setEditing({ kind: 'plan' })} />}
      </div>

      <SectionTitle title="Servicios" onAdd={() => setEditing({ kind: 'service' })} />
      <Card className="mb-10 p-2">
        {services.length === 0 ? (
          <EmptyState icon={<Clock size={28} />} title="Sin servicios" text="Los servicios aparecen al agendar y al cobrar, con su precio ya cargado." />
        ) : (
          <ul>
            {services.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => setEditing({ kind: 'service', id: s.id })} className="flex w-full items-center gap-4 rounded-3xl px-4 py-3 text-left transition hover:bg-ink/[0.04]">
                  <span className="h-10 w-2 rounded-full" style={{ background: `rgb(${ACCENTS[s.color as AccentKey]?.rgb ?? ACCENTS.violeta.rgb})` }} />
                  <span className="flex-1 font-semibold">{s.name}</span>
                  <span className="flex items-center gap-1 text-sm text-muted"><Clock size={14} /> {s.durationMin} min</span>
                  <span className="w-28 text-right font-display font-bold">{money(s.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ActiveMemberships />

      {editing?.kind === 'plan' && <PlanEditor id={editing.id} onClose={() => setEditing(null)} />}
      {editing?.kind === 'service' && <ServiceEditor id={editing.id} onClose={() => setEditing(null)} />}
    </div>
  )
}

function SectionTitle({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <Button size="sm" variant="soft" icon={<Plus size={16} />} onClick={onAdd}>Agregar</Button>
    </div>
  )
}

function AddCard({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="grid min-h-[180px] place-items-center rounded-4xl border-2 border-dashed border-line text-muted transition hover:border-accent hover:text-accent">
      <span className="flex flex-col items-center gap-2 font-semibold"><Plus size={28} /> {text}</span>
    </button>
  )
}

function ActiveMemberships() {
  const { memberships, plans, clients } = useCrm()
  const openModal = useUi((s) => s.openModal)
  const wa = useWhatsapp()
  if (!memberships.length) return null
  const rows = memberships
    .map((m) => {
      const plan = plans.find((p) => p.id === m.planId)
      return { m, plan, client: clients.find((c) => c.id === m.clientId), ...membershipState(m, plan) }
    })
    .filter((r) => r.client)
    .sort((a, b) => (a.state === b.state ? 0 : a.state === 'vencida' ? -1 : a.state === 'por_vencer' && b.state === 'activa' ? -1 : 1))

  return (
    <>
      <h2 className="mb-4 font-display text-xl font-semibold">Quién tiene plan</h2>
      <Card className="p-2">
        <ul>
          {rows.map(({ m, plan, client, state, days }) => (
            <li key={m.id} className="flex items-center gap-3 rounded-3xl px-3 py-2.5 transition hover:bg-ink/[0.04]">
              <button type="button" onClick={() => openModal('membership', { id: m.id })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <Avatar name={client!.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{client!.name}</span>
                  <span className="block truncate text-sm text-muted">
                    {plan?.name} · {plan?.kind === 'sesiones' ? `${m.sessionsLeft ?? 0} sesiones restantes` : days !== undefined && days >= 0 ? `vence en ${days} días` : 'vencido'}
                  </span>
                </span>
                <Badge tone={state === 'activa' ? 'ok' : state === 'por_vencer' ? 'warn' : 'bad'}>{state === 'activa' ? 'Al día' : state === 'por_vencer' ? 'Por vencer' : 'Vencido'}</Badge>
              </button>
              {state !== 'activa' && <WhatsappButton compact label="Avisar" href={wa.expiry(client!, plan?.name ?? 'plan', m.endDate)} />}
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
