import type { VehicleDef } from '../types'
import geometry from './polo-gt-tsi.geometry.json'

/**
 * Volkswagen Polo GT TSI — fifth-generation, India-market 5-door hatchback.
 *
 * Visualisation: layered 2.5D side profile. The base image is a self-generated
 * studio render (not a photograph supplied by VW or MotorMind). Paint, wheels,
 * stance, kit parts and graphics are composited live in the browser.
 */
const g = geometry as unknown as VehicleDef['renderer']['geometry']

export const poloGtTsi: VehicleDef = {
  id: 'polo-gt-tsi',
  make: 'Volkswagen',
  model: 'Polo',
  variant: 'GT TSI',
  bodyStyle: '5-door hatchback',
  generationLabel: 'Fifth generation · India',
  modelYear: null,
  baseColourName: 'Factory white',
  status: 'available',
  renderer: {
    type: 'layered-2.5d',
    basePath: '/vehicles/polo-gt-tsi',
    geometry: {
      width: g.width,
      height: g.height,
      wheelRadius: g.wheelRadius,
      rimRadius: g.rimRadius,
      groundY: g.groundY,
      rearWheel: g.rearWheel,
      frontWheel: g.frontWheel,
      bbox: g.bbox,
    },
    // Body length 1145px ≈ 3971mm (published Polo length) → 0.288 px/mm
    pxPerMm: 0.288,
    kit: {
      sideSkirts: 'M302 395 L852 392 L858 397 L852 409 L842 413 L322 415 L308 411 L302 403 Z',
      frontLip:
        'M1057 397 L1120 395.5 L1160 393 L1181 390 L1195 391.5 L1191 398 L1160 403.5 L1118 406.5 L1059 407 Z',
      rearDiffuser:
        'M40 371 L104 373 L104 384 L92 388.5 L60 388 L45 382 Z M58 386 h3 v8.5 h-3 Z M71 387 h3 v8.5 h-3 Z M84 387.5 h3 v8.5 h-3 Z',
      spoiler: 'M217 50.5 L190 53.2 L165 56.8 L141 60 L132 63.5 L140 66.5 L168 66 L193 62 L217 57 Z',
    },
    graphics: {
      rocker: 'M296 377 L866 369 L870 389 L296 397 Z M296 368 L866 360 L866 363.5 L296 371.5 Z',
      shoulder: 'M130 186 L1050 228 L1050 230.6 L130 188.6 Z M130 192.5 L1050 234.5 L1050 235.8 L130 193.8 Z',
      fade: 'M20 290 H1200 V430 H20 Z',
    },
    cameras: {
      overview: { x: 606, y: 262, scale: 1 },
      front: { x: 1030, y: 330, scale: 1.85 },
      side: { x: 580, y: 350, scale: 1.4 },
      rear: { x: 170, y: 250, scale: 1.75 },
      wheels: { x: 951, y: 380, scale: 2.1 },
      roof: { x: 520, y: 150, scale: 1.55 },
    },
    hotspots: [
      { category: 'paint', label: 'Paint & wrap', x: 640, y: 300 },
      { category: 'wheels', label: 'Wheels', x: 951, y: 389 },
      { category: 'exterior', label: 'Aero parts', x: 1150, y: 405 },
      { category: 'stance', label: 'Stance', x: 470, y: 412 },
      { category: 'details', label: 'Details', x: 772, y: 172 },
    ],
    provenance:
      'Self-generated studio render of a Polo GT TSI side profile, separated into paint, glass, wheel and trim layers. Not a manufacturer or MotorMind photograph.',
  },
}
