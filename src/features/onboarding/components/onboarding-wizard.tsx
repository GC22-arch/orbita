'use client'

import { ArrowLeft, ArrowRight, Moon, Rocket, Sparkles, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuroraBackground, OrbitaLogo } from '@/shared/components/aurora-background'
import { ErrorText } from '@/shared/components/form-bits'
import { ThemeController } from '@/shared/components/theme-controller'
import { Button, Field, cn } from '@/shared/components/ui'
import { ACCENTS, BUSINESS_PRESETS, CURRENCIES } from '@/shared/constants/business-presets'
import { createBusiness, currentUser, fetchMyBusiness } from '@/shared/lib/business'
import { buildStarterData } from '@/shared/lib/demo-data'
import { useCrm } from '@/shared/stores/crm-store'
import { useSettings } from '@/shared/stores/settings-store'
import type { AccentKey, BusinessType } from '@/shared/types/crm'

const STEPS = ['Rubro', 'Datos', 'Estilo', 'Listo']

/** Si ya tiene negocio va al inicio; si no, propone su nombre de la cuenta */
function useOnboardingGuard(): boolean {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  useEffect(() => {
    let cancelled = false
    Promise.all([fetchMyBusiness(), currentUser()])
      .then(([business, user]) => {
        if (cancelled) return
        if (business) return router.replace('/inicio')
        const settings = useSettings.getState()
        settings.resetBusiness()
        const fullName = user?.user_metadata?.full_name
        if (typeof fullName === 'string') settings.set({ ownerName: fullName })
        setChecking(false)
      })
      .catch(() => !cancelled && setChecking(false))
    return () => {
      cancelled = true
    }
  }, [router])
  return checking
}

export function OnboardingWizard() {
  const settings = useSettings()
  const router = useRouter()
  const checking = useOnboardingGuard()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const next = () => {
    if (step === 1 && !settings.businessName.trim()) return setError('Escribe el nombre de tu negocio')
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  // El negocio arranca vacío: solo con los servicios y planes típicos del rubro, que se pueden editar
  const finish = async () => {
    setSaving(true)
    setError('')
    try {
      const { businessName, ownerName, businessType, currency, waTemplates } = settings
      const id = await createBusiness({ businessName: businessName.trim(), ownerName, businessType, currency, waTemplates })
      useCrm.setState({ businessId: id })
      await useCrm.getState().seed(buildStarterData(businessType))
      router.replace('/inicio')
    } catch (e) {
      console.error('[orbita] error al crear el negocio', JSON.stringify(e))
      setError('No pudimos crear tu negocio. Revisa tu conexión y vuelve a intentar.')
      setSaving(false)
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <ThemeController />
        <div className="animate-pulse"><OrbitaLogo size={64} /></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-8 sm:py-14">
      <ThemeController />
      <AuroraBackground />
      <div className="mb-8 flex items-center gap-3 animate-rise">
        <OrbitaLogo size={44} />
        <span className="font-display text-2xl font-bold">Orbita</span>
      </div>

      <div className="mb-6 flex items-center gap-2" aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
        {STEPS.map((label, i) => (
          <div key={label} className={cn('h-2 rounded-full transition-all duration-500', i === step ? 'w-10 bg-gradient-accent' : i < step ? 'w-6 bg-accent/50' : 'w-6 bg-ink/10')} />
        ))}
      </div>

      <div key={step} className="glass-strong w-full max-w-2xl animate-rise rounded-4xl p-6 sm:p-10">
        {step === 0 && <StepBusiness onPick={() => setStep(1)} />}
        {step === 1 && <StepData />}
        {step === 2 && <StepStyle />}
        {step === 3 && <StepFinish onFinish={finish} saving={saving} />}
        <ErrorText text={error} />

        {step > 0 && step < 3 && (
          <div className="mt-8 flex justify-between gap-3">
            <Button variant="ghost" icon={<ArrowLeft size={18} />} onClick={() => setStep(step - 1)}>Atrás</Button>
            <Button size="lg" onClick={next}>Seguir <ArrowRight size={18} /></Button>
          </div>
        )}
        {step === 3 && (
          <Button variant="ghost" className="mt-6" icon={<ArrowLeft size={18} />} onClick={() => setStep(2)}>Atrás</Button>
        )}
      </div>
    </div>
  )
}

function StepBusiness({ onPick }: { onPick: () => void }) {
  const { businessType, setBusinessType } = useSettings()
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">¡Hola! ¿Qué tipo de negocio tienes?</h1>
      <p className="mt-2 text-lg text-muted">Orbita se adapta solo: nombres, campos y secciones según tu rubro.</p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(Object.keys(BUSINESS_PRESETS) as BusinessType[]).map((type, i) => {
          const p = BUSINESS_PRESETS[type]
          return (
            <button
              key={type}
              type="button"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => (setBusinessType(type), onPick())}
              className={cn(
                'group animate-rise rounded-3xl border-2 p-4 text-left transition hover:-translate-y-1 hover:border-accent hover:shadow-glow',
                businessType === type ? 'border-accent bg-accent/5' : 'border-line bg-surface/50',
              )}
            >
              <span className="block text-4xl transition group-hover:scale-110">{p.emoji}</span>
              <span className="mt-3 block font-semibold">{p.name}</span>
              <span className="mt-0.5 block text-sm text-muted">{p.tagline}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepData() {
  const { businessName, ownerName, currency, businessType, set } = useSettings()
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Cuéntanos un poco más</h1>
      <p className="mt-2 text-lg text-muted">Lo puedes cambiar cuando quieras.</p>
      <div className="mt-8 grid gap-5">
        <Field label="¿Cómo se llama tu negocio?">
          <input autoFocus className="field text-lg" placeholder={`Ej: ${BUSINESS_PRESETS[businessType].name} San Martín`} value={businessName} onChange={(e) => set({ businessName: e.target.value })} />
        </Field>
        <Field label="¿Y tú cómo te llamas? (opcional)">
          <input className="field text-lg" placeholder="Para saludarte cada día" value={ownerName} onChange={(e) => set({ ownerName: e.target.value })} />
        </Field>
        <Field label="¿En qué moneda cobras?">
          <select className="field text-lg" value={currency} onChange={(e) => set({ currency: e.target.value })}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  )
}

export function ThemePicker() {
  const { theme, accent, set } = useSettings()
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3">
        {([
          { value: 'light', label: 'Claro', icon: <Sun size={22} />, preview: 'bg-[#f4f5fb]' },
          { value: 'dark', label: 'Oscuro', icon: <Moon size={22} />, preview: 'bg-[#070914]' },
        ] as const).map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => set({ theme: t.value })}
            className={cn('rounded-3xl border-2 p-3 text-left transition', theme === t.value ? 'border-accent shadow-glow' : 'border-line hover:border-ink/20')}
          >
            <div className={cn('relative mb-3 h-20 overflow-hidden rounded-2xl', t.preview)}>
              <div className="absolute -left-4 -top-6 h-20 w-20 rounded-full bg-gradient-accent opacity-60 blur-xl" />
              <div className={cn('absolute bottom-2 left-2 right-8 h-6 rounded-lg', t.value === 'light' ? 'bg-white/80' : 'bg-white/10')} />
            </div>
            <span className="flex items-center gap-2 font-semibold">{t.icon} {t.label}</span>
          </button>
        ))}
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold text-ink/80">Color principal</p>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
            <button
              key={key}
              type="button"
              title={ACCENTS[key].label}
              aria-label={ACCENTS[key].label}
              onClick={() => set({ accent: key })}
              style={{ background: `linear-gradient(135deg, rgb(${ACCENTS[key].rgb}), rgb(${ACCENTS[key].rgb2}))` }}
              className={cn('h-12 w-12 rounded-2xl transition hover:scale-110', accent === key && 'scale-110 ring-4 ring-ink/15 ring-offset-2 ring-offset-bg')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StepStyle() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Elige tu estilo</h1>
      <p className="mb-8 mt-2 text-lg text-muted">Mira cómo cambia todo al instante ✨</p>
      <ThemePicker />
    </div>
  )
}

function StepFinish({ onFinish, saving }: { onFinish: () => void; saving: boolean }) {
  const { businessName, businessType } = useSettings()
  const preset = BUSINESS_PRESETS[businessType]
  return (
    <div className="text-center">
      <div className="mx-auto grid h-20 w-20 animate-float place-items-center rounded-full bg-gradient-accent text-white shadow-glow">
        <Rocket size={36} />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">{businessName} ya está en órbita 🚀</h1>
      <p className="mx-auto mt-2 max-w-md text-lg text-muted">
        Dejamos listos los servicios y planes típicos de tu rubro. Ahora carga tus {preset.client.many.toLowerCase()} y
        tus {preset.appointment.many.toLowerCase()}: te guiamos paso a paso.
      </p>
      <Button size="lg" className="mt-8" icon={<Sparkles size={18} />} disabled={saving} onClick={onFinish}>
        {saving ? 'Preparando todo…' : 'Empezar a usar Orbita'}
      </Button>
    </div>
  )
}
