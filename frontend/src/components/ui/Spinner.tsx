'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Loading Spinner Components
 * Modern loading indicators with neon theme styling
 */

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'bar' | 'neon';
}

/**
 * Circular Spinner Component
 * Classic spinning loader with neon glow
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4',
      xl: 'w-16 h-16 border-4',
    };

    const variantClasses = {
      default: 'border-cyan-500/30 border-t-cyan-500',
      neon: 'border-fuchsia-500/30 border-t-fuchsia-500',
    };

    if (variant === 'dots') {
      return <DotsSpinner ref={ref} size={size} className={className} {...props} />;
    }

    if (variant === 'bar') {
      return <BarSpinner ref={ref} className={className} {...props} />;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full animate-spin',
          sizeClasses[size],
          variantClasses[variant as keyof typeof variantClasses],
          'shadow-[0_0_10px_rgba(0,255,255,0.3)]',
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * Dots Spinner Component
 * Three animated dots with bounce effect
 */
export interface DotsSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const DotsSpinner = React.forwardRef<HTMLDivElement, DotsSpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const dotSizes = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
      xl: 'w-5 h-5',
    };

    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.6)]',
              dotSizes[size],
              'animate-bounce'
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
    );
  }
);

DotsSpinner.displayName = 'DotsSpinner';

/**
 * Bar Spinner Component
 * Animated progress bar with neon glow
 */
export const BarSpinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('w-full h-2 bg-gray-800 rounded-full overflow-hidden', className)}
        {...props}
      >
        <div className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500 rounded-full animate-shimmer shadow-[0_0_10px_rgba(0,255,255,0.5)]" style={{
          backgroundSize: '200% 100%',
          width: '60%',
        }} />
      </div>
    );
  }
);

BarSpinner.displayName = 'BarSpinner';

/**
 * Full Page Loader
 * Centered spinner with backdrop for full-page loading states
 */
export interface FullPageLoaderProps {
  message?: string;
  variant?: 'default' | 'dots' | 'bar' | 'neon';
}

export function FullPageLoader({ message, variant = 'default' }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" variant={variant} />
        {message && (
          <p className="text-sm text-gray-400 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Inline Loader
 * Compact loading indicator for inline use
 */
export interface InlineLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InlineLoader({ text, size = 'sm' }: InlineLoaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size={size} />
      {text && <span className="text-sm text-gray-400">{text}</span>}
    </div>
  );
}

/**
 * Button Loader
 * Loading state for button content
 */
export function ButtonLoader() {
  return (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      <span>Loading...</span>
    </div>
  );
}
