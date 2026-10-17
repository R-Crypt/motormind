import type { ServiceLineKey } from '@/config/brand'

/* ────────────────────────────────────────────────────────────────────────────
   Configurator domain types. Vehicles, slots and options are pure data so new
   makes/models/variants can be added without touching UI components.
   ──────────────────────────────────────────────────────────────────────────── */

export type CategoryId = 'paint' | 'wheels' | 'exterior' | 'stance' | 'details'

export type SlotId =
  | 'surface'
  | 'finish'
  | 'wheel'
  | 'wheelFinish'
  | 'frontLip'
  | 'sideSkirts'
  | 'rearDiffuser'
  | 'spoiler'
  | 'kitFinish'
  | 'stance'
  | 'mirrors'
  | 'roof'
  | 'handles'
  | 'graphic'
  | 'graphicColour'

export type Finish = 'gloss' | 'satin' | 'matte'

export type CameraId = 'overview' | 'front' | 'side' | 'rear' | 'wheels' | 'roof'

/** Whether a slot is shown/applied depends on another slot's current option. */
export interface SlotDependency {
  slot: SlotId
  /** Active only when the referenced slot's option carries one of these tags */
  anyTag: string[]
  /** Message shown when inactive */
  inactiveHint: string
}

export interface SlotDef {
  id: SlotId
  category: CategoryId
  label: string
  /** single = choose one (radio); toggle = on/off part (default option = "none") */
  kind: 'single' | 'toggle'
  defaultOption: string
  /** Optional dependency, e.g. finish only applies to a respray / wrap */
  dependsOn?: SlotDependency | SlotDependency[]
  /** Pick from swatches vs cards */
  presentation: 'swatch' | 'card' | 'wheel' | 'segmented'
  camera?: CameraId
}

export interface PriceModifier {
  /** Applies when the option currently selected in `slot` carries `tag` */
  slot: SlotId
  tag: string
  price: number
}

export type Availability =
  | 'stock' // factory specification, no charge
  | 'concept' // conceptual demo option — not a verified MotorMind product

export interface ModOption {
  id: string
  slot: SlotId
  name: string
  description?: string
  /** Indicative INR price; demo figure */
  price: number
  priceModifiers?: PriceModifier[]
  availability: Availability
  /** Related verified MotorMind service line (from their services page), if any */
  serviceLine?: ServiceLineKey
  /** Short technical metadata, e.g. `17" · set of 4` */
  meta?: string
  tags?: string[]
  supportedVariants: string[]
  /** Hard incompatibilities (checked both ways) */
  excludes?: string[]
  excludeReason?: string
  /** Visual data consumed by the renderer */
  visual?: {
    color?: string
    finish?: Finish
    wheelImage?: string // id prefix in /vehicles/wheels
    swatch?: string // css background for swatches
    dropMm?: number
    shape?: GraphicShape
    material?: 'gloss-black' | 'carbon' | 'body'
  }
}

export type GraphicShape = 'rocker' | 'shoulder' | 'fade'

export type Selections = Record<SlotId, string>

export interface CategoryDef {
  id: CategoryId
  label: string
  short: string
  blurb: string
  camera: CameraId
}

/** 2.5D layered renderer description for a vehicle side view */
export interface LayeredRenderer {
  type: 'layered-2.5d'
  basePath: string
  geometry: {
    width: number
    height: number
    wheelRadius: number
    rimRadius: number
    groundY: number
    rearWheel: [number, number]
    frontWheel: [number, number]
    bbox: [number, number, number, number]
  }
  /** px per mm in vehicle space — used to convert stance drops into pixels */
  pxPerMm: number
  /** Kit geometry, authored in vehicle pixel space */
  kit: Record<'frontLip' | 'sideSkirts' | 'rearDiffuser' | 'spoiler', string>
  graphics: Record<GraphicShape, string>
  cameras: Record<CameraId, { x: number; y: number; scale: number }>
  /** Clickable points in the overview camera that jump to a category */
  hotspots: { category: CategoryId; label: string; x: number; y: number }[]
  /** Asset provenance, surfaced in the UI for transparency */
  provenance: string
}

export interface VehicleDef {
  id: string
  make: string
  model: string
  variant: string
  bodyStyle: string
  generationLabel: string
  /** Not verified — kept null rather than inventing one */
  modelYear: string | null
  baseColourName: string
  status: 'available' | 'planned'
  renderer: LayeredRenderer
}
