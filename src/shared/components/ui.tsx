'use client'

import { X } from 'lucide-react'
import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { initials } from '@/shared/lib/format'

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'danger'

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-accent text-white shadow-glow hover:brightness-110',
  soft: 'bg-accent/10 text-accent hover:bg-accent/15',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-bad/10 text-bad hover:bg-bad/15',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', icon, className, children, ...rest }: ButtonProps) {
  const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-5 text-[15px]', lg: 'h-14 px-7 text-base' }
  return (
    <button
      type="button"
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        sizes[size],
        BUTTON_STYLES[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn('grid h-11 w-11 place-items-center rounded-2xl text-ink/80 transition hover:bg-ink/5 hover:text-ink active:scale-95', className)}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('glass rounded-4xl p-5', className)}>{children}</div>
}

const TONES = {
  neutral: 'bg-ink/5 text-ink/70',
  accent: 'bg-accent/10 text-accent',
  ok: 'bg-ok/10 text-ok',
  warn: 'bg-warn/15 text-warn',
  bad: 'bg-bad/10 text-bad',
}

export type Tone = keyof typeof TONES

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', TONES[tone], className)}>
      {children}
    </span>
  )
}

const AVATAR_GRADIENTS = [
  'from-violet-500 to-sky-400',
  'from-rose-500 to-orange-400',
  'from-emerald-500 to-cyan-400',
  'from-amber-500 to-pink-500',
  'from-blue-500 to-indigo-400',
  'from-fuchsia-500 to-violet-400',
]

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const sizes = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-16 w-16 text-xl' }
  return (
    <div className={cn('grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-bold text-white shadow-sm', sizes[size], AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length])}>
      {initials(name) || '?'}
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-accent/10 text-accent">{icon}</div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{text}</p>
      {action}
    </div>
  )
}

interface SegmentedProps<T extends string> {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  className?: string
}

export function Segmented<T extends string>({ value, options, onChange, className }: SegmentedProps<T>) {
  return (
    <div className={cn('inline-flex rounded-2xl bg-ink/5 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            value === o.value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

interface ModalProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function Modal({ open, title, subtitle, onClose, children, footer, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'glass-strong relative flex max-h-[92dvh] w-full animate-rise flex-col rounded-t-4xl sm:rounded-4xl',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
          <div>
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          <IconButton label="Cerrar" onClick={onClose} className="-mr-2 -mt-1">
            <X size={20} />
          </IconButton>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line/60 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-rise">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
