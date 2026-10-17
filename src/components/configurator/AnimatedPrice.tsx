import { useEffect, useRef, useState } from 'react'
import { cn, formatINR, prefersReducedMotion } from '@/lib/utils'

/** Price that counts to its new value, like a game HUD — instant under reduced motion. */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const [bump, setBump] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion() || from.current === value) {
      from.current = value
      setShown(value)
      return
    }
    const start = performance.now()
    const a = from.current
    const dur = 650
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur)
      const e = 1 - Math.pow(1 - k, 4)
      setShown(Math.round(a + (value - a) * e))
      if (k < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    setBump((b) => b + 1)
    return () => {
      cancelAnimationFrame(raf)
      from.current = value
    }
  }, [value])

  return (
    <span className={cn('tabular inline-block', className)}>
      <span key={bump} className={bump ? 'inline-block animate-[fade-in_300ms_ease-out]' : undefined}>
        {formatINR(shown)}
      </span>
    </span>
  )
}
