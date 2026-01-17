'use client'

/**
 * FilterBar Component
 *
 * Provides filtering and search functionality for todos:
 * - Search input for title/description
 * - Filter by priority (low, medium, high)
 * - Filter by status (pending, in_progress, completed)
 * - Filter by category
 * - Clear all filters button
 *
 * Features:
 * - Responsive layout (stacked on mobile, inline on desktop)
 * - Real-time filter updates
 * - Visual indication of active filters
 * - Accessible form controls
 */

import { TodoFilters } from '@/app/(dashboard)/todos/page'

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search input */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search todos
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
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
            <input
              id="search"
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search todos..."
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 min-h-[44px]"
            />
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
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 min-h-[44px]"
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
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 min-h-[44px]"
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
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 min-h-[44px]"
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
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 min-h-[44px] transition-colors"
            >
              <svg
                className="mr-2 h-4 w-4 text-gray-400"
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
            </button>
          </div>
        )}
      </div>

      {/* Active filters display (mobile friendly) */}
      {hasActiveFilters() && (
        <div className="mt-4 flex flex-wrap gap-2 sm:hidden">
          {filters.search && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              Search: {filters.search}
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
              Priority: {filters.priority}
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              Status: {filters.status}
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
              Category: {filters.category}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
