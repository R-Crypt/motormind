import { Check } from 'lucide-react'
import type { ModOption, Selections } from '@/data/types'
import { cn } from '@/lib/utils'
import { optionState, serviceName } from './optionState'

interface Group {
  key: string
  title: string
  note?: string
  options: ModOption[]
}

function groupsFor(options: ModOption[]): Group[] {
  const factory = options.filter((o) => o.tags?.includes('factory'))
  const respray = options.filter((o) => o.tags?.includes('respray'))
  const wrap = options.filter((o) => o.tags?.includes('wrap'))
  if (!respray.length && !wrap.length) return [{ key: 'all', title: '', options }]
  return [
    { key: 'factory', title: 'Factory', options: factory },
    { key: 'respray', title: 'Respray', note: respray[0] ? `Related service · ${serviceName(respray[0])}` : undefined, options: respray },
    { key: 'wrap', title: 'Vinyl wrap', note: wrap[0] ? `Related service · ${serviceName(wrap[0])}` : undefined, options: wrap },
  ].filter((g) => g.options.length)
}

/** Swatch grid for paint, wrap and graphic colours. */
export function ColourPicker({
  label,
  options,
  selections,
  onSelect,
}: {
  label: string
  options: ModOption[]
  selections: Selections
  onSelect: (id: string) => void
}) {
  const groups = groupsFor(options)
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.key}>
          {g.title && (
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="text-[12px] font-medium text-fg-muted">{g.title}</span>
              {g.note && <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-subtle">{g.note}</span>}
            </div>
          )}
          <div role="radiogroup" aria-label={g.title ? `${label}: ${g.title}` : label} className="flex flex-wrap gap-2.5">
            {g.options.map((o) => {
              const st = optionState(o, selections)
              return (
                <button
                  key={o.id}
                  id={`opt-${o.id}`}
                  type="button"
                  role="radio"
                  aria-checked={st.selected}
                  aria-label={`${o.name}, ${st.price}`}
                  title={`${o.name} · ${st.price}`}
                  onClick={() => onSelect(o.id)}
                  className={cn(
                    'group relative grid size-10 place-items-center rounded-full transition-transform duration-200 hover:scale-[1.06]',
                    st.selected ? 'ring-2 ring-fg ring-offset-[3px] ring-offset-ink-850' : 'ring-1 ring-white/10',
                  )}
                >
                  <span
                    className="absolute inset-0 rounded-full shadow-[inset_0_-6px_10px_rgb(0_0_0/0.35),inset_0_4px_6px_rgb(255_255_255/0.25)]"
                    style={{ background: o.visual?.swatch ?? o.visual?.color }}
                  />
                  {st.selected && <Check className="relative size-4 text-white mix-blend-difference" strokeWidth={3} />}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
