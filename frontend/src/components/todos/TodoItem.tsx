'use client'

/**
 * TodoItem Component - Neon Dark Theme
 * Phase 6: Professional Audit Hardening - Final Polish
 *
 * Displays individual todo with:
 * - Title, description, and metadata
 * - Priority and status badges with neon colors
 * - Due date display
 * - Edit and delete actions using neon Button components
 * - Status toggle checkbox
 * - Neon Card component for container
 * - Rapid-click protection on all interactive elements
 *
 * Features:
 * - Responsive card layout with dark theme
 * - Neon color-coded priority and status indicators
 * - Hover effects with glow
 * - Touch-friendly action buttons
 * - Accessible keyboard navigation
 * - Processing state to prevent double-clicks
 */

import { useState } from 'react'
import { Todo } from '@/app/(dashboard)/todos/page'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface TodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (todoId: string) => void
  onToggleStatus: (todoId: string, currentStatus: Todo['status']) => void
}

export default function TodoItem({ todo, onEdit, onDelete, onToggleStatus }: TodoItemProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  /**
   * Get priority badge styles with neon colors
   * Colors adjusted to meet WCAG AA contrast requirements (4.5:1 for normal text)
   */
  const getPriorityBadge = () => {
    const styles = {
      low: 'bg-cyan-950/30 text-cyan-300 border-cyan-600/50 shadow-[0_0_5px_rgba(0,255,255,0.2)]', // Lighter cyan for better contrast
      medium: 'bg-amber-950/40 text-amber-300 border-amber-600/50 shadow-[0_0_5px_rgba(251,191,36,0.2)]', // Amber instead of yellow for better contrast
      high: 'bg-red-950/30 text-red-400 border-red-700/50 shadow-[0_0_5px_rgba(255,0,0,0.2)]', // Red already meets requirements
    }
    return styles[todo.priority]
  }

  /**
   * Get status badge styles with neon colors
   */
  const getStatusBadge = () => {
    const styles = {
      pending: 'bg-gray-800/50 text-gray-400 border-gray-700',
      in_progress: 'bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-700/50 shadow-[0_0_5px_rgba(255,0,255,0.2)]',
      completed: 'bg-green-950/30 text-green-400 border-green-700/50 shadow-[0_0_5px_rgba(0,255,0,0.2)]',
    }
    return styles[todo.status]
  }

  /**
   * Format due date for display
   */
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null

    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Reset time to midnight for comparison
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    let displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    if (date.getTime() === today.getTime()) {
      displayDate = 'Today'
    } else if (date.getTime() === tomorrow.getTime()) {
      displayDate = 'Tomorrow'
    } else if (date < today) {
      displayDate = `${displayDate} (Overdue)`
    }

    return displayDate
  }

  /**
   * Get status label for display
   */
  const getStatusLabel = (status: Todo['status']) => {
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
    }
    return labels[status]
  }

  const isCompleted = todo.status === 'completed'

  /**
   * Handle status toggle with rapid-click protection
   */
  const handleToggleClick = () => {
    if (isProcessing) return
    setIsProcessing(true)
    onToggleStatus(todo.id, todo.status)
    // Reset processing state after a short delay
    setTimeout(() => setIsProcessing(false), 500)
  }

  /**
   * Handle edit with rapid-click protection
   */
  const handleEditClick = () => {
    if (isProcessing) return
    setIsProcessing(true)
    onEdit(todo)
    // Reset processing state after modal open
    setTimeout(() => setIsProcessing(false), 200)
  }

  /**
   * Handle delete with rapid-click protection
   */
  const handleDeleteClick = () => {
    if (isProcessing) return
    if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      setIsProcessing(true)
      onDelete(todo.id)
      // Keep processing state true during deletion
    }
  }

  return (
    <Card
      variant="neon-border"
      padding="md"
      hover
      className={`transition-all duration-200 ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
        {/* Header: checkbox and title */}
        <div className="flex items-start gap-3 mb-3">
          {/* Status checkbox */}
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={isProcessing}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 min-h-[20px] min-w-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
              isCompleted
                ? 'bg-green-600 border-green-600'
                : 'border-gray-300 hover:border-green-500'
            }`}
            aria-label={`Mark "${todo.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
          >
            {isCompleted && (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="3"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-semibold text-primary break-words ${
              isCompleted ? 'line-through text-secondary' : ''
            }`}>
              {todo.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <p className={`text-sm text-secondary mb-4 line-clamp-2 ${
            isCompleted ? 'line-through text-gray-500' : ''
          }`}>
            {todo.description}
          </p>
        )}

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Priority badge */}
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${getPriorityBadge()}`}>
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
          </span>

          {/* Status badge */}
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${getStatusBadge()}`}>
            {getStatusLabel(todo.status)}
          </span>

          {/* Category badge */}
          {todo.category && (
            <span className="inline-flex items-center rounded-md bg-fuchsia-950/30 px-2 py-1 text-xs font-medium text-fuchsia-400 border border-fuchsia-700/50 shadow-[0_0_5px_rgba(255,0,255,0.2)]">
              {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
            </span>
          )}

          {/* Due date */}
          {todo.due_date && (
            <span className={`inline-flex items-center text-xs ${
              new Date(todo.due_date) < new Date() && !isCompleted
                ? 'text-red-400 font-medium shadow-[0_0_5px_rgba(255,0,0,0.3)]'
                : 'text-secondary'
            }`}>
              <svg
                className="mr-1 h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatDueDate(todo.due_date)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-cyan-900/30">
          {/* Edit button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            disabled={isProcessing}
            aria-label={`Edit todo: ${todo.title}`}
          >
            <svg
              className="h-4 w-4 sm:mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </Button>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isProcessing}
            aria-label={`Delete todo: ${todo.title}`}
            className="text-red-400 hover:bg-red-950/30 border-red-700/50 hover:border-red-400 hover:shadow-[0_0_10px_rgba(255,0,0,0.3)] focus-visible:ring-red-400 disabled:opacity-50"
          >
            <svg
              className="h-4 w-4 sm:mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
    </Card>
  )
}
