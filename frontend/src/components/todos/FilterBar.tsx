'use client'

/**
 * FilterBar Component - Neon Dark Theme
 * Phase 4: Professional Audit Hardening
 *
 * Provides filtering and search functionality for todos:
 * - Search input using neon Input component
 * - Filter by priority (low, medium, high)
 * - Filter by status (pending, in_progress, completed)
 * - Filter by category
 * - Clear all filters button using neon Button
 *
 * Features:
 * - Responsive layout (stacked on mobile, inline on desktop)
 * - Real-time filter updates
 * - Visual indication of active filters with neon glow
 * - Accessible form controls
 * - Dark theme with neon accents
 */

import { TodoFilters } from '@/app/(dashboard)/todos/page'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface FilterBarProps {
  filters: TodoFilters
  onFilterChange: (filters: Partial<TodoFilters>) => void
  onClearFilters: () => void
}

export default function FilterBar({ filters, onFilterChange, onClearFilters }: FilterBarProps) {
  /**
   * Check if any filters are active
   */
  const hasActiveFilters = () => {
    return filters.search || filters.priority || filters.status || filters.category
  }

  /**
   * Available options for filters
   */
  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'health', label: 'Health' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <Card variant="default" padding="md" className="space-y-4">
      <form className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4" onSubmit={(e) => e.preventDefault()}>
        {/* Search input */}
        <div className="flex-1">
          <div className="relative">
            <Input
              id="search"
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search todos..."
              className="pl-10"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Priority filter */}
        <div className="sm:w-48">
          <label htmlFor="priority-filter" className="sr-only">
            Filter by priority
          </label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value })}
            aria-label="Filter todos by priority"
            className="block w-full rounded-md border border-gray-700 bg-dark-input px-3 py-2 text-sm text-primary focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-950 shadow-[0_0_5px_rgba(0,255,255,0.1)] focus:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all duration-200 min-h-[44px]"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="sm:w-48">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            aria-label="Filter todos by status"
            className="block w-full rounded-md border border-gray-700 bg-dark-input px-3 py-2 text-sm text-primary focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-950 shadow-[0_0_5px_rgba(0,255,255,0.1)] focus:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all duration-200 min-h-[44px]"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category filter */}
        <div className="sm:w-48">
          <label htmlFor="category-filter" className="sr-only">
            Filter by category
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            aria-label="Filter todos by category"
            className="block w-full rounded-md border border-gray-700 bg-dark-input px-3 py-2 text-sm text-primary focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-950 shadow-[0_0_5px_rgba(0,255,255,0.1)] focus:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all duration-200 min-h-[44px]"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters() && (
          <div>
            <Button
              variant="ghost"
              size="md"
              onClick={onClearFilters}
              aria-label="Clear all filters"
              type="button"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear Filters
            </Button>
          </div>
        )}
      </form>

      {/* Active filters display (mobile friendly) */}
      {hasActiveFilters() && (
        <div className="mt-4 flex flex-wrap gap-2 sm:hidden">
          {filters.search && (
            <span className="inline-flex items-center rounded-md bg-cyan-950/30 px-2 py-1 text-xs font-medium text-cyan-300 border border-cyan-600/50 shadow-[0_0_5px_rgba(0,255,255,0.2)]">
              Search: {filters.search}
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center rounded-md bg-amber-950/40 px-2 py-1 text-xs font-medium text-amber-300 border border-amber-600/50 shadow-[0_0_5px_rgba(251,191,36,0.2)]">
              Priority: {filters.priority}
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center rounded-md bg-fuchsia-950/30 px-2 py-1 text-xs font-medium text-fuchsia-400 border border-fuchsia-700/50 shadow-[0_0_5px_rgba(255,0,255,0.2)]">
              Status: {filters.status}
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center rounded-md bg-fuchsia-950/30 px-2 py-1 text-xs font-medium text-fuchsia-400 border border-fuchsia-700/50 shadow-[0_0_5px_rgba(255,0,255,0.2)]">
              Category: {filters.category}
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
