import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** MotorMind roundel + chrome wordmark — original brand assets from motormind.in */
export function Logo({ className, compact = false, to = '/' }: { className?: string; compact?: boolean; to?: string }) {
  return (
    <Link to={to} className={cn('group flex items-center gap-2.5', className)} aria-label="MotorMind home">
      <img src="/motormind/logo.png" alt="" width={34} height={34} className="size-8 shrink-0 drop-shadow-[0_2px_8px_rgb(194_14_27/0.45)] transition-transform duration-500 group-hover:rotate-[-8deg]" />
      {!compact && <img src="/motormind/type.png" alt="MotorMind" width={132} height={6} className="h-[9px] w-auto opacity-90" />}
    </Link>
  )
}
