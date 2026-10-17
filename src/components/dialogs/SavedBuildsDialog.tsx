import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookmarkPlus, Trash2 } from 'lucide-react'
import { getVehicle, vehicleName } from '@/data/vehicles'
import { buildTotal, lineItems } from '@/lib/configuration'
import { formatINR } from '@/lib/utils'
import { toast, useBuild } from '@/store/build'
import { useUI } from '@/store/ui'
import { resolveVisual } from '@/render/visual'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function SavedBuildsDialog() {
  const isOpen = useUI((s) => s.dialog === 'saved')
  const close = useUI((s) => s.close)
  const { saved, buildName, setName, saveBuild, loadSaved, deleteSaved, selections } = useBuild()
  const navigate = useNavigate()
  const total = buildTotal(selections)

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogContent aria-describedby="saved-desc">
        <DialogHeader>
          <p className="eyebrow mb-2">Garage</p>
          <DialogTitle>Saved builds</DialogTitle>
          <DialogDescription id="saved-desc">Builds are saved in this browser. Share a link to move one to another device.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 px-6 pb-6">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const b = saveBuild()
              toast({ title: 'Build saved', body: `${b.name} · ${formatINR(b.total)}`, tone: 'success' })
            }}
          >
            <label htmlFor="save-name" className="sr-only">
              Build name
            </label>
            <Input id="save-name" value={buildName} onChange={(e) => setName(e.target.value)} maxLength={48} className="min-w-0 flex-1" />
            <Button id="save-build" type="submit" variant="light" size="lg" className="h-11">
              <BookmarkPlus /> Save · {formatINR(total)}
            </Button>
          </form>

          {saved.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-fg-subtle">No saved builds yet.</p>
          ) : (
            <ul className="space-y-2">
              {saved.map((b) => (
                <SavedRow
                  key={b.id}
                  build={b}
                  onLoad={() => {
                    loadSaved(b.id)
                    close()
                    navigate('/garage')
                    toast({ title: `Loaded “${b.name}”` })
                  }}
                  onDelete={() => deleteSaved(b.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SavedRow({ build, onLoad, onDelete }: { build: ReturnType<typeof useBuild.getState>['saved'][number]; onLoad: () => void; onDelete: () => void }) {
  const v = getVehicle(build.vehicleId)
  const swatch = useMemo(() => resolveVisual(v, build.selections).bodyHex, [v, build.selections])
  const count = lineItems(build.selections).length
  return (
    <li className="flex items-center gap-3 rounded-lg border border-line p-3 transition-colors hover:border-line-strong">
      <span className="size-9 shrink-0 rounded-full ring-1 ring-white/15" style={{ background: swatch }} aria-hidden />
      <button type="button" onClick={onLoad} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[14px] font-medium text-fg">{build.name}</span>
        <span className="block truncate font-mono text-[10.5px] text-fg-subtle">
          {vehicleName(v)} · {count} mods · {new Date(build.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </button>
      <span className="display tabular text-[18px] text-fg">{formatINR(build.total)}</span>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label={`Delete ${build.name}`}>
        <Trash2 />
      </Button>
    </li>
  )
}
