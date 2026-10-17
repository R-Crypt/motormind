import type { CategoryDef, ModOption, SlotDef } from './types'

/**
 * MODIFICATION CATALOGUE — single source for options and indicative prices.
 *
 * ⚠ All prices are ILLUSTRATIVE DEMO FIGURES (INR), not MotorMind quotations.
 * Every specific part is a conceptual demo option. Where a verified MotorMind
 * service line exists (Body Wrap, Bodykits, Bodyshop), it is referenced via
 * `serviceLine` so the UI can say "related service" — never "in stock".
 */

const POLO = ['polo-gt-tsi']

export const categories: CategoryDef[] = [
  { id: 'paint', label: 'Paint & Wrap', short: 'Paint', blurb: 'Respray colours, vinyl wraps and finish.', camera: 'overview' },
  { id: 'wheels', label: 'Wheels', short: 'Wheels', blurb: 'Alloy designs and finishes.', camera: 'wheels' },
  { id: 'exterior', label: 'Exterior Styling', short: 'Aero', blurb: 'Splitter, skirts, diffuser and spoiler.', camera: 'side' },
  { id: 'stance', label: 'Stance', short: 'Stance', blurb: 'Visual ride-height presets.', camera: 'side' },
  { id: 'details', label: 'Details', short: 'Details', blurb: 'Mirrors, roof, handles and graphics.', camera: 'roof' },
]

export const slots: SlotDef[] = [
  { id: 'surface', category: 'paint', label: 'Colour', kind: 'single', defaultOption: 'surface-factory', presentation: 'swatch', camera: 'overview' },
  {
    id: 'finish', category: 'paint', label: 'Finish', kind: 'single', defaultOption: 'finish-gloss', presentation: 'segmented',
    dependsOn: { slot: 'surface', anyTag: ['respray', 'wrap'], inactiveHint: 'Choose a respray or wrap colour to change the finish.' },
  },
  { id: 'wheel', category: 'wheels', label: 'Design', kind: 'single', defaultOption: 'wheel-stock', presentation: 'wheel', camera: 'wheels' },
  {
    id: 'wheelFinish', category: 'wheels', label: 'Finish', kind: 'single', defaultOption: 'wf-silver', presentation: 'segmented', camera: 'wheels',
    dependsOn: { slot: 'wheel', anyTag: ['aftermarket'], inactiveHint: 'Factory wheels keep their original two-tone finish.' },
  },
  { id: 'frontLip', category: 'exterior', label: 'Front', kind: 'toggle', defaultOption: 'lip-none', presentation: 'card', camera: 'front' },
  { id: 'sideSkirts', category: 'exterior', label: 'Sides', kind: 'toggle', defaultOption: 'skirts-none', presentation: 'card', camera: 'side' },
  { id: 'rearDiffuser', category: 'exterior', label: 'Rear', kind: 'toggle', defaultOption: 'diffuser-none', presentation: 'card', camera: 'rear' },
  { id: 'spoiler', category: 'exterior', label: 'Roof', kind: 'toggle', defaultOption: 'spoiler-none', presentation: 'card', camera: 'rear' },
  {
    id: 'kitFinish', category: 'exterior', label: 'Kit finish', kind: 'single', defaultOption: 'kit-gloss-black', presentation: 'segmented',
    dependsOn: [
      { slot: 'frontLip', anyTag: ['kit'], inactiveHint: 'Add a styling part to choose its finish.' },
      { slot: 'sideSkirts', anyTag: ['kit'], inactiveHint: '' },
      { slot: 'rearDiffuser', anyTag: ['kit'], inactiveHint: '' },
      { slot: 'spoiler', anyTag: ['kit'], inactiveHint: '' },
    ],
  },
  { id: 'stance', category: 'stance', label: 'Ride height', kind: 'single', defaultOption: 'stance-stock', presentation: 'card', camera: 'side' },
  { id: 'mirrors', category: 'details', label: 'Mirror caps', kind: 'single', defaultOption: 'mirror-body', presentation: 'segmented', camera: 'roof' },
  { id: 'roof', category: 'details', label: 'Roof', kind: 'single', defaultOption: 'roof-body', presentation: 'segmented', camera: 'roof' },
  { id: 'handles', category: 'details', label: 'Door handles', kind: 'single', defaultOption: 'handles-body', presentation: 'segmented', camera: 'side' },
  { id: 'graphic', category: 'details', label: 'Side graphics', kind: 'single', defaultOption: 'graphic-none', presentation: 'card', camera: 'side' },
  {
    id: 'graphicColour', category: 'details', label: 'Graphic colour', kind: 'single', defaultOption: 'gc-black', presentation: 'swatch', camera: 'side',
    dependsOn: { slot: 'graphic', anyTag: ['graphic'], inactiveHint: 'Pick a graphic to choose its colour.' },
  },
]

/* ── helpers to keep the catalogue terse ─────────────────────────────────── */
const respray = (id: string, name: string, color: string, price = 85000): ModOption => ({
  id: `surface-${id}`, slot: 'surface', name, price, availability: 'concept', serviceLine: 'bodyshop',
  tags: ['respray'], meta: 'Full respray', supportedVariants: POLO, visual: { color, swatch: color },
  description: 'Full-body respray. Final shade matched from physical samples.',
})
const wrap = (id: string, name: string, color: string, price = 55000): ModOption => ({
  id: `surface-${id}`, slot: 'surface', name, price, availability: 'concept', serviceLine: 'bodyWrap',
  tags: ['wrap'], meta: 'Full vinyl wrap', supportedVariants: POLO, visual: { color, swatch: color },
  description: 'Removable full-body vinyl wrap that protects the original paint.',
})

export const options: ModOption[] = [
  /* ── Paint & wrap ─────────────────────────────────────────────────────── */
  {
    id: 'surface-factory', slot: 'surface', name: 'Factory white', price: 0, availability: 'stock', tags: ['factory'],
    meta: 'As delivered', supportedVariants: POLO, visual: { swatch: 'linear-gradient(135deg,#ffffff,#d9dadc)' },
    description: 'Your car as it left the factory.',
  },
  respray('mm-red', 'MotorMind Red', '#b8101c'),
  respray('midnight', 'Midnight Black', '#0b0c0f'),
  respray('graphite', 'Graphite Grey', '#4b5058'),
  respray('lapis', 'Lapis Blue', '#1d3f8e'),
  respray('racing-green', 'Racing Green', '#1c4632'),
  respray('sunburst', 'Sunburst Orange', '#d9611c', 92000),
  respray('arctic', 'Arctic Silver', '#b7bbc1'),
  respray('pearl', 'Pearl White', '#efede7', 92000),
  wrap('concrete', 'Concrete Grey', '#8b8e90'),
  wrap('stealth', 'Stealth Black', '#111215'),
  wrap('desert', 'Desert Sand', '#b39a74'),
  wrap('copper', 'Liquid Copper', '#9b5a34', 68000),
  wrap('teal', 'Electric Teal', '#10807e', 62000),
  wrap('lime', 'Acid Lime', '#93c11f', 62000),
  wrap('sky', 'Sky Blue', '#5e94c9'),

  { id: 'finish-gloss', slot: 'finish', name: 'Gloss', price: 0, availability: 'concept', supportedVariants: POLO, visual: { finish: 'gloss' }, description: 'Deep, mirror-like reflections.' },
  {
    id: 'finish-satin', slot: 'finish', name: 'Satin', price: 0, availability: 'concept', supportedVariants: POLO, visual: { finish: 'satin' },
    description: 'Soft sheen with muted highlights.',
    priceModifiers: [{ slot: 'surface', tag: 'respray', price: 18000 }, { slot: 'surface', tag: 'wrap', price: 6000 }],
  },
  {
    id: 'finish-matte', slot: 'finish', name: 'Matte', price: 0, availability: 'concept', supportedVariants: POLO, visual: { finish: 'matte' },
    description: 'Flat, non-reflective finish. Needs specialist care.',
    priceModifiers: [{ slot: 'surface', tag: 'respray', price: 22000 }, { slot: 'surface', tag: 'wrap', price: 5000 }],
  },

  /* ── Wheels ───────────────────────────────────────────────────────────── */
  {
    id: 'wheel-stock', slot: 'wheel', name: 'Factory alloys', price: 0, availability: 'stock', tags: ['stock'], meta: '16" · factory',
    supportedVariants: POLO, visual: { wheelImage: 'stock' }, description: 'Original two-tone machined alloys.',
  },
  {
    id: 'wheel-apex', slot: 'wheel', name: 'Apex twin 5-spoke', price: 58000, availability: 'concept', tags: ['aftermarket'],
    meta: '17" · set of 4', supportedVariants: POLO, visual: { wheelImage: 'apex' },
    description: 'Split five-spoke with a light concave face.',
  },
  {
    id: 'wheel-vortex', slot: 'wheel', name: 'Vortex turbine', price: 64000, availability: 'concept', tags: ['aftermarket'],
    meta: '17" · set of 4', supportedVariants: POLO, visual: { wheelImage: 'vortex' },
    description: 'Directional multi-blade design with motion even at rest.',
  },
  {
    id: 'wheel-monoblock', slot: 'wheel', name: 'Monoblock 6-spoke', price: 68000, availability: 'concept', tags: ['aftermarket'],
    meta: '17" · set of 4', supportedVariants: POLO, visual: { wheelImage: 'monoblock' },
    description: 'Motorsport-inspired six-spoke with a deep dish.',
  },
  {
    id: 'wheel-lattice', slot: 'wheel', name: 'Lattice cross-spoke', price: 74000, availability: 'concept', tags: ['aftermarket'],
    meta: '17" · set of 4', supportedVariants: POLO, visual: { wheelImage: 'lattice' },
    description: 'Classic mesh with a polished stepped lip.',
  },
  { id: 'wf-silver', slot: 'wheelFinish', name: 'Silver', price: 0, availability: 'concept', supportedVariants: POLO, visual: { swatch: 'linear-gradient(135deg,#f3f4f6,#9ea3aa)' } },
  { id: 'wf-gunmetal', slot: 'wheelFinish', name: 'Gunmetal', price: 4000, availability: 'concept', supportedVariants: POLO, visual: { swatch: 'linear-gradient(135deg,#6c7178,#2e3136)' } },
  { id: 'wf-black', slot: 'wheelFinish', name: 'Gloss black', price: 4000, availability: 'concept', supportedVariants: POLO, visual: { swatch: 'linear-gradient(135deg,#3a3c40,#060607)' } },
  { id: 'wf-bronze', slot: 'wheelFinish', name: 'Bronze', price: 6000, availability: 'concept', supportedVariants: POLO, visual: { swatch: 'linear-gradient(135deg,#c79a5b,#6e4f25)' } },

  /* ── Exterior styling ─────────────────────────────────────────────────── */
  { id: 'lip-none', slot: 'frontLip', name: 'Factory bumper', price: 0, availability: 'stock', supportedVariants: POLO },
  {
    id: 'lip-splitter', slot: 'frontLip', name: 'Front splitter', price: 14500, availability: 'concept', serviceLine: 'bodykits', tags: ['kit'],
    meta: 'Bolt-on blade', supportedVariants: POLO, description: 'Low blade that extends the front bumper line.',
  },
  { id: 'skirts-none', slot: 'sideSkirts', name: 'Factory sills', price: 0, availability: 'stock', supportedVariants: POLO },
  {
    id: 'skirts-blade', slot: 'sideSkirts', name: 'Side skirt extensions', price: 19000, availability: 'concept', serviceLine: 'bodykits', tags: ['kit'],
    meta: 'Pair', supportedVariants: POLO, description: 'Sill blades that visually lower the car between the wheels.',
  },
  { id: 'diffuser-none', slot: 'rearDiffuser', name: 'Factory valance', price: 0, availability: 'stock', supportedVariants: POLO },
  {
    id: 'diffuser-fin', slot: 'rearDiffuser', name: 'Rear diffuser', price: 16500, availability: 'concept', serviceLine: 'bodykits', tags: ['kit'],
    meta: '3-fin', supportedVariants: POLO, description: 'Under-bumper diffuser with vertical strakes.',
  },
  { id: 'spoiler-none', slot: 'spoiler', name: 'Factory spoiler', price: 0, availability: 'stock', supportedVariants: POLO },
  {
    id: 'spoiler-ext', slot: 'spoiler', name: 'Roof spoiler extension', price: 12500, availability: 'concept', serviceLine: 'bodykits', tags: ['kit'],
    meta: 'Add-on wing', supportedVariants: POLO, description: 'Extends the factory roof spoiler for a longer profile.',
  },
  { id: 'kit-gloss-black', slot: 'kitFinish', name: 'Gloss black', price: 0, availability: 'concept', supportedVariants: POLO, visual: { material: 'gloss-black', swatch: 'linear-gradient(135deg,#3a3c40,#060607)' } },
  { id: 'kit-body', slot: 'kitFinish', name: 'Body colour', price: 6000, availability: 'concept', supportedVariants: POLO, visual: { material: 'body', swatch: 'conic-gradient(from 200deg,#b8101c,#1d3f8e,#efede7,#b8101c)' }, description: 'Painted to match the car.' },
  {
    id: 'kit-carbon', slot: 'kitFinish', name: 'Carbon-look', price: 9000, availability: 'concept', supportedVariants: POLO,
    visual: { material: 'carbon', swatch: 'repeating-linear-gradient(45deg,#1b1c1f 0 3px,#2c2e33 3px 6px)' },
    description: 'Carbon-pattern finish. Real carbon fibre availability to be confirmed.',
  },

  /* ── Stance ───────────────────────────────────────────────────────────── */
  { id: 'stance-stock', slot: 'stance', name: 'Factory height', price: 0, availability: 'stock', supportedVariants: POLO, visual: { dropMm: 0 }, meta: '0 mm', description: 'Standard ride height.' },
  {
    id: 'stance-mild', slot: 'stance', name: 'Mild drop', price: 26000, availability: 'concept', supportedVariants: POLO, visual: { dropMm: 25 },
    meta: '−25 mm visual', description: 'Subtle drop that closes the wheel-arch gap.',
  },
  {
    id: 'stance-low', slot: 'stance', name: 'Aggressive drop', price: 42000, availability: 'concept', supportedVariants: POLO, visual: { dropMm: 40 },
    meta: '−40 mm visual', description: 'Track-inspired stance. Ground clearance must be assessed for Indian roads.',
    excludes: ['lip-splitter'],
    excludeReason: 'Demo rule: the aggressive drop is not combined with the front splitter until MotorMind assesses ground clearance.',
  },

  /* ── Details ──────────────────────────────────────────────────────────── */
  { id: 'mirror-body', slot: 'mirrors', name: 'Body colour', price: 0, availability: 'stock', supportedVariants: POLO },
  { id: 'mirror-black', slot: 'mirrors', name: 'Gloss black', price: 4500, availability: 'concept', serviceLine: 'bodyWrap', supportedVariants: POLO, visual: { material: 'gloss-black' } },
  { id: 'mirror-carbon', slot: 'mirrors', name: 'Carbon-look', price: 7500, availability: 'concept', supportedVariants: POLO, visual: { material: 'carbon' } },
  { id: 'roof-body', slot: 'roof', name: 'Body colour', price: 0, availability: 'stock', supportedVariants: POLO },
  { id: 'roof-black', slot: 'roof', name: 'Gloss black', price: 12000, availability: 'concept', serviceLine: 'bodyWrap', supportedVariants: POLO, visual: { material: 'gloss-black' }, description: 'Contrast roof wrap.' },
  { id: 'handles-body', slot: 'handles', name: 'Body colour', price: 0, availability: 'stock', supportedVariants: POLO },
  { id: 'handles-black', slot: 'handles', name: 'Gloss black', price: 3500, availability: 'concept', serviceLine: 'bodyWrap', supportedVariants: POLO, visual: { material: 'gloss-black' } },
  { id: 'graphic-none', slot: 'graphic', name: 'None', price: 0, availability: 'stock', supportedVariants: POLO },
  {
    id: 'graphic-rocker', slot: 'graphic', name: 'GT rocker stripe', price: 8500, availability: 'concept', serviceLine: 'bodyWrap', tags: ['graphic'],
    supportedVariants: POLO, visual: { shape: 'rocker' }, meta: 'Vinyl', description: 'Twin-line stripe along the lower doors.',
  },
  {
    id: 'graphic-shoulder', slot: 'graphic', name: 'Shoulder pinstripes', price: 6500, availability: 'concept', serviceLine: 'bodyWrap', tags: ['graphic'],
    supportedVariants: POLO, visual: { shape: 'shoulder' }, meta: 'Vinyl', description: 'Fine double pinstripe following the shoulder line.',
  },
  {
    id: 'graphic-fade', slot: 'graphic', name: 'Lower body fade', price: 11000, availability: 'concept', serviceLine: 'bodyWrap', tags: ['graphic'],
    supportedVariants: POLO, visual: { shape: 'fade' }, meta: 'Printed vinyl', description: 'Gradient that rises from the sills into the doors.',
  },
  { id: 'gc-black', slot: 'graphicColour', name: 'Black', price: 0, availability: 'concept', supportedVariants: POLO, visual: { color: '#0d0e10', swatch: '#0d0e10' } },
  { id: 'gc-white', slot: 'graphicColour', name: 'White', price: 0, availability: 'concept', supportedVariants: POLO, visual: { color: '#f1f0ec', swatch: '#f1f0ec' } },
  { id: 'gc-red', slot: 'graphicColour', name: 'MotorMind Red', price: 0, availability: 'concept', supportedVariants: POLO, visual: { color: '#c20e1b', swatch: '#c20e1b' } },
  { id: 'gc-gold', slot: 'graphicColour', name: 'Satin Gold', price: 0, availability: 'concept', supportedVariants: POLO, visual: { color: '#c39b4a', swatch: '#c39b4a' } },
]

export const optionById = new Map(options.map((o) => [o.id, o]))
export const slotById = new Map(slots.map((s) => [s.id, s]))
