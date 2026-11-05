'use client'

import { useEffect, useState } from 'react'
import { fetchMyBusiness, updateBusiness, type BusinessFields } from '@/shared/lib/business'
import { useCrm } from '@/shared/stores/crm-store'
import { BUSINESS_KEYS, useSettings } from '@/shared/stores/settings-store'
import { useUi } from '@/shared/stores/ui-store'

export type WorkspaceStatus = 'loading' | 'ready' | 'no-business' | 'error'

/** Carga el negocio del usuario y sus datos; después guarda solo los cambios de ajustes */
export function useWorkspace(): { status: WorkspaceStatus; retry: () => void } {
  const [status, setStatus] = useState<WorkspaceStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined

    async function init() {
      setStatus('loading')
      try {
        const business = await fetchMyBusiness()
        if (cancelled) return
        if (!business) return setStatus('no-business')
        const { id, ...fields } = business
        useSettings.getState().set(fields)
        if (useCrm.getState().businessId !== id || useCrm.getState().status !== 'ready') await useCrm.getState().load(id)
        if (cancelled) return
        setStatus(useCrm.getState().status === 'error' ? 'error' : 'ready')
        unsubscribe = syncBusinessSettings(id)
      } catch (error) {
        console.error('[orbita] error al cargar el negocio', error)
        if (!cancelled) setStatus('error')
      }
    }

    void init()
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [attempt])

  return { status, retry: () => setAttempt((n) => n + 1) }
}

function syncBusinessSettings(businessId: string): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  const unsubscribe = useSettings.subscribe((state, prev) => {
    const patch: Partial<BusinessFields> = {}
    for (const key of BUSINESS_KEYS) if (state[key] !== prev[key]) Object.assign(patch, { [key]: state[key] })
    if (!Object.keys(patch).length) return
    clearTimeout(timer)
    // Espera a que termine de escribir antes de guardar
    timer = setTimeout(() => {
      const { businessName, ownerName, businessType, currency, waTemplates } = useSettings.getState()
      updateBusiness(businessId, { businessName, ownerName, businessType, currency, waTemplates }).catch(() => useUi.getState().notify('No se pudieron guardar los ajustes', 'bad'))
    }, 700)
  })
  return () => {
    clearTimeout(timer)
    unsubscribe()
  }
}
