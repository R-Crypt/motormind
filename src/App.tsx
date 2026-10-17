import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import ConfiguratorPage from '@/pages/ConfiguratorPage'
import BuildSummaryPage from '@/pages/BuildSummaryPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { Toaster } from '@/components/ui/toaster'
import { QuoteRequestDialog } from '@/components/dialogs/QuoteRequestDialog'
import { ShareBuildDialog } from '@/components/dialogs/ShareBuildDialog'
import { SavedBuildsDialog } from '@/components/dialogs/SavedBuildsDialog'
import { VehicleSelectorDialog } from '@/components/dialogs/VehicleSelectorDialog'
import { PreviewInfoDialog } from '@/components/dialogs/PreviewInfoDialog'
import { useUI } from '@/store/ui'

function RouteEffects() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    useUI.getState().close()
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/garage" element={<ConfiguratorPage />} />
        <Route path="/build" element={<BuildSummaryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <QuoteRequestDialog />
      <ShareBuildDialog />
      <SavedBuildsDialog />
      <VehicleSelectorDialog />
      <PreviewInfoDialog />
      <Toaster />
    </>
  )
}
