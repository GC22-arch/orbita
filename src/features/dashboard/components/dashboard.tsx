'use client'

import { BarChart3, Cake, CalendarClock, CalendarDays, Check, HandCoins, Hourglass, LayoutGrid, Sparkles, Wallet, Wrench } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/shared/components/ui'
import { useBusiness } from '@/shared/hooks/use-business'
import { formatLongDate, greeting } from '@/shared/lib/format'
import { appointmentsOn, debtByClient, expiringMemberships } from '@/shared/lib/insights'
import { useCrm } from '@/shared/stores/crm-store'
import { useSettings } from '@/shared/stores/settings-store'
import type { WidgetKey } from '@/shared/types/crm'
import { GettingStarted } from './getting-started'
import { WidgetFrame } from './widget-frame'
import { NextUpWidget, TodayCount, TodayWidget } from './widgets-agenda'
import { BirthdaysWidget, CashWidget, DebtorsWidget, ExpiringWidget, MonthWidget, WorkOrdersWidget } from './widgets-business'

interface WidgetDef {
  title: (labels: { appointment: string; appointments: string }) => string
  icon: ReactNode
  render: () => ReactNode
  wide?: boolean
  hero?: boolean
  action?: () => ReactNode
}

const WIDGETS: Record<WidgetKey, WidgetDef> = {
  proximo: { title: (l) => `Próximo ${l.appointment.toLowerCase()}`, icon: <CalendarClock size={18} />, render: () => <NextUpWidget />, hero: true },
  hoy: { title: (l) => `${l.appointments} de hoy`, icon: <CalendarDays size={18} />, render: () => <TodayWidget />, action: () => <TodayCount /> },
  caja: { title: () => 'Caja', icon: <Wallet size={18} />, render: () => <CashWidget /> },
  deudores: { title: () => 'Quién te debe', icon: <HandCoins size={18} />, render: () => <DebtorsWidget /> },
  vencimientos: { title: () => 'Cuotas por vencer', icon: <Hourglass size={18} />, render: () => <ExpiringWidget /> },
  trabajos: { title: () => 'Trabajos en el taller', icon: <Wrench size={18} />, render: () => <WorkOrdersWidget /> },
  mes: { title: () => 'Cómo vienen los ingresos', icon: <BarChart3 size={18} />, render: () => <MonthWidget />, wide: true },
  cumples: { title: () => 'Cumpleaños', icon: <Cake size={18} />, render: () => <BirthdaysWidget /> },
}

function useSummary(): string {
  const { clients, appointments, payments, memberships, plans } = useCrm()
  const { preset } = useBusiness()
  if (!clients.length && !appointments.length) return `Empecemos: carga tus ${preset.client.many.toLowerCase()} y Orbita se encarga del resto.`
  const today = appointmentsOn(appointments, new Date()).filter((a) => a.status === 'confirmado' || a.status === 'pendiente').length
  const debtors = debtByClient(payments).size
  const expiring = expiringMemberships({ memberships, plans }).length
  const parts = [
    today ? `${today} ${today === 1 ? preset.appointment.one.toLowerCase() : preset.appointment.many.toLowerCase()} por atender` : '',
    debtors ? `${debtors} ${debtors === 1 ? 'persona que te debe' : 'personas que te deben'}` : '',
    expiring ? `${expiring} ${expiring === 1 ? 'plan por vencer' : 'planes por vencer'}` : '',
  ].filter(Boolean)
  if (!parts.length) return 'Hoy está todo en orden ✨'
  return `Hoy tienes ${parts.join(', ').replace(/, ([^,]*)$/, ' y $1')}.`
}

export function Dashboard() {
  const { widgets, hiddenWidgets, ownerName, set } = useSettings()
  const { preset, businessName } = useBusiness()
  const summary = useSummary()
  const [editing, setEditing] = useState(false)
  const [dragKey, setDragKey] = useState<WidgetKey | null>(null)
  const allowed = widgets.filter((k) => k !== 'trabajos' || preset.modules.includes('trabajos'))
  const visible = editing ? allowed : allowed.filter((k) => !hiddenWidgets.includes(k))
  const labels = { appointment: preset.appointment.one, appointments: preset.appointment.many }

  const move = (key: WidgetKey, target: number) => {
    const next = widgets.filter((k) => k !== key)
    next.splice(Math.max(0, Math.min(target, next.length)), 0, key)
    set({ widgets: next })
  }
  const toggle = (key: WidgetKey) =>
    set({ hiddenWidgets: hiddenWidgets.includes(key) ? hiddenWidgets.filter((k) => k !== key) : [...hiddenWidgets, key] })

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-rise">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <Sparkles size={16} /> {formatLongDate(new Date())}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {greeting()}
            {ownerName ? `, ${ownerName.split(' ')[0]}` : ''} <span className="inline-block origin-[70%_70%] animate-[float_2.5s_ease-in-out_infinite]">👋</span>
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-muted">
            {summary} <span className="hidden sm:inline">Esto es lo que pasa en {businessName}.</span>
          </p>
        </div>
        <Button variant={editing ? 'primary' : 'soft'} icon={editing ? <Check size={18} /> : <LayoutGrid size={18} />} onClick={() => setEditing((v) => !v)}>
          {editing ? 'Listo' : 'Personalizar'}
        </Button>
      </div>

      {!editing && <GettingStarted />}

      {editing && (
        <p className="mb-5 animate-rise rounded-3xl bg-accent/10 px-5 py-3 text-sm font-medium text-accent">
          Arrastra los widgets para ordenarlos (o usa las flechas). Toca el ojo para ocultar los que no uses.
        </p>
      )}

      <div className="grid grid-flow-dense gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((key, i) => {
          const def = WIDGETS[key]
          return (
            <WidgetFrame
              key={key}
              index={i}
              title={def.title(labels)}
              icon={def.icon}
              wide={def.wide}
              hero={def.hero}
              action={def.action?.()}
              editing={editing}
              hidden={hiddenWidgets.includes(key)}
              dragging={dragKey === key}
              onDragStart={() => setDragKey(key)}
              onDragEnter={() => dragKey && dragKey !== key && move(dragKey, widgets.indexOf(key))}
              onDragEnd={() => setDragKey(null)}
              onMove={(dir) => move(key, widgets.indexOf(key) + dir)}
              onToggle={() => toggle(key)}
            >
              {def.render()}
            </WidgetFrame>
          )
        })}
      </div>
    </div>
  )
}
