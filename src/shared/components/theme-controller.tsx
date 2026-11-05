'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { useSettings } from '@/shared/stores/settings-store'
import type { ThemeMode } from '@/shared/types/crm'
import { IconButton } from './ui'

/** Mantiene sincronizados la clase .dark y el color de acento con las preferencias */
export function ThemeController() {
  const theme = useSettings((s) => s.theme)
  const accent = useSettings((s) => s.accent)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => root.classList.toggle('dark', theme === 'dark' || (theme === 'system' && media.matches))
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
  }, [accent])

  return null
}

const NEXT: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'system', system: 'light' }
const LABELS: Record<ThemeMode, string> = { light: 'Tema claro', dark: 'Tema oscuro', system: 'Tema automático' }

export function ThemeToggle() {
  const theme = useSettings((s) => s.theme)
  const set = useSettings((s) => s.set)
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  return (
    <IconButton label={`${LABELS[theme]} (tocar para cambiar)`} onClick={() => set({ theme: NEXT[theme] })}>
      <Icon key={theme} size={20} className="animate-pop" />
    </IconButton>
  )
}
