'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useUi } from '@/shared/stores/ui-store'

export function Toast() {
  const toast = useUi((s) => s.toast)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), toast.tone === 'bad' ? 4500 : 2600)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast || !visible) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4 lg:bottom-8" role="status">
      <div key={toast.id} className="glass-strong flex animate-rise items-center gap-2 rounded-2xl px-5 py-3 font-semibold">
        {toast.tone === 'bad' ? <AlertCircle size={20} className="text-bad" /> : <CheckCircle2 size={20} className="text-ok" />}
        {toast.text}
      </div>
    </div>
  )
}
