import { create } from 'zustand'
import { track } from '@/lib/analytics'

export type DialogId = 'quote' | 'share' | 'saved' | 'vehicle' | 'preview-info' | null

interface UIState {
  dialog: DialogId
  /** where the dialog was opened from, for analytics */
  source?: string
  open: (d: Exclude<DialogId, null>, source?: string) => void
  close: () => void
}

/** Global dialog switch so any surface (bar, header, summary, landing) can open the same dialogs. */
export const useUI = create<UIState>((set) => ({
  dialog: null,
  open: (dialog, source) => {
    set({ dialog, source })
    if (dialog === 'quote') track('quote_opened', { source })
    if (dialog === 'share') track('build_shared', { step: 'opened', source })
  },
  close: () => set({ dialog: null }),
}))
