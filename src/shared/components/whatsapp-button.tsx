import { cn } from './ui'

export function WhatsappIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.82 14.11c-.25.69-1.43 1.33-1.98 1.38-.51.05-.99.24-3.33-.69-2.81-1.11-4.6-3.98-4.74-4.17-.13-.18-1.13-1.5-1.13-2.87 0-1.36.71-2.03.97-2.31.25-.27.55-.34.73-.34h.53c.17 0 .4-.06.62.48.25.6.83 2.06.9 2.21.07.15.12.32.02.51-.1.2-.15.32-.29.49-.15.18-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.45.29.15.46.12.63-.07.18-.2.73-.85.92-1.15.2-.3.39-.25.66-.15.27.1 1.73.82 2.03.97.29.15.49.22.56.34.08.12.08.69-.17 1.37Z" />
    </svg>
  )
}

interface Props {
  href: string
  label?: string
  compact?: boolean
  className?: string
}

/** Abre WhatsApp con el mensaje ya escrito */
export function WhatsappButton({ href, label = 'WhatsApp', compact, className }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#25D366]/15 font-semibold text-[#128C4B] transition hover:bg-[#25D366]/25 active:scale-95 dark:text-[#4ae38a]',
        compact ? 'h-10 w-10' : 'h-11 px-4 text-[15px]',
        className,
      )}
    >
      <WhatsappIcon />
      {!compact && label}
    </a>
  )
}
