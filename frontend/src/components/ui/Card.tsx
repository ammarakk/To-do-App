'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card Component - Dark Neon Theme
 * Phase 1: Professional Audit Hardening
 *
 * A polished card component with dark backgrounds and subtle glow effects.
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'neon-border' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

/**
 * Card component with neon theme styling
 *
 * @example
 * ```tsx
 * <Card variant="neon-border" padding="md" hover>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here...</p>
 * </Card>
 * ```
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const variantClasses = {
      default: 'bg-dark-card border border-gray-800',
      'neon-border': 'bg-dark-card border border-cyan-700/50 shadow-[0_0_5px_rgba(0,255,255,0.1)]',
      elevated: 'bg-dark-card border border-gray-700 shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          paddingClasses[padding],
          variantClasses[variant],
          hover && 'hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:border-cyan-600/50 hover:-translate-y-0.5 focus-within:shadow-[0_0_15px_rgba(0,255,255,0.2)] focus-within:border-cyan-600/50',
          className
        )}
        tabIndex={props.onClick ? 0 : undefined}
        onKeyDown={props.onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            props.onClick?.(e as any);
          }
        } : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
