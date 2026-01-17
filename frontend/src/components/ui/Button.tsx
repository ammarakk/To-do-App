'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button Component - Dark Neon Theme
 * Phase 1: Professional Audit Hardening
 *
 * A polished button component with neon glow effects and multiple variants.
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-neon-primary text-black hover:bg-cyan-400 border border-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] focus-visible:ring-cyan-400',
        secondary: 'bg-neon-secondary text-black hover:bg-fuchsia-400 border border-fuchsia-300 shadow-[0_0_10px_rgba(255,0,255,0.3)] hover:shadow-[0_0_15px_rgba(255,0,255,0.5)] focus-visible:ring-fuchsia-400',
        accent: 'bg-neon-accent text-white hover:bg-blue-600 border border-blue-400 shadow-[0_0_10px_rgba(0,127,255,0.3)] hover:shadow-[0_0_15px_rgba(0,127,255,0.5)] focus-visible:ring-blue-400',
        ghost: 'bg-transparent text-neon-primary hover:bg-cyan-950/30 border border-cyan-700/50 hover:border-cyan-400 focus-visible:ring-cyan-400',
      },
      size: {
        sm: 'h-9 min-h-[36px] px-3 text-xs sm:h-8', // Increased sm for better touch targets on mobile
        md: 'h-10 min-h-[40px] px-4 text-sm', // Meets 44px on mobile
        lg: 'h-12 min-h-[48px] px-6 text-base', // Comfortable touch target
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Button component with neon theme styling
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{
          '--neon-primary': '#00FFFF',
          '--neon-secondary': '#FF00FF',
          '--neon-accent': '#007FFF',
        } as React.CSSProperties}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
