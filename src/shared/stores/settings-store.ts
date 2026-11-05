'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BUSINESS_PRESETS, DEFAULT_WA_TEMPLATES } from '@/shared/constants/business-presets'
import { SETTINGS_STORAGE_KEY } from '@/shared/constants/storage'
import type { AccentKey, BusinessType, ThemeMode, WidgetKey } from '@/shared/types/crm'

export type WaTemplates = typeof DEFAULT_WA_TEMPLATES

/**
 * Los datos del negocio vienen de Supabase (tabla businesses).
 * Tema, color y orden de widgets son preferencias de este dispositivo.
 */
interface SettingsState {
  businessName: string
  ownerName: string
  businessType: BusinessType
  currency: string
  waTemplates: WaTemplates
  theme: ThemeMode
  accent: AccentKey
  widgets: WidgetKey[]
  hiddenWidgets: WidgetKey[]
  set: (patch: Partial<Omit<SettingsState, 'set' | 'setBusinessType' | 'resetBusiness'>>) => void
  setBusinessType: (type: BusinessType) => void
  resetBusiness: () => void
}

const BUSINESS_DEFAULTS = {
  businessName: '',
  ownerName: '',
  businessType: 'otro' as BusinessType,
  currency: 'USD',
  waTemplates: DEFAULT_WA_TEMPLATES,
}

export const BUSINESS_KEYS = Object.keys(BUSINESS_DEFAULTS) as (keyof typeof BUSINESS_DEFAULTS)[]

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...BUSINESS_DEFAULTS,
      theme: 'light',
      accent: 'violeta',
      widgets: BUSINESS_PRESETS.otro.widgets,
      hiddenWidgets: [],
      set: (patch) => set(patch),
      setBusinessType: (type) => set({ businessType: type, widgets: BUSINESS_PRESETS[type].widgets, hiddenWidgets: [] }),
      resetBusiness: () => set(BUSINESS_DEFAULTS),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: 2,
      // Solo las preferencias del dispositivo quedan en el navegador
      partialize: (s) => ({ theme: s.theme, accent: s.accent, widgets: s.widgets, hiddenWidgets: s.hiddenWidgets }),
      migrate: (state) => state as SettingsState,
    },
  ),
)
