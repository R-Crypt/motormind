import { Link } from 'react-router-dom'
import { ArrowRight, FileText, MessageSquareQuote } from 'lucide-react'
import { categories } from '@/data/catalog'
import { buildTotal, effective } from '@/lib/configuration'
import { describeItems } from '@/lib/enquiry'
import { useBuild } from '@/store/build'
import { useUI } from '@/store/ui'
import { Button } from '@/components/ui/button'
import { AnimatedPrice } from './AnimatedPrice'
import { categoryIcons } from './ModificationCategoryTabs'

/** Persistent build summary: chips of every modification, live total and conversion actions. */
export function BuildBar() {
  const selections = useBuild((s) => s.selections)
  const setCategory = useBuild((s) => s.setCategory)
  const setCamera = useBuild((s) => s.setCamera)
  const open = useUI((s) => s.open)
  const items = describeItems(effective(selections)).filter((i) => !['finish', 'wheelFinish', 'kitFinish', 'graphicColour'].includes(i.slot.id) || i.price > 0)
  const total = buildTotal(selections)

  return (
    <div className="flex h-full items-center gap-3 px-3 sm:gap-5 sm:px-5">
      {/* chips — desktop */}
      <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
        <span className="eyebrow shrink-0">Build · {items.length}</span>
        <div className="rail flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {items.length === 0 ? (
            <span className="text-[13px] text-fg-subtle">Factory specification. Pick a category to start modifying.</span>
          ) : (
            items.map((i) => {
              const Icon = categoryIcons[i.category]
              return (
                <button
                  key={i.slot.id}
                  type="button"
                  onClick={() => {
                    setCategory(i.category)
                    setCamera(i.slot.camera ?? categories.find((c) => c.id === i.category)!.camera)
                  }}
                  className="flex shrink-0 animate-[fade-up_400ms_var(--ease-out-expo)_both] items-center gap-1.5 rounded-full border border-line bg-white/[0.03] py-1 pl-2 pr-2.5 text-[12px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                  title={`Edit ${i.slot.label}`}
                >
                  <Icon className="size-3 text-accent" />
                  {i.display}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* total */}
      <div className="min-w-0 flex-1 lg:flex-none lg:text-right">
        <div className="eyebrow !text-[9.5px]">Indicative total</div>
        <div className="display text-[26px] leading-none text-fg sm:text-[30px]" aria-live="polite">
          <AnimatedPrice value={total} />
        </div>
        <div className="mt-0.5 text-[10px] text-fg-subtle lg:hidden">{items.length} mods · illustrative</div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button asChild variant="outline" size="md" className="hidden sm:inline-flex">
          <Link to="/build" id="bar-review">
            <FileText /> Review build
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon" className="sm:hidden" aria-label="Review build">
          <Link to="/build" id="bar-review-mobile">
            <FileText />
          </Link>
        </Button>
        <Button id="bar-quote" variant="primary" size="md" onClick={() => open('quote', 'garage-bar')}>
          <MessageSquareQuote /> <span className="hidden sm:inline">Request quote</span>
          <span className="sm:hidden">Quote</span>
          <ArrowRight className="hidden xl:block" />
        </Button>
      </div>
    </div>
  )
}
