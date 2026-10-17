import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function NotFoundPage() {
  useDocumentMeta('Page not found | MotorMind', 'This page does not exist.')
  return (
    <main className="grid min-h-dvh place-items-center bg-ink-950 px-6 text-center">
      <div>
        <Logo className="mx-auto w-fit justify-center" />
        <p className="outline-text mt-10 text-[28vw] sm:text-[220px]">404</p>
        <h1 className="display -mt-6 text-[36px] text-fg">Wrong turn</h1>
        <p className="mt-2 text-[14px] text-fg-muted">This page doesn’t exist. The garage is still open.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="primary">
            <Link to="/garage">Open the garage</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
