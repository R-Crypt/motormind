import type { ModOption, Selections } from '@/data/types'
import { getVehicle } from '@/data/vehicles'
import { getOption } from '@/lib/configuration'
import { cn } from '@/lib/utils'
import { optionState } from './optionState'

/** Wheel design cards with live thumbnails in the currently chosen finish. */
export function WheelSelector({
  options,
  selections,
  vehicleId,
  onSelect,
}: {
  options: ModOption[]
  selections: Selections
  vehicleId: string
  onSelect: (id: string) => void
}) {
  const base = getVehicle(vehicleId).renderer.basePath
  const finish = (getOption(selections.wheelFinish)?.id ?? 'wf-silver').replace('wf-', '')
  return (
    <div role="radiogroup" aria-label="Wheel design" className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const st = optionState(o, selections)
        const img = o.visual?.wheelImage === 'stock' ? `${base}/wheel-stock-front.webp` : `/vehicles/wheels/${o.visual?.wheelImage}-${finish}.webp`
        return (
          <button
            key={o.id}
            id={`opt-${o.id}`}
            type="button"
            role="radio"
            aria-checked={st.selected}
            onClick={() => onSelect(o.id)}
            className={cn(
              'group relative flex flex-col items-start overflow-hidden rounded-lg border p-2.5 text-left transition-colors duration-200',
              st.selected ? 'border-white/40 bg-white/[0.06]' : 'border-line bg-white/[0.015] hover:border-line-strong hover:bg-white/[0.03]',
            )}
          >
            <span className="relative mb-2 grid aspect-square w-full place-items-center rounded-md bg-[radial-gradient(circle_at_50%_40%,#23262c,#0c0d10_70%)]">
              <img
                src={img}
                alt=""
                loading="lazy"
                className="w-[78%] drop-shadow-[0_8px_14px_rgb(0_0_0/0.6)] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[60deg]"
              />
              {st.selected && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent shadow-[0_0_0_3px_rgb(215_20_31/0.25)]" />}
            </span>
            <span className="text-[13px] font-medium leading-tight text-fg">{o.name}</span>
            <span className="mt-0.5 flex w-full items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] text-fg-subtle">{o.meta}</span>
              <span className={cn('tabular text-[12px]', st.selected ? 'text-fg' : 'text-fg-muted')}>{st.price}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
