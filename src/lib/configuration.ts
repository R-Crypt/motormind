import { optionById, options, slotById, slots, categories } from '@/data/catalog'
import type { CategoryId, ModOption, Selections, SlotDef, SlotId } from '@/data/types'

/* ────────────────────────────────────────────────────────────────────────────
   Pure configuration logic: no React, no DOM. The store and every view derive
   from these functions so price, visuals and summary can never disagree.
   ──────────────────────────────────────────────────────────────────────────── */

export const defaultSelections = (): Selections =>
  Object.fromEntries(slots.map((s) => [s.id, s.defaultOption])) as Selections

export const getOption = (id: string) => optionById.get(id)

const hasTag = (opt: ModOption | undefined, tags: string[]) => !!opt?.tags?.some((t) => tags.includes(t))

/** A dependent slot only applies when its dependency is met (any of, for arrays). */
export function isSlotActive(slot: SlotDef, sel: Selections): boolean {
  if (!slot.dependsOn) return true
  const deps = Array.isArray(slot.dependsOn) ? slot.dependsOn : [slot.dependsOn]
  return deps.some((d) => hasTag(getOption(sel[d.slot]), d.anyTag))
}

export function inactiveHint(slot: SlotDef): string {
  if (!slot.dependsOn) return ''
  const deps = Array.isArray(slot.dependsOn) ? slot.dependsOn : [slot.dependsOn]
  return deps.find((d) => d.inactiveHint)?.inactiveHint ?? ''
}

/** Selections with inactive dependent slots forced back to their defaults. */
export function effective(sel: Selections): Selections {
  const out = { ...sel }
  for (const s of slots) {
    if (!getOption(out[s.id]) || !isSlotActive(s, out)) out[s.id] = s.defaultOption
  }
  return out
}

/** Returns the selected option that blocks `opt`, if any (constraints are symmetric). */
export function findConflict(opt: ModOption, sel: Selections): ModOption | undefined {
  for (const slotId of Object.keys(sel) as SlotId[]) {
    if (slotId === opt.slot) continue
    const other = getOption(sel[slotId])
    if (!other) continue
    if (opt.excludes?.includes(other.id) || other.excludes?.includes(opt.id)) return other
  }
  return undefined
}

export function conflictReason(opt: ModOption, sel: Selections): string | null {
  const other = findConflict(opt, sel)
  if (!other) return null
  return opt.excludeReason ?? other.excludeReason ?? `Not available with ${other.name}.`
}

export type SelectResult = { ok: true; selections: Selections } | { ok: false; reason: string }

/**
 * Select an option. Single slots replace the previous choice (so two wheel sets
 * can never both be charged); toggle slots switch between part and "none".
 */
export function applySelection(sel: Selections, optionId: string, vehicleId: string): SelectResult {
  const opt = getOption(optionId)
  if (!opt) return { ok: false, reason: 'Unknown option.' }
  if (!opt.supportedVariants.includes(vehicleId)) return { ok: false, reason: 'Not available for this vehicle.' }
  const slot = slotById.get(opt.slot)!
  if (!isSlotActive(slot, sel)) return { ok: false, reason: inactiveHint(slot) }

  let next = opt.id
  if (slot.kind === 'toggle' && sel[slot.id] === opt.id) next = slot.defaultOption
  const nextOpt = getOption(next)!
  const reason = conflictReason(nextOpt, sel)
  if (reason) return { ok: false, reason }
  return { ok: true, selections: effective({ ...sel, [slot.id]: next }) }
}

/* ── pricing ──────────────────────────────────────────────────────────────── */

export interface LineItem {
  slot: SlotDef
  option: ModOption
  price: number
  category: CategoryId
  label: string
}

export function optionPrice(opt: ModOption, sel: Selections): number {
  let p = opt.price
  for (const m of opt.priceModifiers ?? []) {
    if (getOption(sel[m.slot])?.tags?.includes(m.tag)) p += m.price
  }
  return p
}

/** Every non-default choice in the build, in catalogue order. */
export function lineItems(sel: Selections): LineItem[] {
  const e = effective(sel)
  const items: LineItem[] = []
  for (const s of slots) {
    const opt = getOption(e[s.id])
    if (!opt || opt.id === s.defaultOption && optionPrice(opt, e) === 0) continue
    if (opt.availability === 'stock') continue
    items.push({ slot: s, option: opt, price: optionPrice(opt, e), category: s.category, label: s.label })
  }
  return items
}

export const buildTotal = (sel: Selections) => lineItems(sel).reduce((sum, li) => sum + li.price, 0)

export const isStock = (sel: Selections) => lineItems(sel).length === 0

export function categoryCount(sel: Selections, cat: CategoryId) {
  return lineItems(sel).filter((li) => li.category === cat).length
}

export const categoryLabel = (id: CategoryId) => categories.find((c) => c.id === id)?.label ?? id

/* ── share encoding: readable, stable query params ────────────────────────── */

const SHORT: Record<SlotId, string> = {
  surface: 'c', finish: 'f', wheel: 'w', wheelFinish: 'wf', frontLip: 'fl', sideSkirts: 'ss', rearDiffuser: 'rd',
  spoiler: 'sp', kitFinish: 'kf', stance: 'st', mirrors: 'mi', roof: 'ro', handles: 'ha', graphic: 'g', graphicColour: 'gc',
}
const prefixOf = (slot: SlotId) => {
  const def = slotById.get(slot)!.defaultOption
  return def.slice(0, def.indexOf('-') + 1)
}

export function encodeBuild(sel: Selections, vehicleId: string, name?: string): string {
  const p = new URLSearchParams()
  p.set('v', vehicleId)
  const e = effective(sel)
  for (const s of slots) {
    if (e[s.id] === s.defaultOption) continue
    p.set(SHORT[s.id], e[s.id].slice(prefixOf(s.id).length))
  }
  if (name) p.set('n', name)
  return p.toString()
}

export function decodeBuild(search: string): { selections: Selections; vehicleId?: string; name?: string } | null {
  const p = new URLSearchParams(search)
  if (![...p.keys()].some((k) => k === 'v' || Object.values(SHORT).includes(k))) return null
  const sel = defaultSelections()
  for (const s of slots) {
    const v = p.get(SHORT[s.id])
    if (!v) continue
    const id = prefixOf(s.id) + v
    if (optionById.get(id)?.slot === s.id) sel[s.id] = id
  }
  // Drop conflicting picks deterministically (later slots lose)
  for (const s of slots) {
    const opt = getOption(sel[s.id])!
    if (findConflict(opt, { ...sel, [s.id]: s.defaultOption })) sel[s.id] = s.defaultOption
  }
  return { selections: effective(sel), vehicleId: p.get('v') ?? undefined, name: p.get('n') ?? undefined }
}

/** Short human-friendly build reference, stable for a given configuration. */
export function buildCode(sel: Selections, vehicleId: string): string {
  const s = encodeBuild(sel, vehicleId)
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return 'MM-' + (h >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(0, 6)
}

export const allOptions = options
