import { serviceLines } from '@/config/brand'
import type { ModOption, Selections } from '@/data/types'
import { conflictReason, optionPrice } from '@/lib/configuration'
import { formatINR } from '@/lib/utils'

export function priceLabel(opt: ModOption, sel: Selections) {
  const p = optionPrice(opt, { ...sel, [opt.slot]: opt.id })
  if (opt.availability === 'stock') return 'Factory'
  return p === 0 ? 'Included' : `+${formatINR(p)}`
}

export interface OptionState {
  selected: boolean
  blocked: string | null
  price: string
}

export function optionState(opt: ModOption, sel: Selections): OptionState {
  return {
    selected: sel[opt.slot] === opt.id,
    blocked: sel[opt.slot] === opt.id ? null : conflictReason(opt, sel),
    price: priceLabel(opt, sel),
  }
}

export const serviceName = (opt: ModOption) => (opt.serviceLine ? serviceLines[opt.serviceLine].name : null)
