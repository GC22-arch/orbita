'use client'

import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { AppointmentForm } from '@/features/agenda/components/appointment-form'
import { PaymentForm } from '@/features/cash/components/payment-form'
import { ClientDetail } from '@/features/clients/components/client-detail'
import { ClientForm } from '@/features/clients/components/client-form'
import { MembershipForm } from '@/features/plans/components/membership-form'
import { WorkOrderForm } from '@/features/workorders/components/workorder-form'
import { AuroraBackground, OrbitaLogo } from '@/shared/components/aurora-background'
import { CommandSearch } from '@/shared/components/command-search'
import { BottomDock, SideDock } from '@/shared/components/nav-dock'
import { QuickActions } from '@/shared/components/quick-actions'
import { ThemeController } from '@/shared/components/theme-controller'
import { Toast } from '@/shared/components/toast'
import { TopBar } from '@/shared/components/top-bar'
import { Button } from '@/shared/components/ui'
import { useWorkspace } from '@/shared/hooks/use-workspace'
import { useUi } from '@/shared/stores/ui-store'

function GlobalModals() {
  const modal = useUi((s) => s.modal)
  const close = useUi((s) => s.closeModal)
  if (!modal) return null
  const { type, payload } = modal
  // key fuerza un formulario limpio cada vez que se abre
  const key = `${type}-${payload.id ?? 'new'}-${payload.clientId ?? ''}`
  if (type === 'client') return <ClientForm key={key} id={payload.id} onClose={close} />
  if (type === 'appointment') return <AppointmentForm key={key} payload={payload} onClose={close} />
  if (type === 'payment') return <PaymentForm key={key} payload={payload} onClose={close} />
  if (type === 'workorder') return <WorkOrderForm key={key} payload={payload} onClose={close} />
  return <MembershipForm key={key} payload={payload} onClose={close} />
}

export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="animate-pulse">
        <OrbitaLogo size={64} />
      </div>
    </div>
  )
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <OrbitaLogo size={56} />
        <h1 className="mt-4 font-display text-2xl font-bold">No pudimos cargar tu negocio</h1>
        <p className="mt-2 text-muted">Revisa tu conexión a internet y vuelve a intentar.</p>
        <Button className="mt-6" onClick={onRetry}>Reintentar</Button>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { status, retry } = useWorkspace()
  const router = useRouter()

  useEffect(() => {
    if (status === 'no-business') router.replace('/bienvenida')
  }, [status, router])

  if (status === 'error') return <LoadError onRetry={retry} />
  if (status !== 'ready') return <Splash />
  return (
    <>
      <ThemeController />
      <AuroraBackground />
      <SideDock />
      <div className="min-h-dvh lg:pl-[116px]">
        <TopBar />
        <main className="mx-auto max-w-[1400px] px-4 pb-36 pt-4 sm:px-6 lg:px-8 lg:pb-16">{children}</main>
      </div>
      <BottomDock />
      <QuickActions />
      <ClientDetail />
      <GlobalModals />
      <CommandSearch />
      <Toast />
    </>
  )
}
