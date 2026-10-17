import { useMemo } from 'react'
import { Check, Plus } from 'lucide-react'
import { vehicles, vehicleName } from '@/data/vehicles'
import { defaultSelections } from '@/lib/configuration'
import { resolveVisual } from '@/render/visual'
import { useBuild } from '@/store/build'
import { useUI } from '@/store/ui'
import { cn } from '@/lib/utils'
import { CarRig } from '@/components/vehicle/CarRig'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/** Vehicle picker. Driven by the vehicle registry, so new models appear here automatically. */
export function VehicleSelectorDialog() {
  const isOpen = useUI((s) => s.dialog === 'vehicle')
  const close = useUI((s) => s.close)
  const vehicleId = useBuild((s) => s.vehicleId)

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogContent size="lg" aria-describedby="vehicle-desc">
        <DialogHeader>
          <p className="eyebrow mb-2">Select vehicle</p>
          <DialogTitle>Choose your car</DialogTitle>
          <DialogDescription id="vehicle-desc">
            This concept launches with one vehicle. The catalogue is structured so MotorMind can add further makes, models and variants later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} id={v.id} selected={v.id === vehicleId} onPick={close} />
          ))}
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong p-6 text-center">
            <span className="grid size-9 place-items-center rounded-full border border-line-strong text-fg-subtle">
              <Plus className="size-4" />
            </span>
            <p className="text-[13px] font-medium text-fg-muted">More vehicles</p>
            <p className="text-[12px] leading-relaxed text-fg-subtle">Planned for a later phase, based on the models MotorMind customers bring in most.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function VehicleCard({ id, selected, onPick }: { id: string; selected: boolean; onPick: () => void }) {
  const v = vehicles.find((x) => x.id === id)!
  const visual = useMemo(() => resolveVisual(v, defaultSelections()), [v])
  return (
    <button
      id={`pick-${v.id}`}
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      className={cn(
        'group overflow-hidden rounded-xl border text-left transition-colors',
        selected ? 'border-white/40 bg-white/[0.05]' : 'border-line hover:border-line-strong',
      )}
    >
      <div className="relative bg-[radial-gradient(120%_90%_at_50%_20%,#22252b,#0b0c0f)] px-5 pb-3 pt-6">
        <CarRig vehicle={v} visual={visual} reflect={false} />
        {selected && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white">
            <Check className="size-3" /> Selected
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="eyebrow !text-[9.5px]">{v.make} · {v.generationLabel}</p>
        <p className="display mt-1 text-[24px] text-fg">
          {v.model} {v.variant}
        </p>
        <p className="mt-1 text-[12px] text-fg-muted">
          {v.bodyStyle} · Model year {v.modelYear ?? 'not specified (demo)'}
        </p>
        <p className="mt-2 text-[11px] text-fg-subtle">{vehicleName(v)} — not to be confused with the Polo GTI.</p>
      </div>
    </button>
  )
}
