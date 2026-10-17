import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Loader2, MoveHorizontal, Plus } from 'lucide-react'
import type { CameraId, CategoryId, Selections } from '@/data/types'
import { getVehicle, vehicleName } from '@/data/vehicles'
import { resolveVisual } from '@/render/visual'
import { specKey } from '@/render/paintEngine'
import { defaultSelections } from '@/lib/configuration'
import { cn, prefersReducedMotion } from '@/lib/utils'
import { CarRig } from './CarRig'

export interface VehicleViewportProps {
  vehicleId: string
  selections: Selections
  camera?: CameraId
  compare?: boolean
  /** Play the drive-in entrance on mount */
  intro?: boolean
  hotspots?: boolean
  onHotspot?: (category: CategoryId) => void
  /** Show the giant outline type + floor grid */
  backdrop?: 'studio' | 'minimal'
  /** Max rig width as % of the viewport width */
  fit?: number
  className?: string
  id?: string
}

/**
 * The studio. Hosts the vehicle rig, camera framing, floor reflection,
 * before/after compare and overview hotspots. All visuals derive from the
 * `selections` prop, so it can be reused on the landing page and summary.
 */
export function VehicleViewport({
  vehicleId,
  selections,
  camera = 'overview',
  compare = false,
  intro = false,
  hotspots = false,
  onHotspot,
  backdrop = 'studio',
  fit = 90,
  className,
  id,
}: VehicleViewportProps) {
  const vehicle = getVehicle(vehicleId)
  const { width: W, height: H, groundY } = vehicle.renderer.geometry
  const visual = useMemo(() => resolveVisual(vehicle, selections), [vehicle, selections])
  const stockVisual = useMemo(() => resolveVisual(vehicle, defaultSelections()), [vehicle])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [split, setSplit] = useState(50)
  const rigRef = useRef<HTMLDivElement>(null)

  // light sweep whenever paint changes (not on first paint)
  const paintKey = specKey(vehicle.id, visual.paint)
  const [sheen, setSheen] = useState(0)
  const firstPaint = useRef(paintKey)
  useEffect(() => {
    if (paintKey !== firstPaint.current) setSheen((n) => n + 1)
  }, [paintKey])

  // drive-in entrance
  useLayoutEffect(() => {
    if (!intro || prefersReducedMotion() || !rigRef.current) return
    const rig = rigRef.current
    const spins = rig.querySelectorAll('[data-wheel-spin]')
    const tl = gsap.timeline()
    tl.fromTo(rig, { xPercent: -135 }, { xPercent: 0, duration: 1.7, ease: 'power3.out' }, 0)
    tl.fromTo(spins, { rotation: -970 }, { rotation: 0, duration: 1.7, ease: 'power3.out' }, 0)
    tl.fromTo(rig, { yPercent: 0 }, { yPercent: 0.8, duration: 0.18, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1.45)
    return () => {
      tl.kill()
      gsap.set([rig, ...spins], { clearProps: 'transform' })
    }
  }, [intro])

  const cam = vehicle.renderer.cameras[compare ? 'overview' : camera]
  const tx = (0.5 - cam.x / W) * 100
  const ty = (0.5 - cam.y / H) * 100

  return (
    <div
      id={id}
      className={cn('container-size relative isolate overflow-hidden select-none', className)}
      role="img"
      aria-label={`${vehicleName(vehicle)} preview${compare ? ', comparing stock and modified' : ''}`}
    >
      <StudioBackdrop variant={backdrop} label={vehicle.variant} />

      {/* framed world: everything inside moves with the camera */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="relative transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
          style={{
            width: `min(${fit}cqw, 168cqh)`,
            transform: `translateY(-5%) scale(${cam.scale}) translate(${tx}%, ${ty}%)`,
          }}
        >
          {/* contact shadow (outside the rig so it isn't reflected) */}
          <div
            aria-hidden
            className="absolute left-[3%] right-[2%] rounded-[50%] bg-black/90 blur-[10px]"
            style={{ top: `${((groundY - 10) / H) * 100}%`, height: `${(16 / H) * 100}%` }}
          />
          <CarRig ref={rigRef} vehicle={vehicle} visual={visual} sheenKey={sheen} onStatus={setStatus} />

          {compare && (
            <>
              <div className="absolute inset-0" style={{ clipPath: `inset(-20% ${100 - split}% -60% -5%)` }}>
                <CarRig vehicle={vehicle} visual={stockVisual} />
              </div>
              <div aria-hidden className="pointer-events-none absolute -top-[18%] -bottom-[40%] w-px bg-white/70" style={{ left: `${split}%` }}>
                <div className="absolute left-1/2 top-[44%] grid size-9 -translate-x-1/2 place-items-center rounded-full border border-white/40 bg-ink-900/90 text-fg shadow-xl">
                  <MoveHorizontal className="size-4" />
                </div>
              </div>
            </>
          )}

          {hotspots && !compare && camera === 'overview' && (
            <div className="absolute inset-0">
              {vehicle.renderer.hotspots.map((h, i) => (
                <button
                  key={h.category}
                  id={`hotspot-${h.category}`}
                  type="button"
                  onClick={() => onHotspot?.(h.category)}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 animate-fade-up"
                  style={{ left: `${(h.x / W) * 100}%`, top: `${(h.y / H) * 100}%`, animationDelay: `${1600 + i * 90}ms` }}
                  aria-label={`Customise ${h.label}`}
                >
                  <span className="absolute inset-0 rounded-full bg-accent/50 animate-[ping-ring_2.4s_ease-out_infinite]" style={{ animationDelay: `${i * 300}ms` }} />
                  <span className="relative grid size-6 place-items-center rounded-full border border-white/70 bg-ink-950/80 text-white transition group-hover:scale-110 group-hover:bg-accent group-focus-visible:bg-accent">
                    <Plus className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-ink-950/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    {h.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {compare && (
        <>
          <input
            id="compare-slider"
            type="range"
            min={4}
            max={96}
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            aria-label="Drag to compare factory and your build"
            className="absolute inset-x-0 top-[12%] bottom-[12%] z-10 w-full cursor-ew-resize opacity-0"
          />
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] sm:inset-x-6 sm:top-6">
            <span className="rounded bg-ink-950/80 px-2 py-1 text-fg-muted">Factory</span>
            <span className="rounded bg-accent px-2 py-1 text-white">Your build</span>
          </div>
        </>
      )}

      {status === 'loading' && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink-950/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted">
          <Loader2 className="size-3 animate-spin" /> Preparing paint shop
        </div>
      )}
      {status === 'error' && (
        <div role="status" className="absolute bottom-4 left-1/2 z-10 w-[min(92%,420px)] -translate-x-1/2 rounded-md border border-warning/30 bg-ink-900/95 px-3 py-2 text-center text-[12px] text-fg-muted">
          Live paint preview couldn't load, so the factory image is shown. Wheels, parts and stance still update.
        </div>
      )}
    </div>
  )
}

function StudioBackdrop({ variant, label }: { variant: 'studio' | 'minimal'; label: string }) {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_30%,#1c1e23_0%,#0d0e11_52%,#060708_100%)]" />
      {/* overhead softbox */}
      <div className="absolute left-1/2 top-[-30%] h-[80%] w-[90%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.09),transparent)]" />
      {variant === 'studio' && (
        <div className="outline-text absolute inset-x-0 top-[13%] text-center text-[25cqw] whitespace-nowrap">{label}</div>
      )}
      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[42%] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0e0f12_0%,#08090b_100%)]" />
        {variant === 'studio' && (
          <div
            className="absolute -inset-x-1/2 top-0 h-[220%] origin-top opacity-60"
            style={{
              transform: 'perspective(500px) rotateX(62deg)',
              backgroundImage:
                'linear-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.06) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'linear-gradient(180deg, black 0%, transparent 55%)',
            }}
          />
        )}
        <div className="absolute left-1/2 top-[6%] h-[60%] w-[70%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_255_255/0.06),transparent)]" />
      </div>
      {/* horizon line with a restrained brand-red glint */}
      <div className="absolute inset-x-0 bottom-[42%] h-px bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.08)_20%,rgb(215_20_31/0.55)_50%,rgb(255_255_255/0.08)_80%,transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_45%,transparent_55%,rgb(0_0_0/0.65)_100%)]" />
    </div>
  )
}
