import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { categories } from '@/data/catalog'
import { getVehicle } from '@/data/vehicles'
import type { CategoryId } from '@/data/types'
import { buildTotal, isStock } from '@/lib/configuration'
import { track } from '@/lib/analytics'
import { toast, useBuild } from '@/store/build'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { VehicleViewport } from '@/components/vehicle/VehicleViewport'
import { GarageHeader } from '@/components/configurator/GarageHeader'
import { ModificationCategoryTabs } from '@/components/configurator/ModificationCategoryTabs'
import { ModificationSidebar } from '@/components/configurator/ModificationSidebar'
import { ViewportToolbar } from '@/components/configurator/ViewportToolbar'
import { BuildBar } from '@/components/configurator/BuildBar'

export default function ConfiguratorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const vehicleId = useBuild((s) => s.vehicleId)
  const selections = useBuild((s) => s.selections)
  const camera = useBuild((s) => s.camera)
  const compare = useBuild((s) => s.compare)
  const buildName = useBuild((s) => s.buildName)
  const v = getVehicle(vehicleId)
  const handled = useRef(false)

  useDocumentMeta(
    `Garage · ${v.make} ${v.model} ${v.variant} | MotorMind`,
    `Customise a ${v.make} ${v.model} ${v.variant}: paint, wraps, wheels, styling parts, stance and details, with a live indicative build price.`,
  )

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    const st = useBuild.getState()
    if (location.search && st.loadFromSearch(location.search)) {
      toast({ title: 'Shared build loaded', body: 'You’re viewing a configuration from a link.', tone: 'success' })
      navigate('/garage', { replace: true })
    }
    st.setCompare(false)
    st.setCamera(categories.find((c) => c.id === st.activeCategory)?.camera ?? 'overview')
    track('garage_entered', { vehicleId: st.vehicleId, fromLink: !!location.search, total: buildTotal(st.selections) })
  }, [location.search, navigate])

  const onHotspot = (cat: CategoryId) => {
    const s = useBuild.getState()
    s.setCategory(cat)
    s.setCamera(categories.find((c) => c.id === cat)!.camera)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink-950">
      <h1 className="sr-only">
        Customise your {v.make} {v.model} {v.variant}
      </h1>
      <GarageHeader />

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[84px_minmax(0,1fr)_minmax(340px,388px)]">
        <nav aria-label="Categories" className="hidden border-r border-line bg-ink-950 lg:block">
          <ModificationCategoryTabs orientation="vertical" />
        </nav>

        {/* viewport */}
        <section aria-label="Vehicle preview" className="relative h-[42dvh] min-h-[230px] shrink-0 lg:h-auto lg:min-h-0">
          <VehicleViewport
            id="garage-viewport"
            className="absolute inset-0"
            vehicleId={vehicleId}
            selections={selections}
            camera={camera}
            compare={compare}
            intro
            hotspots
            onHotspot={onHotspot}
            fit={86}
          />
          <div className="pointer-events-none absolute left-4 top-3 animate-fade-up sm:left-6 sm:top-5">
            <p className="eyebrow !text-[9.5px] sm:!text-[10.5px]">
              {v.make} · {v.generationLabel}
            </p>
            <p className="display mt-1 text-[26px] text-fg sm:text-[44px]">
              {v.model} <span className="text-accent">{v.variant}</span>
            </p>
            <p className="mt-1 hidden text-[12px] text-fg-muted sm:block">
              {isStock(selections) ? 'Factory specification' : buildName} · Model year not specified (demo)
            </p>
          </div>
          <span className="pointer-events-none absolute right-4 top-3 hidden rounded-full border border-line-strong bg-ink-950/70 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-fg-muted sm:right-6 sm:top-6 sm:block">
            Concept preview
          </span>
          <div className="absolute inset-x-0 bottom-2.5 flex justify-center px-3 sm:bottom-5">
            <ViewportToolbar />
          </div>
        </section>

        {/* options */}
        <div className="flex min-h-0 flex-1 flex-col border-t border-line bg-ink-900 lg:border-l lg:border-t-0">
          <div className="border-b border-line lg:hidden">
            <ModificationCategoryTabs orientation="horizontal" />
          </div>
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
            <ModificationSidebar />
          </div>
        </div>
      </div>

      <footer className="h-[68px] shrink-0 border-t border-line bg-ink-950 sm:h-[76px]">
        <BuildBar />
      </footer>
    </div>
  )
}
