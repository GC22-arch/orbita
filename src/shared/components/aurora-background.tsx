'use client'

import { useId } from 'react'

/** Fondo vivo: manchas de color que derivan lentamente y anillos orbitales */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-[10%] -top-[15%] h-[55vmax] w-[55vmax] animate-drift rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent) / var(--blob-opacity)), transparent 65%)' }}
      />
      <div
        className="absolute -right-[15%] top-[20%] h-[50vmax] w-[50vmax] animate-drift rounded-full blur-3xl [animation-delay:-8s]"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent2) / var(--blob-opacity)), transparent 65%)' }}
      />
      <div
        className="absolute -bottom-[25%] left-[25%] h-[45vmax] w-[45vmax] animate-drift rounded-full blur-3xl [animation-delay:-15s]"
        style={{ background: 'radial-gradient(circle, rgb(244 114 182 / calc(var(--blob-opacity) * 0.6)), transparent 65%)' }}
      />
      <svg className="absolute right-[-12vmax] top-[-12vmax] h-[60vmax] w-[60vmax] animate-spin-slow text-ink/[0.06]" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.4" />
        <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.4" />
        <circle cx="198" cy="100" r="2.2" fill="rgb(var(--accent))" opacity="0.7" />
        <circle cx="100" cy="26" r="1.6" fill="rgb(var(--accent2))" opacity="0.7" />
      </svg>
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(rgb(var(--ink) / 0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
    </div>
  )
}

export function OrbitaLogo({ size = 36 }: { size?: number }) {
  // Id único por logo: si el degradado vive en un elemento oculto, los demás logos no lo pueden usar
  const gradientId = `orbita-g${useId().replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="rgb(var(--accent))" />
          <stop offset="1" stopColor="rgb(var(--accent2))" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="9" fill={`url(#${gradientId})`} />
      <ellipse cx="20" cy="20" rx="17" ry="7" stroke={`url(#${gradientId})`} strokeWidth="2" transform="rotate(-28 20 20)" opacity="0.85" />
      <circle cx="34.5" cy="12.5" r="2.4" fill="rgb(var(--accent2))" />
    </svg>
  )
}
