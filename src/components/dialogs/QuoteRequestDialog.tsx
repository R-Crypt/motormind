import { useMemo, useState } from 'react'
import { AlertTriangle, Check, CheckCircle2, Copy, Mail, MessageCircle, Phone, Send } from 'lucide-react'
import { brand, disclaimers } from '@/config/brand'
import { getVehicle, vehicleName } from '@/data/vehicles'
import { buildCode, buildTotal, effective } from '@/lib/configuration'
import { describeItems, enquiryText, mailtoLink, submitEnquiry, telLink, whatsappLink, type EnquiryInput, type SubmitResult } from '@/lib/enquiry'
import { track } from '@/lib/analytics'
import { cn, copyText, formatINR } from '@/lib/utils'
import { toast, useBuild } from '@/store/build'
import { useUI } from '@/store/ui'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/field'

const BUDGETS = ['Under ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000 – ₹2,00,000', 'Above ₹2,00,000', 'Not sure yet']
type Errors = Partial<Record<'name' | 'phone' | 'email', string>>

function validate(f: EnquiryInput): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your name.'
  const digits = f.phone.replace(/\D/g, '')
  const local = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits
  if (!digits) e.phone = 'A phone or WhatsApp number is needed so MotorMind can reply.'
  else if (!(local.length === 10 && /^[6-9]/.test(local)) && !(digits.length >= 10 && digits.length <= 15 && f.phone.trim().startsWith('+')))
    e.phone = 'Enter a valid 10-digit Indian mobile number, or an international number starting with +.'
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'That email address doesn’t look right.'
  if (f.contactPref === 'email' && !f.email) e.email = 'Add an email address, or choose another contact preference.'
  return e
}

export function QuoteRequestDialog() {
  const isOpen = useUI((s) => s.dialog === 'quote')
  const close = useUI((s) => s.close)
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogContent size="lg" aria-describedby="quote-desc">
        {isOpen && <QuoteBody />}
      </DialogContent>
    </Dialog>
  )
}

function QuoteBody() {
  const selections = useBuild((s) => s.selections)
  const vehicleId = useBuild((s) => s.vehicleId)
  const buildName = useBuild((s) => s.buildName)
  const source = useUI((s) => s.source)
  const v = getVehicle(vehicleId)
  const items = useMemo(() => describeItems(effective(selections)), [selections])
  const total = buildTotal(selections)

  const [form, setForm] = useState<EnquiryInput>({ name: '', phone: '', email: '', vehicleDetails: '', budget: '', message: '', contactPref: 'whatsapp' })
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const set = <K extends keyof EnquiryInput>(k: K, val: EnquiryInput[K]) => {
    setForm((f) => ({ ...f, [k]: val }))
    if (errors[k as keyof Errors]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate(form)
    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(`q-${Object.keys(e)[0]}`)?.focus()
      return
    }
    setBusy(true)
    const res = await submitEnquiry(form, selections, vehicleId, buildName)
    setBusy(false)
    setResult(res)
    track('quote_submitted', { mode: res.mode, total, items: items.length, source })
  }

  const message = enquiryText(form, selections, vehicleId, buildName)

  if (result) return <QuoteResult result={result} message={message} onBack={() => setResult(null)} />

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogHeader>
        <p className="eyebrow mb-2">Quotation request</p>
        <DialogTitle>Get this build quoted</DialogTitle>
        <DialogDescription id="quote-desc">
          Share a few details and your configuration will be attached. MotorMind would confirm fitment and pricing after seeing your car.
        </DialogDescription>
      </DialogHeader>

      <div className="mx-6 mb-5 rounded-lg border border-line bg-white/[0.02] p-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-fg">{buildName}</p>
            <p className="font-mono text-[10.5px] text-fg-subtle">
              {vehicleName(v)} · {buildCode(selections, vehicleId)}
            </p>
          </div>
          <p className="display tabular shrink-0 text-[22px] text-fg">{formatINR(total)}</p>
        </div>
        <p className="mt-2 line-clamp-2 text-[12px] text-fg-muted">
          {items.length ? items.map((i) => i.display).join(' · ') : 'Factory specification — no modifications selected yet.'}
        </p>
      </div>

      <div className="grid gap-4 px-6 sm:grid-cols-2">
        <Field id="q-name" label="Name" error={errors.name}>
          <Input id="q-name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'q-name-error' : undefined} />
        </Field>
        <Field id="q-phone" label="Phone / WhatsApp" error={errors.phone}>
          <Input id="q-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={form.phone} onChange={(e) => set('phone', e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'q-phone-error' : undefined} />
        </Field>
        <Field id="q-email" label="Email" optional={form.contactPref !== 'email'} error={errors.email}>
          <Input id="q-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'q-email-error' : undefined} />
        </Field>
        <Field id="q-vehicle" label="Your car" optional hint="Year, colour, registration city — whatever helps.">
          <Input id="q-vehicle" placeholder={`e.g. ${v.model} ${v.variant}, white, KA-registered`} value={form.vehicleDetails} onChange={(e) => set('vehicleDetails', e.target.value)} />
        </Field>
        <Field id="q-budget" label="Budget" optional>
          <select
            id="q-budget"
            value={form.budget}
            onChange={(e) => set('budget', e.target.value)}
            className="h-11 w-full rounded-md border border-line-strong bg-ink-900 px-3 text-sm text-fg outline-none focus:border-white/40"
          >
            <option value="">Prefer not to say</option>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <fieldset className="space-y-1.5">
          <legend className="mb-1.5 text-[13px] font-medium text-fg">Preferred contact</legend>
          <div className="grid grid-cols-3 gap-1.5">
            {(['whatsapp', 'call', 'email'] as const).map((p) => (
              <label
                key={p}
                className={cn(
                  'flex h-11 cursor-pointer items-center justify-center rounded-md border text-[13px] capitalize transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent',
                  form.contactPref === p ? 'border-white/40 bg-white/[0.07] text-fg' : 'border-line text-fg-muted hover:text-fg',
                )}
              >
                <input type="radio" name="contactPref" value={p} checked={form.contactPref === p} onChange={() => set('contactPref', p)} className="sr-only" />
                {p === 'whatsapp' ? 'WhatsApp' : p}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <Field id="q-message" label="Message" optional>
            <Textarea id="q-message" rows={3} placeholder="Timeline, questions, anything else…" value={form.message} onChange={(e) => set('message', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 border-t border-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-fg-subtle sm:max-w-[60%]">{disclaimers.pricing}</p>
        <Button id="quote-submit" type="submit" variant="primary" size="lg" disabled={busy} className="w-full sm:w-auto">
          <Send /> {busy ? 'Preparing…' : 'Prepare enquiry'}
        </Button>
      </div>
    </form>
  )
}

function QuoteResult({ result, message, onBack }: { result: SubmitResult; message: string; onBack: () => void }) {
  const [copied, setCopied] = useState(false)
  const handoff = (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button asChild variant="whatsapp" size="lg">
        <a id="quote-whatsapp" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_clicked', { source: 'quote' })}>
          <MessageCircle /> Send on WhatsApp
        </a>
      </Button>
      <Button asChild variant="secondary" size="lg">
        <a id="quote-email" href={mailtoLink('Build quotation request', message)} onClick={() => track('email_clicked', { source: 'quote' })}>
          <Mail /> Send by email
        </a>
      </Button>
      <Button
        id="quote-copy"
        variant="secondary"
        size="lg"
        onClick={async () => {
          const ok = await copyText(message)
          setCopied(ok)
          toast(ok ? { title: 'Enquiry copied', tone: 'success' } : { title: 'Copy failed', body: 'Select the text below and copy it manually.', tone: 'warning' })
        }}
      >
        {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy enquiry text'}
      </Button>
      <Button asChild variant="secondary" size="lg">
        <a id="quote-call" href={telLink()} onClick={() => track('call_clicked', { source: 'quote' })}>
          <Phone /> Call {brand.phoneDisplay}
        </a>
      </Button>
    </div>
  )

  return (
    <div>
      <DialogHeader>
        {result.mode === 'delivered' ? (
          <>
            <CheckCircle2 className="mb-3 size-8 text-success" />
            <DialogTitle>Enquiry sent</DialogTitle>
            <DialogDescription id="quote-desc">
              MotorMind’s enquiry service confirmed receipt. Reference <span className="font-mono text-fg">{result.reference}</span>.
            </DialogDescription>
          </>
        ) : result.mode === 'draft' ? (
          <>
            <p className="eyebrow mb-2 !text-warning">Ready, not yet sent</p>
            <DialogTitle>Your enquiry is ready</DialogTitle>
            <DialogDescription id="quote-desc">
              This prototype isn’t connected to MotorMind’s systems yet, so <strong className="text-fg">nothing has been sent</strong>. Your draft (ref{' '}
              <span className="font-mono text-fg">{result.reference}</span>) is saved on this device. Send it in one tap:
            </DialogDescription>
          </>
        ) : (
          <>
            <AlertTriangle className="mb-3 size-8 text-warning" />
            <DialogTitle>Couldn’t send</DialogTitle>
            <DialogDescription id="quote-desc">{result.message}</DialogDescription>
          </>
        )}
      </DialogHeader>
      <div className="space-y-4 px-6 pb-6">
        {result.mode !== 'delivered' && handoff}
        {!brand.whatsappVerified && result.mode !== 'delivered' && (
          <p className="text-[11px] text-fg-subtle">WhatsApp uses MotorMind’s published phone number. Whether it’s WhatsApp-enabled hasn’t been confirmed yet.</p>
        )}
        <details className="group rounded-lg border border-line">
          <summary className="cursor-pointer list-none px-3.5 py-2.5 text-[12.5px] text-fg-muted hover:text-fg">Preview message</summary>
          <pre className="scroll-thin max-h-56 overflow-auto whitespace-pre-wrap border-t border-line px-3.5 py-3 font-mono text-[11.5px] leading-relaxed text-fg-muted">{message}</pre>
        </details>
        <button type="button" onClick={onBack} className="text-[12.5px] text-fg-subtle underline-offset-4 hover:text-fg hover:underline">
          ← Edit details
        </button>
      </div>
    </div>
  )
}
