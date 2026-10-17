import * as React from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-md bg-ink-900 border border-line-strong px-3 text-[15px] text-fg placeholder:text-fg-subtle transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-accent'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, 'h-11', className)} {...props} />
))
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(fieldBase, 'min-h-24 py-2.5 resize-y', className)} {...props} />,
)
Textarea.displayName = 'Textarea'

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-medium text-fg">
        {label}
        {optional && <span className="text-[11px] font-normal text-fg-subtle">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[12px] text-[#ff6b6b]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  )
}
