import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { brand, serviceLines, type ServiceLineKey } from '@/config/brand'
import { options } from '@/data/catalog'
import type { Selections } from '@/data/types'
import { defaultVehicleId, getVehicle } from '@/data/vehicles'
import { buildTotal, defaultSelections, effective } from '@/lib/configuration'
import { whatsappLink } from '@/lib/enquiry'
import { track } from '@/lib/analytics'
import { cn, formatINR, prefersReducedMotion } from '@/lib/utils'
import { useBuild } from '@/store/build'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { VehicleViewport } from '@/components/vehicle/VehicleViewport'
import { AnimatedPrice } from '@/components/configurator/AnimatedPrice'

const preset = (p: Partial<Selections>): Selections => effective({ ...defaultSelections(), ...p })

const HERO_BUILDS: { name: string; tag: string; sel: Selections }[] = [
  {
    name: 'Street Red',
    tag: 'Respray · Apex wheels · Mild drop',
    sel: preset({ surface: 'surface-mm-red', wheel: 'wheel-apex', wheelFinish: 'wf-black', roof: 'roof-black', mirrors: 'mirror-black', sideSkirts: 'skirts-blade', frontLip: 'lip-splitter', stance: 'stance-mild' }),
  },
  {
    name: 'Lapis Satin',
    tag: 'Satin respray · Bronze monoblocks · Low',
    sel: preset({ surface: 'surface-lapis', finish: 'finish-satin', wheel: 'wheel-monoblock', wheelFinish: 'wf-bronze', stance: 'stance-low', spoiler: 'spoiler-ext', rearDiffuser: 'diffuser-fin', graphic: 'graphic-rocker', graphicColour: 'gc-white' }),
  },
  {
    name: 'Stealth Carbon',
    tag: 'Matte wrap · Carbon-look kit · Vortex',
    sel: preset({ surface: 'surface-stealth', finish: 'finish-matte', wheel: 'wheel-vortex', wheelFinish: 'wf-gunmetal', kitFinish: 'kit-carbon', frontLip: 'lip-splitter', sideSkirts: 'skirts-blade', rearDiffuser: 'diffuser-fin', spoiler: 'spoiler-ext', graphic: 'graphic-shoulder', graphicColour: 'gc-red', stance: 'stance-mild' }),
  },
  {
    name: 'Sunburst',
    tag: 'Respray · Lattice wheels · Black roof',
    sel: preset({ surface: 'surface-sunburst', wheel: 'wheel-lattice', wheelFinish: 'wf-silver', roof: 'roof-black', mirrors: 'mirror-black', handles: 'handles-black', stance: 'stance-mild' }),
  },
]
const CYCLE_MS = 4600

export default function LandingPage() {
  useDocumentMeta(
    'MotorMind Garage — Your Car. Your Vision.',
    'Explore personalised paint, wraps, wheels, styling parts and stance on a Volkswagen Polo GT TSI, then send your build to MotorMind Automotive Designs, Bengaluru.',
  )
  return (
    <div className="bg-ink-950">
      <SiteHeader />
      <main>
        <Hero />
        <Facts />
        <Capabilities />
        <GaragePreview />
        <Portfolio />
        <EnquiryCTA />
      </main>
      <SiteFooter />
    </div>
  )
}

/* ── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(() => !prefersReducedMotion())
  const navigate = useNavigate()
  const restore = useBuild((s) => s.restore)
  const setName = useBuild((s) => s.setName)

  useEffect(() => {
    if (!auto) return
    const t = window.setTimeout(() => setI((n) => (n + 1) % HERO_BUILDS.length), i === 0 ? CYCLE_MS + 1400 : CYCLE_MS)
    return () => window.clearTimeout(t)
  }, [i, auto])

  const b = HERO_BUILDS[i]
  const openBuild = () => {
    restore(b.sel)
    setName(`${b.name} Polo`)
    track('landing_cta_clicked', { cta: 'hero_open_build', build: b.name })
    navigate('/garage')
  }

  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_20%_0%,rgb(215_20_31/0.10),transparent_70%)]" />
      <div className="relative mx-auto grid w-full max-w-[1320px] gap-8 px-5 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[1fr_300px] lg:items-end">
        <div>
          <p className="eyebrow animate-fade-up">MotorMind Garage · Concept preview</p>
          <h1 id="hero-title" className="display mt-4 animate-fade-up text-[clamp(58px,10.5vw,156px)] text-fg [animation-delay:80ms]">
            Your Car.
            <br />
            <span className="metal-text">Your Vision.</span>
          </h1>
          <p className="mt-5 max-w-[520px] animate-fade-up text-[15.5px] leading-relaxed text-fg-muted [animation-delay:160ms] sm:text-[17px]">
            Explore personalised paint, wraps, wheels and styling on a Volkswagen Polo GT TSI — then take your build to the Bengaluru studio that designs and makes bodykits and prototypes.
          </p>
          <div className="mt-7 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
            <Button asChild variant="primary" size="lg">
              <Link id="hero-build" to="/garage" onClick={() => track('landing_cta_clicked', { cta: 'hero_build' })}>
                Build Your Car <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a id="hero-explore" href="#capabilities" onClick={() => track('landing_cta_clicked', { cta: 'hero_explore' })}>
                Explore MotorMind
              </a>
            </Button>
          </div>
        </div>

        {/* build selector */}
        <div className="hidden animate-fade-up [animation-delay:320ms] lg:block">
          <p className="eyebrow mb-3">Example builds</p>
          <ul className="space-y-1">
            {HERO_BUILDS.map((hb, n) => (
              <li key={hb.name}>
                <button
                  type="button"
                  id={`hero-build-${n}`}
                  onClick={() => {
                    setI(n)
                    setAuto(false)
                  }}
                  aria-pressed={n === i}
                  className={cn('group relative w-full overflow-hidden rounded-md px-3 py-2.5 text-left transition-colors', n === i ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]')}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={cn('display text-[20px]', n === i ? 'text-fg' : 'text-fg-subtle group-hover:text-fg-muted')}>{hb.name}</span>
                    <span className="tabular font-mono text-[10.5px] text-fg-subtle">{formatINR(buildTotal(hb.sel))}</span>
                  </span>
                  <span className="block text-[11.5px] text-fg-subtle">{hb.tag}</span>
                  {n === i && (
                    <span
                      key={`${i}-${auto}`}
                      className={cn('absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent', auto ? 'animate-[bar-in_linear_both]' : '')}
                      style={auto ? { animationDuration: `${i === 0 ? CYCLE_MS + 1400 : CYCLE_MS}ms` } : undefined}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative min-h-[300px] flex-1 sm:min-h-[420px]">
        <VehicleViewport
          id="hero-viewport"
          className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_82%,transparent)]"
          vehicleId={defaultVehicleId}
          selections={b.sel}
          intro
          fit={84}
        />
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 px-5">
          <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-subtle">
            <span className="text-fg">{b.name}</span> · {b.tag}
          </p>
          <button id="hero-open-build" type="button" onClick={openBuild} className="group flex items-center gap-1.5 text-[13px] text-fg-muted transition-colors hover:text-fg">
            Open this build in the garage <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </button>
          <div className="mt-1 flex gap-1.5 lg:hidden">
            {HERO_BUILDS.map((hb, n) => (
              <button
                key={hb.name}
                type="button"
                aria-label={`Show ${hb.name}`}
                aria-pressed={n === i}
                onClick={() => {
                  setI(n)
                  setAuto(false)
                }}
                className="grid h-6 w-7 place-items-center"
              >
                <span className={cn('h-[3px] w-full rounded-full transition-colors', n === i ? 'bg-accent' : 'bg-white/20')} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Verified facts ─────────────────────────────────────────────────────── */
function Facts() {
  const facts = [
    { k: String(brand.founded), v: 'Established in Bangalore' },
    { k: '6', v: 'Service lines, from wraps to prototypes' },
    { k: 'Design → Build', v: 'Industrial designers, engineers, 3D modelers and pattern makers' },
    { k: 'Hyperion 1', v: 'MotorMind’s two-seater roadster prototype' },
  ]
  return (
    <section aria-label="About MotorMind" className="border-y border-line">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 lg:grid-cols-4">
        {facts.map((f, n) => (
          <div key={f.k} className={cn('px-5 py-7 sm:px-8', n % 2 === 1 && 'border-l border-line', n >= 2 && 'border-t border-line lg:border-t-0', n === 2 && 'lg:border-l')}>
            <p className="display text-[28px] text-fg sm:text-[36px]">{f.k}</p>
            <p className="mt-1.5 text-[12.5px] leading-snug text-fg-muted">{f.v}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Capabilities (verified service lines) ──────────────────────────────── */
function Capabilities() {
  const feature: { key: ServiceLineKey; img: string; pos: string; caption: string }[] = [
    { key: 'bodykits', img: '/motormind/banner-star8.jpg', pos: '50% 62%', caption: 'STAR-8 designer styling kit for the Audi R8' },
    { key: 'prototypes', img: '/motormind/banner-hyperion.jpg', pos: '88% 50%', caption: 'Hyperion 1 roadster prototype' },
  ]
  const rest: ServiceLineKey[] = ['bodyWrap', 'bodyshop', 'interior', 'recreational']
  return (
    <section id="capabilities" aria-labelledby="cap-title" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Capabilities</p>
            <h2 id="cap-title" className="display mt-3 text-[44px] text-fg sm:text-[68px]">
              Designed, sculpted, <span className="text-fg-subtle">built.</span>
            </h2>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-fg-muted">
            MotorMind describes itself as an industrial design and prototyping company. These are the service lines from its own website — the garage maps every option back to one of them.
          </p>
        </div>

        <div className="mt-12 grid gap-3 lg:grid-cols-2">
          {feature.map((f, n) => (
            <article key={f.key} className="group relative overflow-hidden rounded-2xl border border-line bg-ink-900">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={f.img} alt={f.caption} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" style={{ objectPosition: f.pos }} />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(7_8_10/0.95))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="eyebrow tabular">0{n + 1}</p>
                <h3 className="display mt-2 text-[34px] text-fg">{serviceLines[f.key].name}</h3>
                <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-fg-muted">{serviceLines[f.key].copy}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((k, n) => (
            <article key={k} className="panel group p-6 transition-colors hover:border-line-strong">
              <div className="flex items-center justify-between">
                <p className="eyebrow tabular">0{n + 3}</p>
                <span className="h-px w-8 bg-line-strong transition-all duration-500 group-hover:w-14 group-hover:bg-accent" />
              </div>
              <h3 className="display mt-6 text-[26px] text-fg">{serviceLines[k].name}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{serviceLines[k].copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Garage preview: a working mini configurator ────────────────────────── */
function GaragePreview() {
  const colours = useMemo(() => ['surface-factory', 'surface-mm-red', 'surface-lapis', 'surface-racing-green', 'surface-concrete', 'surface-sunburst', 'surface-midnight'].map((id) => options.find((o) => o.id === id)!), [])
  const wheels = useMemo(() => options.filter((o) => o.slot === 'wheel'), [])
  const [surface, setSurface] = useState('surface-mm-red')
  const [wheel, setWheel] = useState('wheel-apex')
  const [kit, setKit] = useState(true)
  const [low, setLow] = useState(false)
  const navigate = useNavigate()
  const restore = useBuild((s) => s.restore)
  const sel = useMemo(
    () =>
      preset({
        surface,
        wheel,
        wheelFinish: 'wf-black',
        ...(kit ? { sideSkirts: 'skirts-blade', rearDiffuser: 'diffuser-fin', spoiler: 'spoiler-ext', frontLip: low ? 'lip-none' : 'lip-splitter' } : {}),
        stance: low ? 'stance-low' : 'stance-stock',
      }),
    [surface, wheel, kit, low],
  )
  const v = getVehicle(defaultVehicleId)

  const steps = [
    { n: '01', t: 'Choose your car', d: `${v.make} ${v.model} ${v.variant} to start, with more models to follow.` },
    { n: '02', t: 'Make it yours', d: 'Paint, wraps, wheels, aero parts, stance and details. Every change shows instantly.' },
    { n: '03', t: 'Send it to MotorMind', d: 'Share your build or request a quote on WhatsApp, with every part and price listed.' },
  ]

  return (
    <section id="garage" aria-labelledby="garage-title" className="scroll-mt-16 border-t border-line bg-ink-900 py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-14">
          <div>
            <p className="eyebrow">The Garage</p>
            <h2 id="garage-title" className="display mt-3 text-[44px] text-fg sm:text-[60px]">
              Try it <span className="text-accent">right here.</span>
            </h2>
            <ol className="mt-8 space-y-6">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="tabular font-mono text-[11px] text-accent">{s.n}</span>
                  <div>
                    <p className="text-[15px] font-medium text-fg">{s.t}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-ink-950">
            <VehicleViewport id="preview-viewport" vehicleId={defaultVehicleId} selections={sel} backdrop="minimal" fit={90} className="aspect-[16/9] w-full" />
            <div className="grid gap-5 border-t border-line p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
              <div className="space-y-4">
                <div>
                  <p className="eyebrow mb-2">Colour</p>
                  <div role="radiogroup" aria-label="Preview colour" className="flex flex-wrap gap-2">
                    {colours.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={surface === c.id}
                        aria-label={c.name}
                        title={c.name}
                        onClick={() => setSurface(c.id)}
                        className={cn('size-8 rounded-full transition-transform hover:scale-105', surface === c.id ? 'ring-2 ring-fg ring-offset-2 ring-offset-ink-950' : 'ring-1 ring-white/10')}
                        style={{ background: c.visual?.swatch }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                  <div>
                    <p className="eyebrow mb-2">Wheels</p>
                    <div role="radiogroup" aria-label="Preview wheels" className="flex gap-1.5">
                      {wheels.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          role="radio"
                          aria-checked={wheel === w.id}
                          aria-label={w.name}
                          title={w.name}
                          onClick={() => setWheel(w.id)}
                          className={cn('grid size-10 place-items-center rounded-md border transition-colors', wheel === w.id ? 'border-white/40 bg-white/[0.06]' : 'border-line hover:border-line-strong')}
                        >
                          <img src={w.visual?.wheelImage === 'stock' ? `${v.renderer.basePath}/wheel-stock-front.webp` : `/vehicles/wheels/${w.visual?.wheelImage}-black.webp`} alt="" className="size-7" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow mb-2">Styling</p>
                    <div className="flex gap-1.5">
                      <Toggle id="preview-kit" on={kit} onClick={() => setKit(!kit)} label="Aero kit" />
                      <Toggle id="preview-low" on={low} onClick={() => setLow(!low)} label="Lowered" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
                <div className="sm:text-right">
                  <p className="eyebrow">Indicative</p>
                  <p className="display text-[30px] text-fg">
                    <AnimatedPrice value={buildTotal(sel)} />
                  </p>
                </div>
                <Button
                  id="preview-continue"
                  variant="light"
                  onClick={() => {
                    restore(sel)
                    track('landing_cta_clicked', { cta: 'preview_continue' })
                    navigate('/garage')
                  }}
                >
                  Continue in the garage <ArrowRight />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Toggle({ id, on, onClick, label }: { id: string; on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn('h-10 rounded-md border px-3.5 text-[13px] transition-colors', on ? 'border-accent bg-accent-soft text-fg' : 'border-line text-fg-muted hover:text-fg')}
    >
      {label}
    </button>
  )
}

/* ── Portfolio (MotorMind's own published projects) ─────────────────────── */
function Portfolio() {
  const work = [
    { img: '/motormind/banner-hyperion.jpg', pos: '85% 55%', title: 'Hyperion 1', kind: 'Roadster prototype', span: 'lg:col-span-2 lg:row-span-2' },
    { img: '/motormind/banner-creta.jpg', pos: '78% 45%', title: 'The Deadlift', kind: 'Hyundai Creta body kit', span: '' },
    { img: '/motormind/banner-star8.jpg', pos: '50% 60%', title: 'STAR-8', kind: 'Audi R8 designer styling kit', span: '' },
    { img: '/motormind/proj-cruze.jpg', pos: '50% 50%', title: 'Cruze', kind: 'Bodykit', span: '' },
    { img: '/motormind/proj-i20.jpg', pos: '50% 50%', title: 'i20', kind: 'Bodykit', span: '' },
    { img: '/motormind/proj-micra.jpg', pos: '50% 50%', title: 'Micra', kind: 'Bodykit', span: '' },
  ]
  return (
    <section id="work" aria-labelledby="work-title" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 id="work-title" className="display mt-3 text-[44px] text-fg sm:text-[68px]">
              From the <span className="text-fg-subtle">studio.</span>
            </h2>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-fg-muted">
            Projects from MotorMind’s own website. Its project archive also lists Polo bodykit builds, which is why this concept starts with the Polo GT TSI.
          </p>
        </div>
        <div className="mt-12 grid auto-rows-[220px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {work.map((w) => (
            <figure key={w.title} className={cn('group relative overflow-hidden rounded-xl border border-line bg-ink-900', w.span)}>
              <img src={w.img} alt={`${w.title} — ${w.kind}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" style={{ objectPosition: w.pos }} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(7_8_10/0.92))]" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <span>
                  <span className="display block text-[24px] text-fg">{w.title}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">{w.kind}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-fg-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden />
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-fg-subtle">Images: MotorMind Automotive Designs.</p>
      </div>
    </section>
  )
}

/* ── Enquiry CTA ────────────────────────────────────────────────────────── */
function EnquiryCTA() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-16 overflow-hidden border-t border-line py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_100%,rgb(215_20_31/0.14),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow">Start a conversation</p>
          <h2 id="contact-title" className="display mt-3 text-[48px] text-fg sm:text-[84px]">
            Bring your build <br className="hidden sm:block" />
            <span className="text-accent">to life.</span>
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-fg-muted">
            Design it in the garage, then send it to MotorMind with every part listed. They’ll confirm fitment and pricing after seeing your car.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="lg">
              <Link id="cta-build" to="/garage" onClick={() => track('landing_cta_clicked', { cta: 'footer_build' })}>
                Build Your Car <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="whatsapp" size="lg">
              <a
                id="cta-whatsapp"
                href={whatsappLink('Hello MotorMind, I’d like to talk about customising my car.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_clicked', { source: 'landing' })}
              >
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
        <address className="panel space-y-4 p-6 not-italic sm:p-7">
          <a href={`tel:${brand.phoneE164}`} onClick={() => track('call_clicked', { source: 'landing' })} className="flex items-start gap-3 text-[14px] text-fg hover:text-white">
            <Phone className="mt-0.5 size-4 text-accent" /> {brand.phoneDisplay}
          </a>
          <a href={`mailto:${brand.email}`} onClick={() => track('email_clicked', { source: 'landing' })} className="flex items-start gap-3 text-[14px] text-fg hover:text-white">
            <Mail className="mt-0.5 size-4 text-accent" /> {brand.email}
          </a>
          <p className="flex items-start gap-3 text-[13px] leading-relaxed text-fg-muted">
            <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /> {brand.address}
          </p>
        </address>
      </div>
    </section>
  )
}
