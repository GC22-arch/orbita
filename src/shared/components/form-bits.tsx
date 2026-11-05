'use client'

import { useMemo } from 'react'
import { useBusiness } from '@/shared/hooks/use-business'
import { useCrm } from '@/shared/stores/crm-store'
import { cn } from './ui'

export function ErrorText({ text }: { text?: string }) {
  if (!text) return null
  return <span className="mt-1 block text-sm font-medium text-bad">{text}</span>
}

export function ClientSelect({ value, onChange, optional }: { value: string; onChange: (id: string) => void; optional?: boolean }) {
  const clients = useCrm((s) => s.clients)
  const { preset } = useBusiness()
  const sorted = useMemo(() => [...clients].sort((a, b) => a.name.localeCompare(b.name)), [clients])
  return (
    <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{optional ? 'Sin asignar' : `Elegir ${preset.client.one.toLowerCase()}…`}</option>
      {sorted.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}

interface ChipsProps<T extends string> {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

/** Botones grandes en lugar de listas desplegables: más fáciles de tocar */
export function Chips<T extends string>({ value, options, onChange }: ChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-2xl border px-4 py-2.5 text-sm font-semibold transition active:scale-95',
            value === o.value ? 'border-accent bg-accent/10 text-accent' : 'border-line text-ink/70 hover:border-ink/20',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
