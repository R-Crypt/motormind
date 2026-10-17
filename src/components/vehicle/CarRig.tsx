import { forwardRef } from 'react'
import type { VehicleDef } from '@/data/types'
import type { VisualState } from '@/render/visual'
import { cn } from '@/lib/utils'
import { PaintedBody } from './PaintedBody'
import { KitLayer } from './KitLayer'

const pct = (v: number, of: number) => `${(v / of) * 100}%`

function Wheel({ vehicle, center, src, isStock }: { vehicle: VehicleDef; center: [number, number]; src: string; isStock: boolean }) {
  const { width: W, height: H, wheelRadius: R } = vehicle.renderer.geometry
  // stock crops are 190px around the hub; aftermarket renders are scaled to the tyre diameter
  const d = isStock ? 190 : R * 2
  return (
    <>
      {/* wheel-well darkness behind the tyre */}
      <div
        className="absolute rounded-full"
        style={{
          left: pct(center[0] - R - 3, W),
          top: pct(center[1] - R - 3, H),
          width: pct(R * 2 + 6, W),
          height: pct(R * 2 + 6, H),
          background: 'radial-gradient(circle at 50% 40%, #121315 0%, #050506 70%)',
        }}
      />
      <div className="absolute" style={{ left: pct(center[0] - d / 2, W), top: pct(center[1] - d / 2, H), width: pct(d, W), height: pct(d, H) }}>
        <div data-wheel-spin className="h-full w-full">
          <img
            key={src}
            src={src}
            alt=""
            draggable={false}
            className="h-full w-full select-none animate-[wheel-in_700ms_var(--ease-out-expo)_both]"
          />
        </div>
      </div>
    </>
  )
}

export interface CarRigProps {
  vehicle: VehicleDef
  visual: VisualState
  /** Changing this number plays a light sweep across the paint */
  sheenKey?: number
  onStatus?: (s: 'ready' | 'error') => void
  reflect?: boolean
  className?: string
}

/**
 * One complete layered vehicle: wheels behind, paint + kit on a body group that
 * drops with the stance setting. Positions are percentages of the vehicle's
 * pixel geometry so the rig scales to any container.
 */
export const CarRig = forwardRef<HTMLDivElement, CarRigProps>(({ vehicle, visual, sheenKey, onStatus, reflect = true, className }, ref) => {
  const { width: W, height: H, frontWheel, rearWheel } = vehicle.renderer.geometry
  const isStock = visual.wheel.key === 'stock'
  return (
    <div
      ref={ref}
      className={cn('relative w-full', className)}
      style={{
        aspectRatio: `${W} / ${H}`,
        WebkitBoxReflect: reflect ? 'below -2px linear-gradient(transparent 62%, rgb(255 255 255 / 0.16))' : undefined,
      } as React.CSSProperties}
    >
      <Wheel vehicle={vehicle} center={rearWheel} src={visual.wheel.rear} isStock={isStock} />
      <Wheel vehicle={vehicle} center={frontWheel} src={visual.wheel.front} isStock={isStock} />
      <div
        className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]"
        style={{ transform: `translateY(${(visual.dropPx / H) * 100}%)` }}
      >
        <PaintedBody vehicle={vehicle} spec={visual.paint} onStatus={onStatus} />
        <KitLayer vehicle={vehicle} visual={visual} />
        {sheenKey ? (
          <div
            key={sheenKey}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              WebkitMaskImage: `url(${vehicle.renderer.basePath}/body.webp)`,
              maskImage: `url(${vehicle.renderer.basePath}/body.webp)`,
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
            }}
          >
            <div className="absolute inset-y-0 left-0 w-1/3 animate-[sheen_1100ms_var(--ease-out-expo)_both] bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.28),transparent)]" />
          </div>
        ) : null}
      </div>
    </div>
  )
})
CarRig.displayName = 'CarRig'
