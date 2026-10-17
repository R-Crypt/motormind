import { Check, X } from 'lucide-react'
import { disclaimers } from '@/config/brand'
import { getVehicle } from '@/data/vehicles'
import { useBuild } from '@/store/build'
import { useUI } from '@/store/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const LIVE = ['Paint colours with gloss, satin and matte finishes', 'Vinyl wrap colours', 'Five wheel designs in four finishes', 'Front splitter, side skirts, rear diffuser, spoiler extension', 'Kit finish: gloss black, body colour, carbon-look', 'Visual ride-height drop', 'Mirror caps, contrast roof, door handles', 'Side graphics in four colours']
const NOT_YET = ['Grille and badge treatments (need a front view)', 'Rotating 360° views', 'Interior trim']

/** Transparency about how the preview is made. */
export function PreviewInfoDialog() {
  const isOpen = useUI((s) => s.dialog === 'preview-info')
  const close = useUI((s) => s.close)
  const v = getVehicle(useBuild((s) => s.vehicleId))
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogContent size="lg" aria-describedby="info-desc">
        <DialogHeader>
          <p className="eyebrow mb-2">About this preview</p>
          <DialogTitle>How the garage works</DialogTitle>
          <DialogDescription id="info-desc">
            A layered 2.5D studio view: every change is composited live in your browser from separated paint, wheel and trim layers, with the original lighting kept.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-6 pb-6 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow mb-2 !text-fg-muted">Rendered live</h3>
            <ul className="space-y-1.5">
              {LIVE.map((l) => (
                <li key={l} className="flex gap-2 text-[12.5px] text-fg-muted">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {l}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow mb-2 !text-fg-muted">Next phase</h3>
            <ul className="space-y-1.5">
              {NOT_YET.map((l) => (
                <li key={l} className="flex gap-2 text-[12.5px] text-fg-subtle">
                  <X className="mt-0.5 size-3.5 shrink-0" /> {l}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] leading-relaxed text-fg-subtle">
              A true 3D configurator needs a licensed, accurate {v.model} {v.variant} model. Rather than use a generic hatchback, this concept uses an accurate side profile.
            </p>
          </div>
          <div className="space-y-2 border-t border-line pt-4 text-[11.5px] leading-relaxed text-fg-subtle sm:col-span-2">
            <p>
              <span className="text-fg-muted">Image source: </span>
              {v.renderer.provenance}
            </p>
            <p>{disclaimers.visual}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
