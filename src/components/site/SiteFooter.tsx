import { brand, disclaimers } from '@/config/brand'
import { Logo } from '@/components/brand/Logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink-950">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-[12.5px] leading-relaxed text-fg-subtle">
            {brand.legalName} · {brand.tagline}. Established {brand.founded}.
          </p>
        </div>
        <div className="space-y-2 text-[12.5px] text-fg-muted">
          <p className="eyebrow mb-3">Contact</p>
          <a className="block hover:text-fg" href={`tel:${brand.phoneE164}`}>
            {brand.phoneDisplay}
          </a>
          <a className="block hover:text-fg" href={`mailto:${brand.email}`}>
            {brand.email}
          </a>
          <a className="block hover:text-fg" href={brand.facebook} target="_blank" rel="noopener noreferrer">
            facebook.com/motormindindia
          </a>
        </div>
        <div className="space-y-2 text-[11.5px] leading-relaxed text-fg-subtle">
          <p className="eyebrow mb-3">About this prototype</p>
          <p>{disclaimers.concept}</p>
          <p>{disclaimers.pricing}</p>
          <p>Project photography: MotorMind’s own published imagery. Polo GT TSI preview: self-generated render. Volkswagen, Polo and GT TSI are trademarks of their owner; no affiliation is implied.</p>
        </div>
      </div>
    </footer>
  )
}
