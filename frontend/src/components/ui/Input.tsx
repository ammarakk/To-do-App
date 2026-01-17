'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input Component - Dark Neon Theme
 * Phase 1: Professional Audit Hardening
 *
 * A polished input component with neon focus effects and dark backgrounds.
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Input component with neon theme styling
 *
 * @example
 * ```tsx
 * <Input
 *   type="text"
 *   placeholder="Enter todo title..."
 *   label="Title"
 *   error={errors.title}
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neon-primary font-[var(--font-orbitron)]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border bg-dark-input px-3 py-2 text-sm text-primary placeholder:text-secondary transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'border-gray-700',
            error
              ? 'border-red-500 focus-visible:ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
              : 'focus-visible:border-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.1)] focus-visible:shadow-[0_0_10px_rgba(0,255,255,0.3)]',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperId}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-red-400 font-[var(--font-inter)]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-secondary font-[var(--font-inter)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
