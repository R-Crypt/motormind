import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { size?: 'md' | 'lg' }
>(({ className, children, size = 'md', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] data-[state=open]:animate-[overlay-in_200ms_ease-out]" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-ink-850 border border-line-strong shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)] outline-none',
        // mobile: bottom sheet · desktop: centred dialog
        'inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl scroll-thin',
        'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:max-h-[88dvh]',
        size === 'md' ? 'sm:w-[min(520px,92vw)]' : 'sm:w-[min(720px,94vw)]',
        'data-[state=open]:animate-[dialog-in_320ms_var(--ease-out-expo)]',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-md text-fg-muted hover:bg-white/5 hover:text-fg"
        aria-label="Close"
      >
        <X className="size-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pt-6 pb-4 pr-14', className)} {...props} />
}
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('display text-[28px] text-fg', className)} {...props} />
))
DialogTitle.displayName = 'DialogTitle'
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('mt-2 text-sm text-fg-muted leading-relaxed', className)} {...props} />
))
DialogDescription.displayName = 'DialogDescription'
