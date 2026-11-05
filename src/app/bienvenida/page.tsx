'use client'

import { Splash } from '../(main)/app-shell'
import { OnboardingWizard } from '@/features/onboarding/components/onboarding-wizard'
import { useHydrated } from '@/shared/hooks/use-business'

export default function BienvenidaPage() {
  const hydrated = useHydrated()
  return hydrated ? <OnboardingWizard /> : <Splash />
}
