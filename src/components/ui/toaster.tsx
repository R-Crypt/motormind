import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useToasts } from '@/store/build'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, dismiss } = useToasts()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-auto lg:top-20"
    >
      {toasts.map((t) => {
        const Icon = t.tone === 'warning' ? AlertTriangle : t.tone === 'success' ? CheckCircle2 : Info
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line-strong bg-ink-800/95 px-4 py-3 shadow-2xl backdrop-blur animate-fade-up"
          >
            <Icon
              className={cn(
                'mt-0.5 size-4 shrink-0',
                t.tone === 'warning' ? 'text-warning' : t.tone === 'success' ? 'text-success' : 'text-fg-muted',
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[13px] leading-snug text-fg-muted">{t.body}</p>}
            </div>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick()
                  dismiss(t.id)
                }}
                className="shrink-0 rounded-md border border-line-strong px-2.5 py-1 text-[12px] font-medium text-fg hover:bg-white/5"
              >
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} className="text-fg-subtle hover:text-fg" aria-label="Dismiss notification">
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
