import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "matrix-button bg-black border-2 border-violet-400 text-violet-400 hover:text-violet-300 hover:border-violet-300",
        destructive:
          "matrix-button bg-black border-2 border-red-500 text-red-500 hover:text-red-400 hover:border-red-400",
        outline:
          "matrix-button bg-black border-2 border-violet-400/50 text-violet-400 hover:text-violet-300 hover:border-violet-300",
        secondary:
          "matrix-button bg-black border-2 border-purple-400 text-purple-400 hover:text-purple-300 hover:border-purple-300",
        ghost:
          "matrix-button bg-transparent border-2 border-transparent text-violet-400 hover:text-violet-300 hover:border-violet-400/30",
        link: "matrix-button bg-transparent border-none text-violet-400 underline-offset-4 hover:underline hover:text-violet-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        <div className="code-rain" />
        {children}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
