import { ArrowRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories, options, slots } from '@/data/catalog'
import type { ModOption, Selections, SlotDef } from '@/data/types'
import { effective, getOption, inactiveHint, isSlotActive, lineItems } from '@/lib/configuration'
import { cn, formatINR } from '@/lib/utils'
import { useBuild } from '@/store/build'
import { useSelectOption } from '@/hooks/useBuildActions'
import { disclaimers } from '@/config/brand'
import { ColourPicker } from './ColourPicker'
import { WheelSelector } from './WheelSelector'
import { ModificationOptionCard } from './ModificationOptionCard'
import { optionState } from './optionState'

function Segmented({ slot, opts, selections, onSelect }: { slot: SlotDef; opts: ModOption[]; selections: Selections; onSelect: (id: string) => void }) {
  return (
    <div role="radiogroup" aria-label={slot.label} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(opts.length, 4)}, minmax(0, 1fr))` }}>
      {opts.map((o) => {
        const st = optionState(o, selections)
        return (
          <button
            key={o.id}
            id={`opt-${o.id}`}
            type="button"
            role="radio"
            aria-checked={st.selected}
            title={o.description}
            onClick={() => onSelect(o.id)}
            className={cn(
              'flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-md border px-1.5 py-2 text-center transition-colors duration-200',
              st.selected ? 'border-white/40 bg-white/[0.07] text-fg' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
            )}
          >
            <span className="flex items-center gap-1.5 text-[12.5px] font-medium leading-tight">
              {o.visual?.swatch && <span className="size-3 shrink-0 rounded-full ring-1 ring-white/15" style={{ background: o.visual.swatch }} />}
              {o.name}
            </span>
            <span className="tabular font-mono text-[10px] text-fg-subtle">{st.price}</span>
          </button>
        )
      })}
    </div>
  )
}

function SlotSection({ slot, selections, vehicleId, onSelect }: { slot: SlotDef; selections: Selections; vehicleId: string; onSelect: (id: string) => void }) {
  const opts = options.filter((o) => o.slot === slot.id && o.supportedVariants.includes(vehicleId))
  const active = isSlotActive(slot, selections)
  const current = getOption(selections[slot.id])

  // toggle parts only show the part itself; "none" is the factory state
  if (slot.presentation === 'card' && slot.kind === 'toggle') {
    return (
      <>
        {opts
          .filter((o) => o.id !== slot.defaultOption)
          .map((o) => (
            <ModificationOptionCard key={o.id} option={o} selections={selections} mode="toggle" eyebrow={slot.label} onSelect={onSelect} />
          ))}
      </>
    )
  }

  return (
    <section aria-labelledby={`slot-${slot.id}`} className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={`slot-${slot.id}`} className="eyebrow !text-fg-muted">
          {slot.label}
        </h3>
        {active && current && <span className="truncate text-[12px] text-fg">{current.name}</span>}
      </div>
      {!active ? (
        <p className="flex gap-2 rounded-md border border-dashed border-line-strong px-3 py-2.5 text-[12px] leading-snug text-fg-subtle">
          <Info className="mt-px size-3.5 shrink-0" /> {inactiveHint(slot)}
        </p>
      ) : slot.presentation === 'swatch' ? (
        <ColourPicker label={slot.label} options={opts} selections={selections} onSelect={onSelect} />
      ) : slot.presentation === 'wheel' ? (
        <WheelSelector options={opts} selections={selections} vehicleId={vehicleId} onSelect={onSelect} />
      ) : slot.presentation === 'segmented' ? (
        <Segmented slot={slot} opts={opts} selections={selections} onSelect={onSelect} />
      ) : (
        <div role="radiogroup" aria-labelledby={`slot-${slot.id}`} className="space-y-2">
          {opts.map((o) => (
            <ModificationOptionCard key={o.id} option={o} selections={selections} mode="radio" onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  )
}

/** Contextual options for the active category. Everything is generated from the catalogue. */
export function ModificationSidebar({ className }: { className?: string }) {
  const activeCategory = useBuild((s) => s.activeCategory)
  const rawSelections = useBuild((s) => s.selections)
  const vehicleId = useBuild((s) => s.vehicleId)
  const setCategory = useBuild((s) => s.setCategory)
  const setCamera = useBuild((s) => s.setCamera)
  const onSelect = useSelectOption()
  const selections = effective(rawSelections)

  const idx = categories.findIndex((c) => c.id === activeCategory)
  const cat = categories[idx]
  const next = categories[idx + 1]
  const catSlots = slots.filter((s) => s.category === activeCategory)
  const subtotal = lineItems(selections)
    .filter((li) => li.category === activeCategory)
    .reduce((s, li) => s + li.price, 0)
  const toggles = catSlots.filter((s) => s.kind === 'toggle' && s.presentation === 'card')
  const others = catSlots.filter((s) => !(s.kind === 'toggle' && s.presentation === 'card'))

  return (
    <div id="options-panel" role="tabpanel" aria-labelledby={`tab-${activeCategory}`} className={cn('flex min-h-0 flex-col', className)}>
      <div key={activeCategory} className="flex-1 animate-[fade-up_420ms_var(--ease-out-expo)_both] space-y-6 px-5 pb-6 pt-5">
        <header>
          <div className="flex items-center justify-between">
            <span className="eyebrow tabular">
              {String(idx + 1).padStart(2, '0')} / {String(categories.length).padStart(2, '0')}
            </span>
            {subtotal > 0 && <span className="tabular font-mono text-[11px] text-fg-muted">{formatINR(subtotal)}</span>}
          </div>
          <h2 className="display mt-2 text-[34px] text-fg">{cat.label}</h2>
          <p className="mt-1.5 text-[13px] text-fg-muted">{cat.blurb}</p>
        </header>

        {toggles.length > 0 && (
          <section aria-label="Styling parts" className="space-y-2">
            {toggles.map((s) => (
              <SlotSection key={s.id} slot={s} selections={selections} vehicleId={vehicleId} onSelect={onSelect} />
            ))}
          </section>
        )}
        {others.map((s) => (
          <SlotSection key={s.id} slot={s} selections={selections} vehicleId={vehicleId} onSelect={onSelect} />
        ))}

        <p className="text-[11px] leading-relaxed text-fg-subtle">{disclaimers.concept} Prices are illustrative.</p>
      </div>

      <div className="sticky bottom-0 hidden border-t border-line bg-ink-900/95 px-5 py-3 lg:block">
        {next ? (
          <button
            id="next-category"
            type="button"
            onClick={() => {
              setCategory(next.id)
              setCamera(next.camera)
            }}
            className="group flex w-full items-center justify-between rounded-md py-1.5 text-left text-[13px] text-fg-muted transition-colors hover:text-fg"
          >
            <span>
              <span className="eyebrow block !text-[9.5px]">Next</span>
              {next.label}
            </span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <Link to="/build" id="sidebar-review" className="group flex w-full items-center justify-between py-1.5 text-[13px] text-fg-muted hover:text-fg">
            <span>
              <span className="eyebrow block !text-[9.5px]">Done?</span>
              Review your build
            </span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  )
}
