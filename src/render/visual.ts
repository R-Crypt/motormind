import type { Finish, GraphicShape, Selections, VehicleDef } from '@/data/types'
import { effective, getOption } from '@/lib/configuration'
import type { Material, PaintSpec } from './paintEngine'

export interface VisualState {
  paint: PaintSpec
  /** Colour used for body-coloured kit parts (approximate swatch) */
  bodyHex: string
  wheel: { front: string; rear: string; key: string }
  kit: { frontLip: boolean; sideSkirts: boolean; rearDiffuser: boolean; spoiler: boolean }
  kitMaterial: 'gloss-black' | 'carbon' | 'body'
  kitFinish: Finish
  dropPx: number
}

const FACTORY_WHITE = '#e9e9e7'

function detailMaterial(optionId: string): Material | null {
  const m = getOption(optionId)?.visual?.material
  if (m === 'gloss-black') return { kind: 'paint', color: '#0b0c0e', finish: 'gloss' }
  if (m === 'carbon') return { kind: 'carbon' }
  return null
}

export function resolveVisual(vehicle: VehicleDef, sel: Selections): VisualState {
  const e = effective(sel)
  const surface = getOption(e.surface)!
  const finish = (getOption(e.finish)?.visual?.finish ?? 'gloss') as Finish
  const body: Material = surface.visual?.color ? { kind: 'paint', color: surface.visual.color, finish } : { kind: 'original' }

  const graphicOpt = getOption(e.graphic)
  const graphic = graphicOpt?.visual?.shape
    ? { shape: graphicOpt.visual.shape as GraphicShape, color: getOption(e.graphicColour)?.visual?.color ?? '#0d0e10' }
    : null

  const wheelOpt = getOption(e.wheel)!
  const wImg = wheelOpt.visual?.wheelImage ?? 'stock'
  const wFin = (getOption(e.wheelFinish)?.id ?? 'wf-silver').replace('wf-', '')
  const wheel =
    wImg === 'stock'
      ? { front: `${vehicle.renderer.basePath}/wheel-stock-front.webp`, rear: `${vehicle.renderer.basePath}/wheel-stock-rear.webp`, key: 'stock' }
      : { front: `/vehicles/wheels/${wImg}-${wFin}.webp`, rear: `/vehicles/wheels/${wImg}-${wFin}.webp`, key: `${wImg}-${wFin}` }

  const kitMat = (getOption(e.kitFinish)?.visual?.material ?? 'gloss-black') as VisualState['kitMaterial']
  const drop = getOption(e.stance)?.visual?.dropMm ?? 0

  return {
    paint: {
      body,
      roof: detailMaterial(e.roof),
      mirror: detailMaterial(e.mirrors),
      handles: detailMaterial(e.handles),
      graphic,
    },
    bodyHex: surface.visual?.color ?? FACTORY_WHITE,
    wheel,
    kit: {
      frontLip: e.frontLip !== 'lip-none',
      sideSkirts: e.sideSkirts !== 'skirts-none',
      rearDiffuser: e.rearDiffuser !== 'diffuser-none',
      spoiler: e.spoiler !== 'spoiler-none',
    },
    kitMaterial: kitMat,
    kitFinish: finish,
    dropPx: drop * vehicle.renderer.pxPerMm,
  }
}
