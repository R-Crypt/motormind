import type { Finish, GraphicShape, VehicleDef } from '@/data/types'

/* ────────────────────────────────────────────────────────────────────────────
   2.5D paint engine
   The base layer is a white car. Its luminance carries the studio lighting, so
   a new colour is applied as   colour × shading  +  specular highlight,
   with finish-specific contrast/specular. Masks decide which pixels are paint
   (vs glass, lights, trim) and which belong to the roof / mirrors / handles.
   ──────────────────────────────────────────────────────────────────────────── */

export type Material =
  | { kind: 'paint'; color: string; finish: Finish }
  | { kind: 'carbon' }
  | { kind: 'original' }

export interface PaintSpec {
  body: Material
  roof: Material | null
  mirror: Material | null
  handles: Material | null
  graphic: { shape: GraphicShape; color: string } | null
}

interface Assets {
  w: number
  h: number
  body: Uint8ClampedArray
  paint: Float32Array
  shadeLin: Float32Array
  spec: Float32Array
  roof: Float32Array
  mirror: Float32Array
  handles: Float32Array
}

const FINISH = {
  gloss: { specK: 0.9, s0: 0.86, contrast: 1.0, floor: 0.0, env: 0.05 },
  satin: { specK: 0.35, s0: 0.8, contrast: 0.75, floor: 0.02, env: 0.03 },
  matte: { specK: 0.06, s0: 0.75, contrast: 0.55, floor: 0.035, env: 0.0 },
} as const

/* sRGB <-> linear lookup tables */
const S2L = new Float32Array(256)
for (let i = 0; i < 256; i++) {
  const c = i / 255
  S2L[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}
const L2S = new Uint8ClampedArray(4096)
for (let i = 0; i < 4096; i++) {
  const c = i / 4095
  L2S[i] = Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055))
}
const toS = (lin: number) => L2S[lin <= 0 ? 0 : lin >= 1 ? 4095 : (lin * 4095) | 0]

function hexToLin(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [S2L[parseInt(h.slice(0, 2), 16)], S2L[parseInt(h.slice(2, 4), 16)], S2L[parseInt(h.slice(4, 6), 16)]]
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

function pixels(img: HTMLImageElement, w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, w, h)
  return ctx.getImageData(0, 0, w, h).data
}

const assetCache = new Map<string, Promise<Assets>>()

export function loadAssets(vehicle: VehicleDef): Promise<Assets> {
  const key = vehicle.id
  if (!assetCache.has(key)) {
    const base = vehicle.renderer.basePath
    const { width: w, height: h } = vehicle.renderer.geometry
    const p = Promise.all([loadImage(`${base}/body.webp`), loadImage(`${base}/maps.png`), loadImage(`${base}/regions.png`)]).then(
      ([bodyImg, mapsImg, regImg]) => {
        const body = pixels(bodyImg, w, h)
        const maps = pixels(mapsImg, w, h)
        const reg = pixels(regImg, w, h)
        const n = w * h
        const a: Assets = {
          w, h, body,
          paint: new Float32Array(n), shadeLin: new Float32Array(n), spec: new Float32Array(n),
          roof: new Float32Array(n), mirror: new Float32Array(n), handles: new Float32Array(n),
        }
        for (let i = 0, j = 0; i < n; i++, j += 4) {
          a.paint[i] = maps[j] / 255
          a.shadeLin[i] = S2L[maps[j + 1]]
          a.spec[i] = maps[j + 2] / 255
          a.roof[i] = reg[j] / 255
          a.mirror[i] = reg[j + 1] / 255
          a.handles[i] = reg[j + 2] / 255
        }
        return a
      },
    )
    p.catch(() => assetCache.delete(key))
    assetCache.set(key, p)
  }
  return assetCache.get(key)!
}

function graphicMask(vehicle: VehicleDef, shape: GraphicShape, w: number, h: number): Float32Array {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  const path = new Path2D(vehicle.renderer.graphics[shape])
  if (shape === 'fade') {
    const g = ctx.createLinearGradient(0, 300, 0, 405)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.55, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,1)')
    ctx.fillStyle = g
  } else ctx.fillStyle = '#fff'
  ctx.fill(path)
  const d = ctx.getImageData(0, 0, w, h).data
  const out = new Float32Array(w * h)
  for (let i = 0, j = 3; i < out.length; i++, j += 4) out[i] = d[j] / 255
  return out
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = x <= e0 ? 0 : x >= e1 ? 1 : (x - e0) / (e1 - e0)
  return t * t * (3 - 2 * t)
}

/** Shade one material at pixel i into out[o..o+2] (sRGB bytes as floats 0..255). */
type Shader = (i: number, x: number, y: number, out: Float32Array) => void

function makeShader(m: Material, a: Assets): Shader {
  if (m.kind === 'original') {
    return (i, _x, _y, out) => {
      const j = i * 4
      out[0] = a.body[j]; out[1] = a.body[j + 1]; out[2] = a.body[j + 2]
    }
  }
  const f = m.kind === 'carbon' ? FINISH.gloss : FINISH[m.finish]
  const base = m.kind === 'carbon' ? null : hexToLin(m.color)
  return (i, x, y, out) => {
    let cr: number, cg: number, cb: number
    if (base) {
      cr = base[0]; cg = base[1]; cb = base[2]
    } else {
      // 2x2 twill weave
      const weave = ((((x + y) >> 2) & 1) ^ (((x - y + 4096) >> 2) & 1)) === 1
      const v = weave ? 0.05 : 0.022
      cr = v; cg = v * 1.02; cb = v * 1.08
    }
    let shade = a.shadeLin[i] / 0.7
    if (shade > 1.6) shade = 1.6
    shade = 1 + (shade - 1) * f.contrast
    const sp = smooth(f.s0, 1, a.spec[i]) * f.specK
    const env = f.env * shade * 0.3
    let r = cr * shade, g = cg * shade, b = cb * shade
    r = r + (1 - r) * sp + env; g = g + (1 - g) * sp + env; b = b + (1 - b) * sp + env
    if (r < f.floor) r = f.floor
    if (g < f.floor) g = f.floor
    if (b < f.floor) b = f.floor
    out[0] = toS(r); out[1] = toS(g); out[2] = toS(b)
  }
}

const resultCache = new Map<string, ImageData>()
export const specKey = (vehicleId: string, s: PaintSpec) => vehicleId + JSON.stringify(s)

/** Render a full body layer for `spec`. Results are cached (LRU 10). */
export async function renderBody(vehicle: VehicleDef, spec: PaintSpec): Promise<ImageData> {
  const key = specKey(vehicle.id, spec)
  const hit = resultCache.get(key)
  if (hit) {
    resultCache.delete(key)
    resultCache.set(key, hit)
    return hit
  }
  const a = await loadAssets(vehicle)
  const { w, h } = a
  const out = new ImageData(w, h)
  const o = out.data
  o.set(a.body)

  const isOrig = (m: Material | null) => !m || m.kind === 'original'
  const trivial = spec.body.kind === 'original' && isOrig(spec.roof) && isOrig(spec.mirror) && isOrig(spec.handles) && !spec.graphic
  if (!trivial) {
    const shBody = makeShader(spec.body, a)
    const shRoof = spec.roof ? makeShader(spec.roof, a) : null
    const shMirror = spec.mirror ? makeShader(spec.mirror, a) : null
    const shHandles = spec.handles ? makeShader(spec.handles, a) : null
    const shGraphic = spec.graphic ? makeShader({ kind: 'paint', color: spec.graphic.color, finish: 'gloss' }, a) : null
    const gm = spec.graphic ? graphicMask(vehicle, spec.graphic.shape, w, h) : null
    const c = new Float32Array(3)
    const t = new Float32Array(3)
    const mix = (k: number) => {
      c[0] += (t[0] - c[0]) * k; c[1] += (t[1] - c[1]) * k; c[2] += (t[2] - c[2]) * k
    }
    for (let y = 0, i = 0; y < h; y++) {
      for (let x = 0; x < w; x++, i++) {
        const wgt = a.paint[i]
        if (wgt < 0.004) continue
        shBody(i, x, y, c)
        if (gm && shGraphic && gm[i] > 0.004) { shGraphic(i, x, y, t); mix(gm[i]) }
        if (shRoof && a.roof[i] > 0.004) { shRoof(i, x, y, t); mix(a.roof[i]) }
        if (shMirror && a.mirror[i] > 0.004) { shMirror(i, x, y, t); mix(a.mirror[i]) }
        if (shHandles && a.handles[i] > 0.004) { shHandles(i, x, y, t); mix(a.handles[i]) }
        const j = i * 4
        o[j] = o[j] + (c[0] - o[j]) * wgt
        o[j + 1] = o[j + 1] + (c[1] - o[j + 1]) * wgt
        o[j + 2] = o[j + 2] + (c[2] - o[j + 2]) * wgt
      }
    }
  }
  resultCache.set(key, out)
  if (resultCache.size > 10) resultCache.delete(resultCache.keys().next().value!)
  return out
}
