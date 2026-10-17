import { useState } from 'react'
import { Check, Copy, Link2, MessageCircle, Share2 } from 'lucide-react'
import { buildCode } from '@/lib/configuration'
import { buildSummaryText, shareUrl } from '@/lib/enquiry'
import { track } from '@/lib/analytics'
import { copyText } from '@/lib/utils'
import { toast, useBuild } from '@/store/build'
import { useUI } from '@/store/ui'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function ShareBuildDialog() {
  const isOpen = useUI((s) => s.dialog === 'share')
  const close = useUI((s) => s.close)
  const selections = useBuild((s) => s.selections)
  const vehicleId = useBuild((s) => s.vehicleId)
  const buildName = useBuild((s) => s.buildName)
  const [copied, setCopied] = useState<'link' | 'text' | null>(null)
  const url = shareUrl(selections, vehicleId, buildName)
  const summary = buildSummaryText(selections, vehicleId, buildName)
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  const copy = async (what: 'link' | 'text') => {
    const ok = await copyText(what === 'link' ? url : summary)
    if (ok) {
      setCopied(what)
      track('build_shared', { method: what === 'link' ? 'copy_link' : 'copy_summary' })
      window.setTimeout(() => setCopied(null), 1800)
    } else toast({ title: 'Copy failed', body: 'Select the link and copy it manually.', tone: 'warning' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogContent aria-describedby="share-desc">
        <DialogHeader>
          <p className="eyebrow mb-2">Share · {buildCode(selections, vehicleId)}</p>
          <DialogTitle>Share this build</DialogTitle>
          <DialogDescription id="share-desc">The link recreates this exact configuration in the garage — no account needed.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-6">
          <div className="flex gap-2">
            <label htmlFor="share-url" className="sr-only">
              Build link
            </label>
            <div className="relative min-w-0 flex-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
              <input
                id="share-url"
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="h-11 w-full truncate rounded-md border border-line-strong bg-ink-900 pl-9 pr-3 font-mono text-[12px] text-fg-muted outline-none focus:border-white/40"
              />
            </div>
            <Button id="share-copy-link" variant="light" size="lg" onClick={() => copy('link')} className="h-11 px-4">
              {copied === 'link' ? <Check /> : <Copy />} {copied === 'link' ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button asChild variant="whatsapp">
              <a
                id="share-whatsapp"
                href={`https://wa.me/?text=${encodeURIComponent(summary)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('build_shared', { method: 'whatsapp' })}
              >
                <MessageCircle /> WhatsApp
              </a>
            </Button>
            <Button id="share-copy-summary" variant="secondary" onClick={() => copy('text')}>
              {copied === 'text' ? <Check /> : <Copy />} {copied === 'text' ? 'Copied' : 'Copy summary'}
            </Button>
            <Button
              id="share-native"
              variant="secondary"
              disabled={!canNativeShare}
              title={canNativeShare ? undefined : 'Your browser doesn’t support the share sheet'}
              onClick={async () => {
                try {
                  await navigator.share({ title: buildName, text: `My ${buildName} build on MotorMind Garage`, url })
                  track('build_shared', { method: 'native' })
                } catch {
                  /* user cancelled */
                }
              }}
            >
              <Share2 /> More…
            </Button>
          </div>
          <pre className="scroll-thin max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-white/[0.02] px-3.5 py-3 font-mono text-[11px] leading-relaxed text-fg-subtle">
            {summary}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}
