import { brand, disclaimers } from '@/config/brand'
import { getVehicle, vehicleName } from '@/data/vehicles'
import type { Selections } from '@/data/types'
import { buildCode, buildTotal, effective, encodeBuild, getOption, lineItems } from './configuration'
import { formatINR } from './utils'

export const shareUrl = (sel: Selections, vehicleId: string, name?: string) =>
  `${window.location.origin}/garage?${encodeBuild(sel, vehicleId, name)}`

/** Readable one-line spec for a build, used in summaries and messages. */
export function describeItems(sel: Selections) {
  const e = effective(sel)
  return lineItems(e).map((li) => {
    let name = li.option.name
    if (li.slot.id === 'surface') name += ` (${getOption(e.finish)?.name ?? 'Gloss'})`
    if (li.slot.id === 'wheel') name += ` · ${getOption(e.wheelFinish)?.name ?? 'Silver'}`
    if (li.slot.id === 'graphic') name += ` · ${getOption(e.graphicColour)?.name}`
    return { ...li, display: name }
  })
}

export function buildSummaryText(sel: Selections, vehicleId: string, name?: string) {
  const v = getVehicle(vehicleId)
  const items = describeItems(sel).filter((i) => !['finish', 'wheelFinish', 'graphicColour'].includes(i.slot.id) || i.price > 0)
  const lines = [
    `${name || 'My build'} — ${vehicleName(v)}`,
    `Build ref: ${buildCode(sel, vehicleId)}`,
    '',
    ...(items.length ? items.map((i) => `• ${i.slot.label}: ${i.display} — ${formatINR(i.price)}`) : ['• Factory specification (no modifications)']),
    '',
    `Indicative total: ${formatINR(buildTotal(sel))} (illustrative, subject to MotorMind confirmation)`,
    `View build: ${shareUrl(sel, vehicleId, name)}`,
  ]
  return lines.join('\n')
}

export interface EnquiryInput {
  name: string
  phone: string
  email?: string
  vehicleDetails?: string
  budget?: string
  message?: string
  contactPref: 'whatsapp' | 'call' | 'email'
}

export function enquiryText(input: EnquiryInput, sel: Selections, vehicleId: string, buildName?: string) {
  return [
    `Hello MotorMind, I'd like a quotation for this build.`,
    '',
    buildSummaryText(sel, vehicleId, buildName),
    '',
    `Name: ${input.name}`,
    `Phone/WhatsApp: ${input.phone}`,
    input.email ? `Email: ${input.email}` : null,
    input.vehicleDetails ? `My car: ${input.vehicleDetails}` : null,
    input.budget ? `Budget: ${input.budget}` : null,
    `Preferred contact: ${input.contactPref}`,
    input.message ? `\nMessage: ${input.message}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

export const whatsappLink = (text: string) => `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(text)}`
export const mailtoLink = (subject: string, body: string) =>
  `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
export const telLink = () => `tel:${brand.phoneE164}`

export const pricingNote = disclaimers.pricing

/* ── Enquiry submission ──────────────────────────────────────────────────────
   If VITE_ENQUIRY_ENDPOINT is configured, the enquiry is POSTed as JSON and
   only reported as delivered on a 2xx response. Otherwise the prototype keeps
   a local draft and offers WhatsApp / email / copy hand-off — it never claims
   delivery it can't confirm. */

export type SubmitResult =
  | { mode: 'delivered'; reference: string }
  | { mode: 'draft'; reference: string }
  | { mode: 'error'; message: string }

const DRAFTS_KEY = 'mm-enquiry-drafts-v1'

export async function submitEnquiry(input: EnquiryInput, sel: Selections, vehicleId: string, buildName?: string): Promise<SubmitResult> {
  const reference = buildCode(sel, vehicleId)
  const record = {
    reference,
    createdAt: new Date().toISOString(),
    vehicleId,
    buildName,
    selections: effective(sel),
    total: buildTotal(sel),
    shareUrl: shareUrl(sel, vehicleId, buildName),
    contact: input,
  }
  const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined
  if (endpoint) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) })
      if (!res.ok) return { mode: 'error', message: `The enquiry service responded with ${res.status}. Please try WhatsApp instead.` }
      return { mode: 'delivered', reference }
    } catch {
      return { mode: 'error', message: 'Could not reach the enquiry service. Please try WhatsApp or email instead.' }
    }
  }
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]')
    drafts.unshift(record)
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, 20)))
  } catch {
    /* storage unavailable — the draft is still shown on screen */
  }
  return { mode: 'draft', reference }
}
