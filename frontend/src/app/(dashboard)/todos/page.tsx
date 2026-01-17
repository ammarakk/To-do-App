'use client'

/**
 * Todos Page Component
 *
 * Main todos management page with:
 * - Todo list display with pagination
 * - Filter bar for search and filtering
 * - Todo form for creating new todos
 * - Loading and empty states
 *
 * Features:
 * - Client-side state management
 * - Real API integration with JWT authentication
 * - Responsive layout with mobile-first design
 * - Professional, polished interface
 */

import { useState, useEffect } from 'react'
import TodoList from '@/components/todos/TodoList'
import TodoForm from '@/components/todos/TodoForm'
import FilterBar from '@/components/todos/FilterBar'

/**
 * Todo data structure matching API schema
 */
export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  due_date: string | null
  category: string | null
  created_at: string
  updated_at: string
}

/**
 * Filter state interface
 */
export interface TodoFilters {
  search: string
  priority: string
  status: string
  category: string
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  page: number
  limit: number
  total: number
}

export default function TodosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [filters, setFilters] = useState<TodoFilters>({
    search: '',
    priority: '',
    status: '',
    category: '',
  })
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  })
  const [refreshKey, setRefreshKey] = useState(0)

  /**
   * Handle updates from child components
   * Forces a re-fetch of todos
   */
  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters: Partial<TodoFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  /**
   * Handle page changes
   */
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Open form for creating new todo
   */
  const handleCreateNew = () => {
    setEditingTodo(null)
    setIsFormOpen(true)
  }

  /**
   * Open form for editing existing todo
   */
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsFormOpen(true)
  }

  /**
   * Close form
   */
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTodo(null)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Todos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your tasks and stay organized
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 min-h-[44px] transition-colors"
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
            Add Todo
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => setFilters({ search: '', priority: '', status: '', category: '' })}
      />

      {/* Todo list */}
      <TodoList
        key={refreshKey}
        filters={filters}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onUpdate={handleUpdate}
      />

      {/* Todo form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseForm}
              aria-hidden="true"
            ></div>

            {/* Form panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                      {editingTodo ? 'Edit Todo' : 'Create New Todo'}
                    </h3>
                    <div className="mt-4">
                      <TodoForm
                        todo={editingTodo}
                        onClose={handleCloseForm}
                        onSuccess={handleUpdate}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
