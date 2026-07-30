import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/cn"

const buttonVariants = cva(
  "ui-glow-ring group/button relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/20 bg-gray-950/65 bg-clip-padding text-sm font-semibold whitespace-nowrap text-white shadow-black/0 backdrop-blur-lg transition-all duration-300 ease-in-out outline-none select-none after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-10 after:bg-white/20 after:duration-300 after:[transform:skew(-13deg)_translateX(-200%)] hover:scale-110 hover:shadow-xl hover:shadow-gray-600/50 hover:after:duration-1000 hover:after:[transform:skew(-13deg)_translateX(1600%)] active:scale-95 hover:active:scale-95 focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none disabled:after:hidden aria-invalid:border-destructive aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "text-white",
        outline: "text-white",
        secondary: "border-white/15 bg-gray-900/65 text-white",
        ghost: "border-white/15 bg-black/55 text-white",
        destructive:
          "border-destructive/50 bg-destructive/15 text-white focus-visible:ring-destructive/50",
        link:
          "overflow-visible border-transparent bg-transparent text-primary shadow-none after:hidden hover:scale-100 hover:shadow-none hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-8 rounded-full",
        "icon-xs":
          "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-full",
        "icon-lg": "size-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
