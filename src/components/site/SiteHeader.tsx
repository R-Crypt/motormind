import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#garage', label: 'The Garage' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
]

export function SiteHeader({ links = true }: { links?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background,border-color] duration-300',
        scrolled ? 'border-b border-line bg-ink-950/90 backdrop-blur-md' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-5 sm:px-8">
        <Logo />
        {links && (
          <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="rounded-md px-3 py-2 text-[13px] text-fg-muted transition-colors hover:text-fg">
                {l.label}
              </a>
            ))}
          </nav>
        )}
        <Button asChild variant="primary" size="sm" className="ml-auto h-9 px-4">
          <Link id="header-build" to="/garage" onClick={() => track('landing_cta_clicked', { cta: 'header_build' })}>
            Build Your Car <ArrowRight />
          </Link>
        </Button>
      </div>
    </header>
  )
}
