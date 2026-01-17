'use client'

/**
 * TodoList Component
 *
 * Displays a paginated list of todos with:
 * - Loading skeleton during data fetch
 * - Empty state when no todos exist
 * - Individual todo items with actions
 * - Pagination controls
 *
 * Features:
 * - Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
 * - Smooth transitions between states
 * - Accessible interactions
 * - Real API integration with JWT authentication
 */

import { useState, useEffect } from 'react'
import TodoItem from './TodoItem'
import Pagination from './Pagination'
import { Todo, TodoFilters, PaginationState } from '@/app/(dashboard)/todos/page'
import { apiClient, ApiRequestError, getErrorMessage } from '@/lib/api'

interface TodoListProps {
  filters: TodoFilters
  pagination: PaginationState
  onPageChange: (page: number) => void
  onEdit: (todo: Todo) => void
  onUpdate: () => void
}

export default function TodoList({ filters, pagination, onPageChange, onEdit, onUpdate }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)

  /**
   * Fetch todos based on filters and pagination from API
   */
  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Build query parameters from filters
        const params: Record<string, string | number | undefined> = {
          page: pagination.page,
          page_size: pagination.limit,
        }

        // Add filters if they are set
        if (filters.search) params.search = filters.search
        if (filters.priority) params.priority = filters.priority
        if (filters.status) params.status = filters.status
        if (filters.category) params.category = filters.category

        // Call API
        const response = await apiClient.getTodos(params)

        // Update todos from API response
        setTodos(response.items)

        // Update pagination total from API response
        pagination.total = response.total
      } catch (err) {
        console.error('Error fetching todos:', err)

        if (err instanceof ApiRequestError) {
          setError(getErrorMessage(err))
        } else {
          setError('Failed to load todos. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodos()
  }, [filters, pagination.page, pagination.limit])

  /**
   * Handle todo deletion
   */
  const handleDelete = async (todoId: string) => {
    try {
      // Call API to delete todo
      await apiClient.deleteTodo(todoId)

      // Remove from local state (optimistic update)
      setTodos(prev => prev.filter(todo => todo.id !== todoId))

      // Trigger parent update to refresh pagination
      onUpdate()
    } catch (err) {
      console.error('Error deleting todo:', err)

      if (err instanceof ApiRequestError) {
        // Check for conflict error (409)
        if (err.statusCode === 409) {
          setConflictWarning('This todo was modified elsewhere. Please refresh and try again.')
          setTimeout(() => setConflictWarning(null), 5000)
          // Refresh list to get latest data
          setTimeout(() => {
            window.location.reload()
          }, 2000)
          return
        }
        setError(getErrorMessage(err))
      } else {
        setError('Failed to delete todo. Please try again.')
      }

      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null)
      }, 3000)
    }
  }

  /**
   * Handle todo status toggle
   */
  const handleToggleStatus = async (todoId: string, currentStatus: Todo['status']) => {
    const previousStatus = currentStatus
    const newStatus: Todo['status'] = currentStatus === 'completed' ? 'pending' : 'completed'

    // Optimistic update
    setTodos(prev =>
      prev.map(todo =>
        todo.id === todoId ? { ...todo, status: newStatus } : todo
      )
    )

    try {
      if (newStatus === 'completed') {
        // Call API to mark as completed
        await apiClient.markTodoCompleted(todoId)
      } else {
        // Call API to update status to pending
        await apiClient.updateTodo(todoId, { status: 'pending' })
      }

      // Trigger parent update
      onUpdate()
    } catch (err) {
      console.error('Error toggling todo status:', err)

      // Revert optimistic update
      setTodos(prev =>
        prev.map(todo =>
          todo.id === todoId ? { ...todo, status: previousStatus } : todo
        )
      )

      if (err instanceof ApiRequestError) {
        // Check for conflict error (409)
        if (err.statusCode === 409) {
          setConflictWarning('This todo was modified elsewhere. Your changes were reverted.')
          setTimeout(() => setConflictWarning(null), 5000)
          return
        }
        setError(getErrorMessage(err))
      } else {
        setError('Failed to update todo status. Please try again.')
      }

      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null)
      }, 3000)
    }
  }

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              {/* Title skeleton */}
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              {/* Description skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              {/* Metadata skeletons */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              {/* Action buttons skeleton */}
              <div className="flex justify-end gap-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-8"></div>
            <div className="h-8 bg-gray-200 rounded w-8"></div>
            <div className="h-8 bg-gray-200 rounded w-8"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-red-900">Error loading todos</h3>
        <p className="mt-1 text-sm text-red-500">{error}</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 min-h-[44px]"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No todos found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {filters.search || filters.priority || filters.status || filters.category
            ? 'Try adjusting your filters to find what you\'re looking for.'
            : 'Get started by creating a new todo.'}
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => document.querySelector('button[onClick^="handleCreateNew"]')?.dispatchEvent(new Event('click'))}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-h-[44px]"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New Todo
          </button>
        </div>
      </div>
    )
  }

  // Todo list with pagination
  return (
    <div className="space-y-6">
      {/* Conflict warning banner */}
      {conflictWarning && (
        <div className="rounded-md bg-amber-950/30 border border-amber-500/50 p-4 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          <div className="flex">
            <svg
              className="h-5 w-5 text-amber-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-amber-200">{conflictWarning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Todo grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onEdit={onEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.limit) || 1}
        onPageChange={onPageChange}
      />
    </div>
  )
}
