'use client'

/**
 * Pagination Component
 *
 * Provides page navigation controls with:
 * - Previous/Next buttons
 * - Page number buttons
 * - Current page highlighting
 * - Disabled states for boundaries
 *
 * Features:
 * - Responsive design (full buttons on desktop, simplified on mobile)
 * - Accessible keyboard navigation
 * - Touch-friendly button sizes (min 44x44px)
 * - Visual feedback on hover/focus
 */

import { useState } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  /**
   * Generate array of page numbers to display
   */
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 3) {
        // Near start
        pages.push(2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        // Middle
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }

    return pages
  }

  /**
   * Handle page change with animation
   */
  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return

    setIsAnimating(true)
    onPageChange(page)

    // Reset animation after transition
    setTimeout(() => setIsAnimating(false), 300)
  }

  /**
   * Render a page button
   */
  const renderPageButton = (page: number | string, index: number) => {
    if (page === '...') {
      return (
        <span
          key={`ellipsis-${index}`}
          className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-400 min-h-[44px] min-w-[44px]"
        >
          ...
        </span>
      )
    }

    const isActive = page === currentPage

    return (
      <button
        key={page}
        type="button"
        onClick={() => handlePageChange(page as number)}
        disabled={isActive}
        className={`inline-flex items-center justify-center px-3 py-2 text-sm font-semibold min-h-[44px] min-w-[44px] transition-colors ${
          isActive
            ? 'bg-indigo-600 text-white'
            : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
        }`}
        aria-label={`Go to page ${page}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {page}
      </button>
    )
  }

  // Don't render if only one page
  if (totalPages <= 1) {
    return null
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      aria-label="Pagination"
    >
      {/* Results info (hidden on small mobile) */}
      <div className="hidden sm:block text-sm text-gray-700">
        Showing page <span className="font-semibold">{currentPage}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-1 items-center justify-between sm:justify-end gap-2">
        {/* Previous button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
          aria-label="Previous page"
        >
          <svg
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="hidden md:flex items-center gap-1">
          {pageNumbers.map((page, index) => renderPageButton(page, index))}
        </div>

        {/* Mobile: Show current/total only */}
        <div className="md:hidden text-sm text-gray-700">
          <span className="font-semibold">{currentPage}</span> / {totalPages}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <svg
            className="h-5 w-5 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
