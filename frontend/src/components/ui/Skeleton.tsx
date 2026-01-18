'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton Loading Components
 * Modern skeleton screens for better perceived performance
 */

/**
 * Base Skeleton Component
 * Creates a pulsing placeholder for loading content
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      text: 'rounded h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-md',
    };

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: '',
    };

    const style = {
      width: width || (variant === 'text' ? '100%' : undefined),
      height: height || (variant === 'text' ? '1rem' : undefined),
      ...props.style,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-800',
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Todo Item Skeleton
 * Placeholder for loading todo items
 */
export function TodoItemSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <Skeleton variant="circular" width={20} height={20} />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={16} />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-7">
            <Skeleton width={60} height={24} variant="rectangular" />
            <Skeleton width={60} height={24} variant="rectangular" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Todo List Skeleton
 * Full page skeleton for todo list
 */
export function TodoListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter bar skeleton */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex gap-3">
          <Skeleton width="100%" height={42} />
          <Skeleton width={120} height={42} variant="rectangular" />
          <Skeleton width={120} height={42} variant="rectangular" />
        </div>
      </div>

      {/* Todo items skeleton */}
      <TodoItemSkeleton count={5} />
    </div>
  );
}

/**
 * Form Skeleton
 * Placeholder for loading forms
 */
export function FormSkeleton({ fieldCount = 3 }: { fieldCount?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fieldCount }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton width="30%" height={20} />
          <Skeleton width="100%" height={44} variant="rectangular" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton width="50%" height={44} variant="rectangular" />
        <Skeleton width="50%" height={44} variant="rectangular" />
      </div>
    </div>
  );
}

/**
 * Card Grid Skeleton
 * Placeholder for loading card grids
 */
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton width={56} height={56} variant="circular" />
            <Skeleton width={80} height={24} variant="rectangular" />
          </div>
          <div className="space-y-2">
            <Skeleton width="70%" height={24} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="90%" height={16} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton
 * Placeholder for loading tables
 */
export function TableSkeleton({ rowCount = 5, columnCount = 4 }: { rowCount?: number; columnCount?: number }) {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columnCount }).map((_, i) => (
            <Skeleton key={i} width="20%" height={20} />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-800">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex gap-4">
              {Array.from({ length: columnCount }).map((_, j) => (
                <Skeleton key={j} width="20%" height={16} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Page Header Skeleton
 * Placeholder for loading page headers
 */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton width="40%" height={36} />
      <Skeleton width="60%" height={20} />
      <div className="flex gap-3 pt-2">
        <Skeleton width={120} height={40} variant="rectangular" />
        <Skeleton width={120} height={40} variant="rectangular" />
      </div>
    </div>
  );
}

/**
 * Stats Card Skeleton
 * Placeholder for loading statistics cards
 */
export function StatsCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton width={40} height={40} variant="circular" />
            <Skeleton width={60} height={20} />
          </div>
          <Skeleton width="60%" height={32} />
          <Skeleton width="40%" height={16} className="mt-2" />
        </div>
      ))}
    </div>
  );
}
