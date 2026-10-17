import { useRef } from 'react'
import { ChevronsDown, Disc3, Droplet, Layers, Wind, type LucideIcon } from 'lucide-react'
import { categories } from '@/data/catalog'
import type { CategoryId } from '@/data/types'
import { categoryCount } from '@/lib/configuration'
import { cn } from '@/lib/utils'
import { useBuild } from '@/store/build'

export const categoryIcons: Record<CategoryId, LucideIcon> = {
  paint: Droplet,
  wheels: Disc3,
  exterior: Wind,
  stance: ChevronsDown,
  details: Layers,
}

/** Category switcher — a vertical rail on desktop, a compact horizontal rail on mobile. */
export function ModificationCategoryTabs({ orientation }: { orientation: 'vertical' | 'horizontal' }) {
  const active = useBuild((s) => s.activeCategory)
  const selections = useBuild((s) => s.selections)
  const setCategory = useBuild((s) => s.setCategory)
  const setCamera = useBuild((s) => s.setCamera)
  const compare = useBuild((s) => s.compare)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const choose = (id: CategoryId) => {
    setCategory(id)
    if (!compare) setCamera(categories.find((c) => c.id === id)!.camera)
  }

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const fwd = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const back = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    let n = -1
    if (e.key === fwd) n = (i + 1) % categories.length
    else if (e.key === back) n = (i - 1 + categories.length) % categories.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = categories.length - 1
    if (n < 0) return
    e.preventDefault()
    refs.current[n]?.focus()
    choose(categories[n].id)
  }

  const vertical = orientation === 'vertical'
  return (
    <div
      role="tablist"
      aria-label="Modification categories"
      aria-orientation={orientation}
      className={cn(vertical ? 'flex flex-col gap-1 p-2' : 'rail flex gap-1 overflow-x-auto px-3 py-2')}
    >
      {categories.map((c, i) => {
        const Icon = categoryIcons[c.id]
        const selected = active === c.id
        const count = categoryCount(selections, c.id)
        return (
          <button
            key={c.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            id={`tab-${c.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls="options-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => choose(c.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              'group relative flex items-center transition-colors duration-200',
              vertical
                ? 'h-[68px] w-full flex-col justify-center gap-1.5 rounded-lg'
                : 'h-10 shrink-0 gap-2 rounded-full border px-3.5',
              selected
                ? vertical
                  ? 'bg-white/[0.06] text-fg'
                  : 'border-white/25 bg-white/[0.08] text-fg'
                : vertical
                  ? 'text-fg-subtle hover:bg-white/[0.03] hover:text-fg-muted'
                  : 'border-line text-fg-muted hover:text-fg',
            )}
          >
            {vertical && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-0 top-1/2 h-7 w-[2px] -translate-y-1/2 rounded-full bg-accent transition-all duration-300',
                  selected ? 'opacity-100' : 'h-0 opacity-0',
                )}
              />
            )}
            <Icon className={cn('size-[18px] transition-transform duration-300', selected && 'text-accent', vertical && 'group-hover:-translate-y-px')} />
            <span className={cn(vertical ? 'font-mono text-[9.5px] uppercase tracking-[0.14em]' : 'text-[13px] font-medium')}>{c.short}</span>
            {count > 0 && (
              <span
                aria-label={`${count} selected`}
                className={cn(
                  'tabular grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[9.5px] font-semibold leading-4 text-white',
                  vertical && 'absolute right-2.5 top-2.5',
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
