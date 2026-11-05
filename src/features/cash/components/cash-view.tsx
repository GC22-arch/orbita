'use client'

import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, HandCoins, Minus, Plus, Scale, Wallet } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Badge, Button, Card, EmptyState, IconButton, PageHeader, Segmented, cn } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { formatDate, isSameMonth } from '@/shared/lib/format'
import { monthCash } from '@/shared/lib/insights'
import { useCrm } from '@/shared/stores/crm-store'
import { useUi } from '@/shared/stores/ui-store'
import type { Payment } from '@/shared/types/crm'
import { METHOD_LABELS } from './payment-form'

type Filter = 'todo' | 'ingreso' | 'gasto' | 'deudas'

export function CashView() {
  const { payments, clients } = useCrm()
  const openModal = useUi((s) => s.openModal)
  const { money } = useBusiness()
  const [month, setMonth] = useState(() => new Date())
  const [filter, setFilter] = useState<Filter>('todo')

  const summary = monthCash(payments, month)
  const pending = payments.filter((p) => p.kind === 'ingreso' && !p.paid).reduce((a, p) => a + p.amount, 0)

  const groups = useMemo(() => {
    const list = payments
      .filter((p) => (filter === 'deudas' ? !p.paid : isSameMonth(p.date, month)))
      .filter((p) => filter === 'todo' || filter === 'deudas' || p.kind === filter)
      .sort((a, b) => b.date.localeCompare(a.date))
    const map = new Map<string, Payment[]>()
    for (const p of list) {
      const key = p.date.slice(0, 10)
      map.set(key, [...(map.get(key) ?? []), p])
    }
    return [...map.entries()]
  }, [payments, month, filter])

  const shiftMonth = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1))
  const monthLabel = formatDate(month.toISOString(), { month: 'long', year: 'numeric' })

  return (
    <div>
      <PageHeader
        title="Caja"
        subtitle="Todo lo que entra y sale, sin planillas"
        actions={
          <>
            <Button variant="soft" icon={<Minus size={18} />} onClick={() => openModal('payment', { kind: 'gasto' })}>Gasto</Button>
            <Button icon={<Plus size={18} />} onClick={() => openModal('payment')}>Registrar cobro</Button>
          </>
        }
      />

      <div className="mb-5 flex items-center gap-2">
        <IconButton label="Mes anterior" onClick={() => shiftMonth(-1)} className="glass"><ChevronLeft size={20} /></IconButton>
        <span className="inline-block min-w-[160px] text-center font-display text-lg font-semibold first-letter:uppercase">{monthLabel}</span>
        <IconButton label="Mes siguiente" onClick={() => shiftMonth(1)} className="glass"><ChevronRight size={20} /></IconButton>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard i={0} label="Entró" value={money(summary.income)} icon={<ArrowUpRight size={18} />} tone="text-ok bg-ok/10" />
        <StatCard i={1} label="Salió" value={money(summary.expense)} icon={<ArrowDownRight size={18} />} tone="text-bad bg-bad/10" />
        <StatCard i={2} label="Te queda" value={money(summary.balance)} icon={<Scale size={18} />} tone="text-white bg-gradient-accent" highlight />
        <StatCard i={3} label="Te deben" value={money(pending)} icon={<HandCoins size={18} />} tone="text-warn bg-warn/10" />
      </div>

      <Segmented
        value={filter}
        onChange={setFilter}
        className="glass mb-4"
        options={[
          { value: 'todo', label: 'Todo' },
          { value: 'ingreso', label: 'Cobros' },
          { value: 'gasto', label: 'Gastos' },
          { value: 'deudas', label: 'Deudas' },
        ]}
      />

      {groups.length === 0 ? (
        <Card>
          <EmptyState icon={<Wallet size={28} />} title="Nada por aquí" text="Cuando registres cobros o gastos, aparecerán aquí ordenados por día." action={<Button onClick={() => openModal('payment')}>Registrar cobro</Button>} />
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map(([day, items]) => (
            <Card key={day} className="p-3 sm:p-4">
              <p className="mb-1 px-2 text-sm font-semibold text-muted first-letter:uppercase">{formatDate(`${day}T12:00:00`, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <ul>
                {items.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId)
                  const income = p.kind === 'ingreso'
                  return (
                    <li key={p.id}>
                      <button type="button" onClick={() => openModal('payment', { id: p.id })} className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-ink/[0.04]">
                        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', income ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad')}>
                          {income ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{p.concept}</span>
                          <span className="block truncate text-sm text-muted">{[client?.name, METHOD_LABELS[p.method]].filter(Boolean).join(' · ')}</span>
                        </span>
                        {!p.paid && <Badge tone="warn">Debe</Badge>}
                        <span className={cn('font-display font-bold tabular-nums', income ? 'text-ok' : 'text-bad')}>
                          {income ? '+' : '−'}
                          {money(p.amount)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, tone, highlight, i }: { label: string; value: string; icon: ReactNode; tone: string; highlight?: boolean; i: number }) {
  return (
    <div style={{ animationDelay: `${i * 60}ms` }} className={cn('animate-rise rounded-4xl p-4 sm:p-5', highlight ? 'bg-gradient-accent text-white shadow-glow' : 'glass')}>
      <span className={cn('grid h-9 w-9 place-items-center rounded-xl', highlight ? 'bg-white/20' : tone)}>{icon}</span>
      <p className={cn('mt-3 text-sm font-medium', highlight ? 'text-white/80' : 'text-muted')}>{label}</p>
      <p className="truncate font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
    </div>
  )
}
