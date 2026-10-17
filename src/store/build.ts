import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CameraId, CategoryId, Selections } from '@/data/types'
import { defaultVehicleId } from '@/data/vehicles'
import { applySelection, buildTotal, decodeBuild, defaultSelections, effective, getOption } from '@/lib/configuration'
import { track } from '@/lib/analytics'

export interface SavedBuild {
  id: string
  name: string
  vehicleId: string
  selections: Selections
  total: number
  savedAt: string
}

interface BuildState {
  vehicleId: string
  selections: Selections
  buildName: string
  saved: SavedBuild[]
  // transient UI state (not persisted)
  activeCategory: CategoryId
  camera: CameraId
  compare: boolean
  lastChange: { slot: string; at: number } | null

  select: (optionId: string) => { ok: boolean; reason?: string }
  reset: () => void
  restore: (s: Selections) => void
  setName: (name: string) => void
  setCategory: (c: CategoryId) => void
  setCamera: (c: CameraId) => void
  setCompare: (on: boolean) => void
  loadFromSearch: (search: string) => boolean
  saveBuild: () => SavedBuild
  loadSaved: (id: string) => void
  deleteSaved: (id: string) => void
}

export const useBuild = create<BuildState>()(
  persist(
    (set, get) => ({
      vehicleId: defaultVehicleId,
      selections: defaultSelections(),
      buildName: 'My Polo GT TSI',
      saved: [],
      activeCategory: 'paint',
      camera: 'overview',
      compare: false,
      lastChange: null,

      select: (optionId) => {
        const { selections, vehicleId } = get()
        const res = applySelection(selections, optionId, vehicleId)
        const opt = getOption(optionId)
        if (!res.ok) {
          track('option_blocked', { optionId, reason: res.reason })
          return { ok: false, reason: res.reason }
        }
        set({ selections: res.selections, lastChange: { slot: opt?.slot ?? '', at: Date.now() } })
        track('option_selected', { optionId, slot: opt?.slot, total: buildTotal(res.selections) })
        return { ok: true }
      },
      reset: () => {
        set({ selections: defaultSelections(), camera: 'overview', lastChange: { slot: 'all', at: Date.now() } })
        track('build_reset')
      },
      restore: (s) => set({ selections: effective({ ...defaultSelections(), ...s }), lastChange: { slot: 'all', at: Date.now() } }),
      setName: (buildName) => set({ buildName: buildName.slice(0, 48) }),
      setCategory: (activeCategory) => {
        set({ activeCategory })
        track('category_selected', { category: activeCategory })
      },
      setCamera: (camera) => {
        set({ camera })
        track('camera_changed', { camera })
      },
      setCompare: (compare) => {
        set({ compare })
        track('compare_toggled', { on: compare })
      },
      loadFromSearch: (search) => {
        const decoded = decodeBuild(search)
        if (!decoded) return false
        set({
          selections: decoded.selections,
          vehicleId: decoded.vehicleId ?? get().vehicleId,
          buildName: decoded.name ?? get().buildName,
          lastChange: { slot: 'all', at: Date.now() },
        })
        track('build_loaded', { source: 'link' })
        return true
      },
      saveBuild: () => {
        const { selections, vehicleId, buildName, saved } = get()
        const build: SavedBuild = {
          id: Math.random().toString(36).slice(2, 10),
          name: buildName || 'Untitled build',
          vehicleId,
          selections: effective(selections),
          total: buildTotal(selections),
          savedAt: new Date().toISOString(),
        }
        set({ saved: [build, ...saved].slice(0, 12) })
        track('build_saved', { total: build.total })
        return build
      },
      loadSaved: (id) => {
        const b = get().saved.find((s) => s.id === id)
        if (!b) return
        set({ selections: effective({ ...defaultSelections(), ...b.selections }), vehicleId: b.vehicleId, buildName: b.name, lastChange: { slot: 'all', at: Date.now() } })
        track('build_loaded', { source: 'saved' })
      },
      deleteSaved: (id) => set({ saved: get().saved.filter((s) => s.id !== id) }),
    }),
    {
      name: 'mm-build-v1',
      partialize: (s) => ({ vehicleId: s.vehicleId, selections: s.selections, buildName: s.buildName, saved: s.saved }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<BuildState>
        return {
          ...current,
          ...p,
          // guard against stale/renamed option ids from older versions
          selections: effective({ ...defaultSelections(), ...(p.selections ?? {}) }),
        }
      },
    },
  ),
)

/* ── toasts ──────────────────────────────────────────────────────────────── */
export interface Toast {
  id: number
  title: string
  body?: string
  tone?: 'default' | 'warning' | 'success'
  action?: { label: string; onClick: () => void }
}
interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}
let tid = 0
export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = ++tid
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] })
    window.setTimeout(() => get().dismiss(id), 4200)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))
export const toast = (t: Omit<Toast, 'id'>) => useToasts.getState().push(t)
