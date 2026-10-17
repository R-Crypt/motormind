import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none transition-[background,color,border-color,transform,box-shadow] duration-200 disabled:opacity-40 disabled:pointer-events-none active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-white hover:bg-accent-strong shadow-[0_1px_0_0_rgb(255_255_255/0.18)_inset,0_8px_24px_-8px_rgb(215_20_31/0.6)]',
        secondary: 'bg-ink-700 text-fg border border-line hover:bg-ink-600 hover:border-line-strong',
        outline: 'border border-line-strong text-fg hover:bg-white/5 hover:border-white/30',
        ghost: 'text-fg-muted hover:text-fg hover:bg-white/5',
        light: 'bg-fg text-ink-950 hover:bg-white',
        whatsapp: 'bg-[#1fa855] text-white hover:bg-[#1a9049]',
      },
      size: {
        sm: 'h-8 px-3 text-[13px] rounded-md',
        md: 'h-10 px-4 text-sm rounded-md',
        lg: 'h-12 px-6 text-[15px] rounded-lg',
        icon: 'size-9 rounded-md',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
Button.displayName = 'Button'

export { buttonVariants }
