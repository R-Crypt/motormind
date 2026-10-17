import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Columns2, Link2, MessageCircle, MessageSquareQuote, Pencil, RotateCcw } from 'lucide-react'
import { categories } from '@/data/catalog'
import { getVehicle, vehicleName } from '@/data/vehicles'
import { buildCode, buildTotal, effective } from '@/lib/configuration'
import { buildSummaryText, describeItems, whatsappLink } from '@/lib/enquiry'
import { disclaimers } from '@/config/brand'
import { track } from '@/lib/analytics'
import { cn, formatINR } from '@/lib/utils'
import { useBuild } from '@/store/build'
import { useUI } from '@/store/ui'
import { useResetBuild } from '@/hooks/useBuildActions'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { VehicleViewport } from '@/components/vehicle/VehicleViewport'
import { categoryIcons } from '@/components/configurator/ModificationCategoryTabs'
import { AnimatedPrice } from '@/components/configurator/AnimatedPrice'

export default function BuildSummaryPage() {
  const selections = useBuild((s) => s.selections)
  const vehicleId = useBuild((s) => s.vehicleId)
  const buildName = useBuild((s) => s.buildName)
  const setName = useBuild((s) => s.setName)
  const setCategory = useBuild((s) => s.setCategory)
  const open = useUI((s) => s.open)
  const reset = useResetBuild()
  const navigate = useNavigate()
  const [compare, setCompare] = useState(false)
  const v = getVehicle(vehicleId)
  const items = useMemo(() => describeItems(effective(selections)), [selections])
  const total = buildTotal(selections)
  const code = buildCode(selections, vehicleId)

  useDocumentMeta(`Build summary · ${buildName} | MotorMind`, `Itemised indicative pricing for a customised ${vehicleName(v)} build.`)

  useEffect(() => {
    track('build_completed', { total, items: items.length, code })
    // only once per visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const grouped = categories
    .map((c) => ({ cat: c, items: items.filter((i) => i.category === c.id) }))
    .filter((g) => g.items.length)

  const edit = (cat?: (typeof categories)[number]['id']) => {
    if (cat) setCategory(cat)
    navigate('/garage')
  }

  return (
    <div className="min-h-dvh bg-ink-950">
      <header className="sticky top-0 z-30 border-b border-line bg-ink-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 px-4 sm:px-8">
          <Logo />
          <Button asChild variant="ghost" size="sm" className="ml-auto">
            <Link to="/garage" id="summary-back">
              <ArrowLeft /> Back to garage
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Build summary · {code}</p>
            <h1 className="display mt-2 text-[40px] text-fg sm:text-[64px]">
              {v.model} <span className="text-accent">{v.variant}</span>
            </h1>
            <label htmlFor="summary-name" className="group mt-2 flex max-w-md items-center gap-2">
              <span className="sr-only">Build name</span>
              <input
                id="summary-name"
                value={buildName}
                onChange={(e) => setName(e.target.value)}
                maxLength={48}
                className="w-full rounded-md border border-transparent bg-transparent px-0 py-1 text-[15px] text-fg-muted outline-none hover:border-line focus:border-line-strong focus:px-2 focus:text-fg"
              />
              <Pencil className="size-3.5 shrink-0 text-fg-subtle" />
            </label>
          </div>
          <p className="text-[12px] text-fg-subtle">
            {v.make} · {v.generationLabel} · {v.bodyStyle} · Model year not specified (demo)
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)]">
          {/* preview */}
          <section aria-label="Build preview" className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-line">
              <VehicleViewport vehicleId={vehicleId} selections={selections} compare={compare} className="aspect-[16/10] w-full sm:aspect-[16/9]" fit={92} />
              <button
                id="summary-compare"
                type="button"
                aria-pressed={compare}
                onClick={() => {
                  setCompare(!compare)
                  track('compare_toggled', { on: !compare, source: 'summary' })
                }}
                className={cn(
                  'absolute bottom-3 right-3 z-20 flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors',
                  compare ? 'border-accent bg-accent text-white' : 'border-line bg-ink-950/80 text-fg-muted hover:text-fg',
                )}
              >
                <Columns2 className="size-3.5" /> Before / after
              </button>
            </div>
            <p className="text-[11.5px] leading-relaxed text-fg-subtle">{disclaimers.visual}</p>
          </section>

          {/* itemised list */}
          <section aria-labelledby="items-heading" className="panel flex flex-col p-5 sm:p-6">
            <div className="flex items-baseline justify-between">
              <h2 id="items-heading" className="eyebrow !text-fg-muted">
                Modifications · {items.length}
              </h2>
              <button type="button" id="summary-edit-all" onClick={() => edit()} className="flex items-center gap-1 text-[12px] text-fg-muted hover:text-fg">
                <Pencil className="size-3" /> Edit build
              </button>
            </div>

            {grouped.length === 0 ? (
              <div className="my-8 text-center">
                <p className="text-[14px] text-fg-muted">This build is still at factory specification.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/garage" id="summary-start">Start customising</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-line">
                {grouped.map(({ cat, items: list }) => {
                  const Icon = categoryIcons[cat.id]
                  return (
                    <div key={cat.id} className="py-3.5 first:pt-0">
                      <button type="button" onClick={() => edit(cat.id)} className="group mb-2 flex items-center gap-2 text-[12px] font-medium text-fg-muted hover:text-fg">
                        <Icon className="size-3.5 text-accent" /> {cat.label}
                        <Pencil className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                      <ul className="space-y-1.5">
                        {list.map((i) => (
                          <li key={i.slot.id} className="flex items-baseline justify-between gap-4 text-[13.5px]">
                            <span className="min-w-0 text-fg">
                              <span className="text-fg-subtle">{i.slot.label} · </span>
                              {i.display}
                            </span>
                            <span className="tabular shrink-0 text-fg-muted">{i.price ? formatINR(i.price) : 'Included'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-auto border-t border-line-strong pt-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Estimated total</p>
                  <p className="text-[11px] text-fg-subtle">Indicative · excludes taxes & fitment checks</p>
                </div>
                <p className="display text-[40px] leading-none text-fg">
                  <AnimatedPrice value={total} />
                </p>
              </div>
              <p className="mt-4 rounded-md border border-warning/25 bg-warning/[0.06] px-3 py-2.5 text-[11.5px] leading-relaxed text-fg-muted">{disclaimers.pricing}</p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button id="summary-quote" variant="primary" size="lg" className="sm:col-span-2" onClick={() => open('quote', 'summary')}>
                  <MessageSquareQuote /> Request a quotation
                </Button>
                <Button asChild variant="whatsapp" size="lg">
                  <a
                    id="summary-whatsapp"
                    href={whatsappLink(`Hello MotorMind, I'd like to discuss this build.\n\n${buildSummaryText(selections, vehicleId, buildName)}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('whatsapp_clicked', { source: 'summary' })}
                  >
                    <MessageCircle /> WhatsApp MotorMind
                  </a>
                </Button>
                <Button id="summary-share" variant="secondary" size="lg" onClick={() => open('share', 'summary')}>
                  <Link2 /> Share build link
                </Button>
                <Button asChild variant="ghost" size="md">
                  <Link to="/garage" id="summary-edit">
                    <Pencil /> Edit build
                  </Link>
                </Button>
                <Button id="summary-reset" variant="ghost" size="md" onClick={reset} disabled={items.length === 0}>
                  <RotateCcw /> Reset configuration
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
