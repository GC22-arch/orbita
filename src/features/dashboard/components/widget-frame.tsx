'use client'

import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical } from 'lucide-react'
import type { DragEvent, ReactNode } from 'react'
import { cn } from '@/shared/components/ui'

interface WidgetFrameProps {
  title: string
  icon: ReactNode
  index: number
  wide?: boolean
  hero?: boolean
  editing: boolean
  hidden?: boolean
  action?: ReactNode
  children: ReactNode
  dragging: boolean
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
  onMove: (dir: -1 | 1) => void
  onToggle: () => void
}

/** Tarjeta de vidrio que "flota" y se puede reordenar arrastrando */
export function WidgetFrame(p: WidgetFrameProps) {
  const dragProps = p.editing
    ? {
        draggable: true,
        onDragStart: (e: DragEvent) => {
          e.dataTransfer.effectAllowed = 'move'
          p.onDragStart()
        },
        onDragEnter: p.onDragEnter,
        onDragOver: (e: DragEvent) => e.preventDefault(),
        onDragEnd: p.onDragEnd,
      }
    : {}

  return (
    <section
      {...dragProps}
      style={{ animationDelay: `${p.index * 70}ms` }}
      className={cn('animate-rise', p.wide && 'md:col-span-2', p.editing && 'cursor-grab active:cursor-grabbing')}
    >
      <div
        style={{ animationDelay: `${-p.index * 1.3}s` }}
        className={cn(
          'group relative h-full rounded-4xl p-5 transition duration-300',
          p.hero ? 'bg-gradient-accent text-white shadow-glow' : 'glass',
          !p.editing && 'animate-float hover:-translate-y-1.5 hover:[animation-play-state:paused]',
          p.editing && 'outline-dashed outline-2 outline-offset-4 outline-accent/50',
          p.dragging && 'scale-[0.97] opacity-40',
          p.hidden && 'opacity-40 grayscale',
        )}
      >
        <header className="mb-4 flex items-center gap-2.5">
          <span className={cn('grid h-9 w-9 place-items-center rounded-xl', p.hero ? 'bg-white/20' : 'bg-accent/10 text-accent')}>{p.icon}</span>
          <h2 className={cn('flex-1 font-display text-[15px] font-semibold', p.hero ? 'text-white/90' : 'text-ink/80')}>{p.title}</h2>
          {p.editing ? <EditControls {...p} /> : p.action}
        </header>
        {p.children}
      </div>
    </section>
  )
}

function EditControls({ hidden, hero, onMove, onToggle }: Pick<WidgetFrameProps, 'hidden' | 'hero' | 'onMove' | 'onToggle'>) {
  const btn = cn('grid h-8 w-8 place-items-center rounded-lg transition', hero ? 'hover:bg-white/20' : 'hover:bg-ink/5')
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" className={btn} onClick={() => onMove(-1)} aria-label="Subir">
        <ArrowUp size={16} />
      </button>
      <button type="button" className={btn} onClick={() => onMove(1)} aria-label="Bajar">
        <ArrowDown size={16} />
      </button>
      <button type="button" className={btn} onClick={onToggle} aria-label={hidden ? 'Mostrar' : 'Ocultar'}>
        {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      <GripVertical size={18} className="ml-1 opacity-50" />
    </div>
  )
}
