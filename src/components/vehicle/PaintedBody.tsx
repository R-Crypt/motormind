import { useEffect, useRef, useState } from 'react'
import type { VehicleDef } from '@/data/types'
import { renderBody, specKey, type PaintSpec } from '@/render/paintEngine'
import { prefersReducedMotion } from '@/lib/utils'

/**
 * Paint layer. Renders the recoloured body into one of two canvases and fades
 * the new one in over the old, so colour changes feel like a smooth respray.
 * The untouched factory image sits underneath as an instant first paint and
 * as the fallback if the shading maps fail to load.
 */
export function PaintedBody({ vehicle, spec, onStatus }: { vehicle: VehicleDef; spec: PaintSpec; onStatus?: (s: 'ready' | 'error') => void }) {
  const a = useRef<HTMLCanvasElement>(null)
  const b = useRef<HTMLCanvasElement>(null)
  const top = useRef<0 | 1 | -1>(-1)
  const [ready, setReady] = useState(false)
  const { width: W, height: H } = vehicle.renderer.geometry
  const key = specKey(vehicle.id, spec)
  const statusRef = useRef(onStatus)
  statusRef.current = onStatus

  useEffect(() => {
    let cancelled = false
    renderBody(vehicle, spec)
      .then((img) => {
        if (cancelled) return
        const nextIdx: 0 | 1 = top.current === 0 ? 1 : 0
        const next = (nextIdx === 0 ? a : b).current
        const prev = (nextIdx === 0 ? b : a).current
        if (!next || !prev) return
        next.getContext('2d')!.putImageData(img, 0, 0)
        next.style.zIndex = '2'
        prev.style.zIndex = '1'
        next.style.opacity = '1'
        if (top.current !== -1 && !prefersReducedMotion()) {
          next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
        }
        top.current = nextIdx
        setReady(true)
        statusRef.current?.('ready')
      })
      .catch(() => {
        if (!cancelled) statusRef.current?.('error')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <>
      <img
        src={`${vehicle.renderer.basePath}/body.webp`}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full select-none"
        style={{ visibility: ready ? 'hidden' : 'visible' }}
      />
      <canvas ref={a} width={W} height={H} className="absolute inset-0 h-full w-full" style={{ opacity: 0 }} aria-hidden />
      <canvas ref={b} width={W} height={H} className="absolute inset-0 h-full w-full" style={{ opacity: 0 }} aria-hidden />
    </>
  )
}
