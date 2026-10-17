import { Check, Lock, Plus } from 'lucide-react'
import type { ModOption, Selections } from '@/data/types'
import { cn } from '@/lib/utils'
import { optionState, serviceName } from './optionState'

/**
 * A single modification as a selectable card. `toggle` cards add/remove a part;
 * `radio` cards pick one of several (stance, graphics).
 */
export function ModificationOptionCard({
  option,
  selections,
  mode,
  eyebrow,
  onSelect,
}: {
  option: ModOption
  selections: Selections
  mode: 'toggle' | 'radio'
  eyebrow?: string
  onSelect: (id: string) => void
}) {
  const st = optionState(option, selections)
  const service = serviceName(option)
  const blocked = !!st.blocked
  return (
    <div>
      <button
        id={`opt-${option.id}`}
        type="button"
        role={mode === 'toggle' ? 'switch' : 'radio'}
        aria-checked={st.selected}
        aria-disabled={blocked || undefined}
        aria-describedby={blocked ? `opt-${option.id}-reason` : undefined}
        onClick={() => onSelect(option.id)}
        className={cn(
          'group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors duration-200',
          st.selected
            ? 'border-white/35 bg-white/[0.06]'
            : blocked
              ? 'border-line bg-transparent opacity-55'
              : 'border-line bg-white/[0.015] hover:border-line-strong hover:bg-white/[0.035]',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'mt-0.5 grid size-5 shrink-0 place-items-center border transition-colors',
            mode === 'toggle' ? 'rounded-md' : 'rounded-full',
            st.selected ? 'border-accent bg-accent text-white' : 'border-line-strong text-fg-subtle group-hover:border-white/40',
          )}
        >
          {blocked ? <Lock className="size-3" /> : st.selected ? <Check className="size-3" strokeWidth={3} /> : mode === 'toggle' ? <Plus className="size-3" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          {eyebrow && <span className="eyebrow mb-0.5 block !text-[9.5px]">{eyebrow}</span>}
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-[14px] font-medium leading-snug text-fg">{option.name}</span>
            <span className={cn('tabular shrink-0 text-[13px]', st.selected ? 'text-fg' : 'text-fg-muted')}>{st.price}</span>
          </span>
          {option.description && <span className="mt-1 block text-[12.5px] leading-relaxed text-fg-muted">{option.description}</span>}
          {(option.meta || service || option.availability === 'concept') && (
            <span className="mt-2 flex flex-wrap items-center gap-1.5">
              {option.meta && <Tag>{option.meta}</Tag>}
              {service && <Tag tone="service">{service}</Tag>}
              {option.availability === 'concept' && <Tag tone="concept">Concept</Tag>}
            </span>
          )}
        </span>
      </button>
      {blocked && (
        <p id={`opt-${option.id}-reason`} className="mt-1.5 flex gap-1.5 px-1 text-[11.5px] leading-snug text-warning/90">
          <Lock className="mt-0.5 size-3 shrink-0" /> {st.blocked}
        </p>
      )}
    </div>
  )
}

export function Tag({ children, tone = 'meta' }: { children: React.ReactNode; tone?: 'meta' | 'service' | 'concept' }) {
  return (
    <span
      className={cn(
        'rounded-[4px] px-1.5 py-[3px] font-mono text-[9.5px] uppercase leading-none tracking-[0.1em]',
        tone === 'meta' && 'bg-white/[0.05] text-fg-muted',
        tone === 'service' && 'border border-accent/30 text-[#ff8a90]',
        tone === 'concept' && 'border border-line-strong text-fg-subtle',
      )}
    >
      {children}
    </span>
  )
}
