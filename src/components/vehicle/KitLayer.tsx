import { useId } from 'react'
import type { VehicleDef } from '@/data/types'
import type { VisualState } from '@/render/visual'

type KitPart = keyof VisualState['kit']
const ORDER: KitPart[] = ['sideSkirts', 'rearDiffuser', 'frontLip', 'spoiler']

/**
 * Styling-kit overlay authored in vehicle pixel space (same viewBox as the
 * body image). Each part is drawn with its material and a lighting overlay so
 * it sits in the same studio light as the car.
 */
export function KitLayer({ vehicle, visual }: { vehicle: VehicleDef; visual: VisualState }) {
  const uid = useId().replace(/:/g, '')
  const { width: W, height: H } = vehicle.renderer.geometry
  const finish = visual.kitMaterial === 'body' ? visual.kitFinish : 'gloss'
  const hi = finish === 'gloss' ? 0.55 : finish === 'satin' ? 0.28 : 0.12

  const fill =
    visual.kitMaterial === 'carbon' ? `url(#${uid}-carbon)` : visual.kitMaterial === 'body' ? visual.bodyHex : `url(#${uid}-black)`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-black`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2e33" />
          <stop offset="0.35" stopColor="#0d0e10" />
          <stop offset="1" stopColor="#040405" />
        </linearGradient>
        <pattern id={`${uid}-carbon`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#131416" />
          <rect width="3" height="3" fill="#24262a" />
          <rect x="3" y="3" width="3" height="3" fill="#24262a" />
        </pattern>
        {/* studio light: bright top edge, shadowed underside */}
        <linearGradient id={`${uid}-shade`} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={hi} />
          <stop offset="0.28" stopColor="#fff" stopOpacity={hi * 0.18} />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.15" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {ORDER.filter((p) => visual.kit[p]).map((p) => (
        <g key={p} className="animate-[kit-in_600ms_var(--ease-out-expo)_both]" style={{ transformBox: 'fill-box' }}>
          <path d={vehicle.renderer.kit[p]} fill={fill} style={{ transition: 'fill 500ms ease' }} />
          <path d={vehicle.renderer.kit[p]} fill={`url(#${uid}-shade)`} />
          <path d={vehicle.renderer.kit[p]} fill="none" stroke="#000" strokeOpacity="0.45" strokeWidth="0.8" />
        </g>
      ))}
    </svg>
  )
}
