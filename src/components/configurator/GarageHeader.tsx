import { Bookmark, ChevronDown, Pencil, RotateCcw, Share2 } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { getVehicle } from '@/data/vehicles'
import { buildCode, isStock } from '@/lib/configuration'
import { useBuild } from '@/store/build'
import { useUI } from '@/store/ui'
import { useResetBuild } from '@/hooks/useBuildActions'
import { Button } from '@/components/ui/button'

export function GarageHeader() {
  const vehicleId = useBuild((s) => s.vehicleId)
  const selections = useBuild((s) => s.selections)
  const buildName = useBuild((s) => s.buildName)
  const setName = useBuild((s) => s.setName)
  const saved = useBuild((s) => s.saved)
  const open = useUI((s) => s.open)
  const reset = useResetBuild()
  const v = getVehicle(vehicleId)
  const stock = isStock(selections)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-ink-950 px-3 sm:px-4">
      <Logo compact className="sm:hidden" />
      <Logo className="hidden sm:flex" />
      <span aria-hidden className="mx-1 hidden h-6 w-px bg-line sm:block" />

      <button
        id="vehicle-selector"
        type="button"
        onClick={() => open('vehicle')}
        className="group flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-white/[0.04]"
        aria-label={`Vehicle: ${v.make} ${v.model} ${v.variant}. Change vehicle`}
      >
        <span className="min-w-0">
          <span className="eyebrow block !text-[9px] leading-none">{v.make}</span>
          <span className="display block truncate text-[19px] leading-tight text-fg">
            {v.model} {v.variant}
          </span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-fg-subtle transition-transform group-hover:translate-y-px" />
      </button>

      <div className="ml-2 hidden min-w-0 items-center gap-2 lg:flex">
        <label htmlFor="build-name" className="group relative flex items-center">
          <span className="sr-only">Build name</span>
          <input
            id="build-name"
            value={buildName}
            onChange={(e) => setName(e.target.value)}
            maxLength={48}
            className="w-[220px] rounded-md border border-transparent bg-transparent px-2 py-1 text-[13px] text-fg-muted outline-none transition-colors hover:border-line focus:border-line-strong focus:text-fg"
          />
          <Pencil className="pointer-events-none absolute right-2 size-3 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
        </label>
        <span className="tabular rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle">{buildCode(selections, vehicleId)}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button id="open-saved" variant="ghost" size="sm" onClick={() => open('saved')} aria-label="Saved builds" className="px-2.5">
          <Bookmark />
          <span className="hidden md:inline">Saved</span>
          {saved.length > 0 && <span className="tabular rounded bg-white/10 px-1 text-[10px]">{saved.length}</span>}
        </Button>
        <Button id="open-share" variant="ghost" size="sm" onClick={() => open('share', 'garage-header')} aria-label="Share build" className="px-2.5">
          <Share2 />
          <span className="hidden md:inline">Share</span>
        </Button>
        <Button id="reset-build" variant="ghost" size="sm" onClick={reset} disabled={stock} aria-label="Reset build" className="px-2.5">
          <RotateCcw />
          <span className="hidden md:inline">Reset</span>
        </Button>
      </div>
    </header>
  )
}
