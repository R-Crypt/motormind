/**
 * Analytics-ready event layer. Events are pushed to `window.dataLayer`
 * (GTM / GA4 compatible) and broadcast as a DOM event so any provider
 * (Segment, PostHog, Plausible…) can subscribe later without UI changes.
 */
export type AnalyticsEvent =
  | 'landing_cta_clicked'
  | 'garage_entered'
  | 'category_selected'
  | 'option_selected'
  | 'option_blocked'
  | 'camera_changed'
  | 'compare_toggled'
  | 'build_reset'
  | 'build_saved'
  | 'build_loaded'
  | 'build_shared'
  | 'build_completed'
  | 'quote_opened'
  | 'quote_submitted'
  | 'whatsapp_clicked'
  | 'call_clicked'
  | 'email_clicked'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

const recent: { event: AnalyticsEvent; props: Record<string, unknown>; at: number }[] = []

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  const payload = { event, ...props, ts: Date.now() }
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
  recent.push({ event, props, at: payload.ts })
  if (recent.length > 50) recent.shift()
  window.dispatchEvent(new CustomEvent('mm:analytics', { detail: payload }))
}

/** For debugging in the console: `__mmEvents()` */
;(window as unknown as { __mmEvents: () => typeof recent }).__mmEvents = () => recent.slice()
