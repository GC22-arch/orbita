'use client'

import { useCallback, useEffect, useState } from 'react'
import { BUSINESS_PRESETS } from '@/shared/constants/business-presets'
import { formatMoney } from '@/shared/lib/format'
import { useSettings } from '@/shared/stores/settings-store'

/** Vocabulario, módulos y formato de moneda según el rubro elegido */
export function useBusiness() {
  const businessType = useSettings((s) => s.businessType)
  const currency = useSettings((s) => s.currency)
  const businessName = useSettings((s) => s.businessName)
  const preset = BUSINESS_PRESETS[businessType]
  const money = useCallback((n: number) => formatMoney(n, currency), [currency])
  return { preset, money, businessName, currency, labels: { client: preset.client, appointment: preset.appointment } }
}

/** Evita diferencias entre servidor y navegador: los datos viven en localStorage */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  return ready
}
