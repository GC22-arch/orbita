'use client'

import { Building2, Database, LogOut, MessageCircle, Palette, RotateCcw, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { signout } from '@/actions/auth'
import { currentUser, deleteBusiness } from '@/shared/lib/business'
import { ThemePicker } from '@/features/onboarding/components/onboarding-wizard'
import { Button, Card, Field, PageHeader, Segmented } from '@/shared/components/ui'
import { BUSINESS_PRESETS, CURRENCIES, DEFAULT_WA_TEMPLATES } from '@/shared/constants/business-presets'
import { fillTemplate } from '@/shared/lib/format'
import { useCrm } from '@/shared/stores/crm-store'
import { useSettings, type WaTemplates } from '@/shared/stores/settings-store'
import { useUi } from '@/shared/stores/ui-store'
import type { BusinessType, ThemeMode } from '@/shared/types/crm'

function Section({ icon, title, text, children }: { icon: ReactNode; title: string; text: string; children: ReactNode }) {
  return (
    <Card className="animate-rise p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent">{icon}</span>
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted">{text}</p>
        </div>
      </div>
      {children}
    </Card>
  )
}

export function SettingsView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Ajustes" subtitle="Todo se guarda solo, al instante" />
      <AppearanceSection />
      <BusinessSection />
      <MessagesSection />
      <AccountSection />
      <DataSection />
    </div>
  )
}

function AppearanceSection() {
  const { theme, set } = useSettings()
  return (
    <Section icon={<Palette size={20} />} title="Apariencia" text="Claro, oscuro o que siga al horario del dispositivo">
      <Segmented<ThemeMode>
        value={theme}
        onChange={(t) => set({ theme: t })}
        className="mb-6"
        options={[
          { value: 'light', label: '☀️ Claro' },
          { value: 'dark', label: '🌙 Oscuro' },
          { value: 'system', label: '🖥️ Automático' },
        ]}
      />
      <ThemePicker />
    </Section>
  )
}

function BusinessSection() {
  const { businessName, ownerName, currency, businessType, set, setBusinessType } = useSettings()
  return (
    <Section icon={<Building2 size={20} />} title="Mi negocio" text="Cambiar el rubro adapta nombres, campos y secciones">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del negocio">
          <input className="field" value={businessName} onChange={(e) => set({ businessName: e.target.value })} />
        </Field>
        <Field label="Tu nombre">
          <input className="field" value={ownerName} onChange={(e) => set({ ownerName: e.target.value })} />
        </Field>
        <Field label="Rubro">
          <select className="field" value={businessType} onChange={(e) => setBusinessType(e.target.value as BusinessType)}>
            {(Object.keys(BUSINESS_PRESETS) as BusinessType[]).map((t) => (
              <option key={t} value={t}>{BUSINESS_PRESETS[t].emoji} {BUSINESS_PRESETS[t].name}</option>
            ))}
          </select>
        </Field>
        <Field label="Moneda">
          <select className="field" value={currency} onChange={(e) => set({ currency: e.target.value })}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>
    </Section>
  )
}

const MESSAGE_FIELDS: { key: keyof WaTemplates; label: string; vars: string }[] = [
  { key: 'reminder', label: 'Recordatorio de turno', vars: '{nombre} {negocio} {turno} {fecha} {hora}' },
  { key: 'debt', label: 'Recordatorio de deuda', vars: '{nombre} {negocio} {monto}' },
  { key: 'expiry', label: 'Aviso de vencimiento de plan', vars: '{nombre} {negocio} {plan} {fecha}' },
]

const SAMPLE = { nombre: 'Ana', negocio: 'tu negocio', turno: 'turno', fecha: 'martes 4 de noviembre', hora: '10:30', monto: '$15.000', plan: 'Pase libre' }

function MessagesSection() {
  const { waTemplates, businessName, set } = useSettings()
  return (
    <Section icon={<MessageCircle size={20} />} title="Mensajes de WhatsApp" text="Se envían con un toque, ya escritos. Las palabras entre llaves se completan solas.">
      <div className="space-y-6">
        {MESSAGE_FIELDS.map((f) => (
          <div key={f.key}>
            <Field label={f.label} hint={`Puedes usar: ${f.vars}`}>
              <textarea rows={3} className="field resize-none" value={waTemplates[f.key]} onChange={(e) => set({ waTemplates: { ...waTemplates, [f.key]: e.target.value } })} />
            </Field>
            <div className="mt-2 max-w-md rounded-2xl rounded-tl-sm bg-[#25D366]/15 px-4 py-2.5 text-sm">
              {fillTemplate(waTemplates[f.key], { ...SAMPLE, negocio: businessName || SAMPLE.negocio })}
            </div>
          </div>
        ))}
        <Button variant="ghost" size="sm" icon={<RotateCcw size={16} />} onClick={() => set({ waTemplates: DEFAULT_WA_TEMPLATES })}>
          Volver a los mensajes originales
        </Button>
      </div>
    </Section>
  )
}

function AccountSection() {
  const [email, setEmail] = useState('')
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    currentUser().then((u) => setEmail(u?.email ?? ''))
  }, [])
  const leave = async () => {
    setLeaving(true)
    useCrm.getState().clear()
    await signout()
  }
  return (
    <Section icon={<UserRound size={20} />} title="Cuenta" text="Tus datos están guardados en la nube y protegidos">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold">{email}</span>
        <Button variant="soft" icon={<LogOut size={18} />} disabled={leaving} onClick={leave}>
          {leaving ? 'Saliendo…' : 'Cerrar sesión'}
        </Button>
      </div>
    </Section>
  )
}

function DataSection() {
  const notify = useUi((s) => s.notify)
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  const eraseAll = async () => {
    const id = useCrm.getState().businessId
    if (!id) return
    setBusy(true)
    try {
      await deleteBusiness(id)
      useCrm.getState().clear()
      useSettings.getState().resetBusiness()
      router.replace('/bienvenida')
    } catch {
      notify('No se pudo borrar. Intenta de nuevo.', 'bad')
      setBusy(false)
    }
  }

  return (
    <Section icon={<Database size={20} />} title="Datos" text="Todo se guarda solo en la nube">
      <div className="flex flex-wrap gap-3">
        {confirm ? (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-bad/10 px-4 py-2">
            <span className="text-sm font-semibold text-bad">¿Borrar el negocio y todos sus datos? No se puede deshacer.</span>
            <Button size="sm" variant="danger" disabled={busy} onClick={eraseAll}>Sí, borrar</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>Cancelar</Button>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirm(true)}>Borrar todo</Button>
        )}
      </div>
    </Section>
  )
}
