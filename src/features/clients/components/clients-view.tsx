'use client'

import { Search, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { WhatsappButton } from '@/shared/components/whatsapp-button'
import { Avatar, Badge, Button, Card, EmptyState, PageHeader, Segmented } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { useWhatsapp } from '@/shared/hooks/use-whatsapp'
import { formatDate, normalize } from '@/shared/lib/format'
import { debtByClient, membershipState } from '@/shared/lib/insights'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'

type Filter = 'todos' | 'deben' | 'plan' | 'nuevos'

export function ClientsView() {
  const { clients, payments, memberships, plans, appointments } = useCrm()
  const { openModal, openClient } = useUi()
  const { preset, money } = useBusiness()
  const wa = useWhatsapp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('todos')

  const debts = useMemo(() => debtByClient(payments), [payments])
  const lastVisit = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of appointments) if (a.status === 'asistio' && (map.get(a.clientId) ?? '') < a.start) map.set(a.clientId, a.start)
    return map
  }, [appointments])

  const rows = useMemo(() => {
    const q = normalize(query.trim())
    const monthAgo = Date.now() - 30 * 86_400_000
    return clients
      .filter((c) => !q || normalize([c.name, c.phone, c.email ?? '', ...Object.values(c.customFields)].join(' ')).includes(q))
      .filter((c) => {
        if (filter === 'deben') return debts.has(c.id)
        if (filter === 'plan') return memberships.some((m) => m.clientId === c.id)
        if (filter === 'nuevos') return new Date(c.createdAt).getTime() > monthAgo
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [clients, query, filter, debts, memberships])

  const keyField = preset.customFields[0]

  return (
    <div>
      <PageHeader
        title={preset.client.many}
        subtitle={`${clients.length} en total`}
        actions={<Button icon={<UserPlus size={18} />} onClick={() => openModal('client')}>Nuevo {preset.client.one.toLowerCase()}</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="glass flex h-12 flex-1 items-center gap-3 rounded-2xl px-4">
          <Search size={18} className="text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Buscar por nombre, teléfono o ${keyField?.label.toLowerCase() ?? 'dato'}…`} className="h-full flex-1 bg-transparent outline-none placeholder:text-muted/70" />
        </label>
        <Segmented
          value={filter}
          onChange={setFilter}
          className="glass overflow-x-auto"
          options={[
            { value: 'todos', label: 'Todos' },
            { value: 'deben', label: 'Deben' },
            { value: 'plan', label: 'Con plan' },
            { value: 'nuevos', label: 'Nuevos' },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={28} />}
            title={clients.length ? 'Sin resultados' : `Todavía no hay ${preset.client.many.toLowerCase()}`}
            text={clients.length ? 'Prueba con otra búsqueda o filtro.' : `Agrega tu primer ${preset.client.one.toLowerCase()}: solo necesitas nombre y teléfono.`}
            action={!clients.length && <Button onClick={() => openModal('client')}>Agregar</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((c, i) => {
            const debt = debts.get(c.id)
            const m = memberships.find((x) => x.clientId === c.id)
            const mState = m ? membershipState(m, plans.find((p) => p.id === m.planId)).state : undefined
            const last = lastVisit.get(c.id)
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => openClient(c.id)}
                onKeyDown={(e) => e.key === 'Enter' && openClient(c.id)}
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                className="glass group flex animate-rise cursor-pointer items-center gap-3 rounded-3xl p-4 transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.name}</p>
                  <p className="truncate text-sm text-muted">
                    {keyField && c.customFields[keyField.key] ? `${c.customFields[keyField.key]} · ` : ''}
                    {last ? `Última vez ${formatDate(last)}` : c.phone}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {debt ? <Badge tone="bad">Debe {money(debt)}</Badge> : null}
                    {mState && <Badge tone={mState === 'activa' ? 'ok' : mState === 'por_vencer' ? 'warn' : 'bad'}>{mState === 'activa' ? 'Plan al día' : mState === 'por_vencer' ? 'Plan por vencer' : 'Plan vencido'}</Badge>}
                  </div>
                </div>
                <WhatsappButton href={wa.chat(c)} compact label={`WhatsApp a ${c.name}`} className="opacity-80 group-hover:opacity-100" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
