'use client'

/**
 * TodoItem Component
 *
 * Displays individual todo with:
 * - Title, description, and metadata
 * - Priority and status badges
 * - Due date display
 * - Edit and delete actions
 * - Status toggle checkbox
 *
 * Features:
 * - Responsive card layout
 * - Color-coded priority indicators
 * - Hover effects and transitions
 * - Touch-friendly action buttons
 * - Accessible keyboard navigation
 */

import { Todo } from '@/app/(dashboard)/todos/page'

interface TodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (todoId: string) => void
  onToggleStatus: (todoId: string, currentStatus: Todo['status']) => void
}

export default function TodoItem({ todo, onEdit, onDelete, onToggleStatus }: TodoItemProps) {
  /**
   * Get priority badge styles
   */
  const getPriorityBadge = () => {
    const styles = {
      low: 'bg-blue-50 text-blue-700 border-blue-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      high: 'bg-red-50 text-red-700 border-red-200',
    }
    return styles[todo.priority]
  }

  /**
   * Get status badge styles
   */
  const getStatusBadge = () => {
    const styles = {
      pending: 'bg-gray-50 text-gray-700 border-gray-200',
      in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
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

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
      isCompleted ? 'border-gray-200 opacity-75' : 'border-gray-200'
    }`}>
      <div className="p-4 sm:p-5">
        {/* Header: checkbox and title */}
        <div className="flex items-start gap-3 mb-3">
          {/* Status checkbox */}
          <button
            type="button"
            onClick={() => onToggleStatus(todo.id, todo.status)}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors min-h-[20px] min-w-[20px] ${
              isCompleted
                ? 'bg-green-600 border-green-600'
                : 'border-gray-300 hover:border-green-500'
            }`}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
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
            <h3 className={`text-base font-semibold text-gray-900 break-words ${
              isCompleted ? 'line-through text-gray-500' : ''
            }`}>
              {todo.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <p className={`text-sm text-gray-600 mb-4 line-clamp-2 ${
            isCompleted ? 'line-through text-gray-400' : ''
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
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 border border-purple-200">
              {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
            </span>
          )}

          {/* Due date */}
          {todo.due_date && (
            <span className={`inline-flex items-center text-xs ${
              new Date(todo.due_date) < new Date() && !isCompleted
                ? 'text-red-600 font-medium'
                : 'text-gray-500'
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
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          {/* Edit button */}
          <button
            type="button"
            onClick={() => onEdit(todo)}
            className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 min-h-[44px] min-w-[44px] transition-colors"
            aria-label={`Edit ${todo.title}`}
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
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {
                onDelete(todo.id)
              }
            }}
            className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 min-h-[44px] min-w-[44px] transition-colors"
            aria-label={`Delete ${todo.title}`}
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
          </button>
        </div>
      </div>
    </div>
  )
}
