import { Columns2, Info } from 'lucide-react'
import type { CameraId } from '@/data/types'
import { cn } from '@/lib/utils'
import { useBuild } from '@/store/build'
import { useUI } from '@/store/ui'

const CAMS: { id: CameraId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'rear', label: 'Rear' },
  { id: 'wheels', label: 'Wheels' },
  { id: 'roof', label: 'Roof' },
]

/** Camera presets, before/after compare and preview transparency info. */
export function ViewportToolbar({ className }: { className?: string }) {
  const camera = useBuild((s) => s.camera)
  const compare = useBuild((s) => s.compare)
  const setCamera = useBuild((s) => s.setCamera)
  const setCompare = useBuild((s) => s.setCompare)
  const open = useUI((s) => s.open)

  return (
    <div className={cn('flex max-w-full items-center gap-1.5', className)}>
      <div role="group" aria-label="Camera" className="rail flex min-w-0 items-center overflow-x-auto rounded-full border border-line bg-ink-950/75 p-1 backdrop-blur-sm">
        {CAMS.map((c) => (
          <button
            key={c.id}
            id={`cam-${c.id}`}
            type="button"
            aria-pressed={!compare && camera === c.id}
            onClick={() => {
              if (compare) setCompare(false)
              setCamera(c.id)
            }}
            className={cn(
              'h-7 shrink-0 rounded-full px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
              !compare && camera === c.id ? 'bg-fg text-ink-950' : 'text-fg-muted hover:text-fg',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <button
        id="toggle-compare"
        type="button"
        aria-pressed={compare}
        onClick={() => {
          setCompare(!compare)
          if (!compare) setCamera('overview')
        }}
        className={cn(
          'flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors',
          compare ? 'border-accent bg-accent text-white' : 'border-line bg-ink-950/75 text-fg-muted backdrop-blur-sm hover:text-fg',
        )}
      >
        <Columns2 className="size-3.5" /> <span className="hidden sm:inline">Before / after</span>
        <span className="sm:hidden">Compare</span>
      </button>
      <button
        id="preview-info"
        type="button"
        onClick={() => open('preview-info')}
        aria-label="About this preview"
        className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-ink-950/75 text-fg-muted backdrop-blur-sm hover:text-fg"
      >
        <Info className="size-4" />
      </button>
    </div>
  )
}
