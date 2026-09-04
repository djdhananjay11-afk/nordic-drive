import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:bg-primary/90",
        secondary:
          "border border-glass-border bg-secondary/80 text-secondary-foreground backdrop-blur-xl hover:-translate-y-0.5 hover:bg-secondary",
        ghost: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        glass:
          "border border-glass-border bg-white/[0.08] text-foreground backdrop-blur-2xl hover:-translate-y-0.5 hover:bg-white/[0.12]",
        neon:
          "border border-primary/40 bg-primary/10 text-primary shadow-glow hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground",
        luxury:
          "border border-white/[0.15] bg-gradient-to-r from-white/[0.14] via-white/[0.08] to-white/5 text-foreground backdrop-blur-2xl hover:-translate-y-0.5 hover:border-primary/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        xl: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
