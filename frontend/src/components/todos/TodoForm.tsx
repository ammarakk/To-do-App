'use client'

/**
 * TodoForm Component
 *
 * Form for creating and editing todos:
 * - Title (required)
 * - Description (optional)
 * - Priority (required: low, medium, high)
 * - Due date (optional)
 * - Category (optional)
 * - Client-side validation
 * - Loading state during submission
 *
 * Features:
 * - Responsive form layout
 * - Real-time validation feedback
 * - Accessible form controls
 * - Professional styling
 * - Clear error messages
 */

import { useState } from 'react'
import { Todo } from '@/app/(dashboard)/todos/page'
import { apiClient, ApiRequestError, getErrorMessage, TodoCreate, TodoUpdate } from '@/lib/api'

interface TodoFormProps {
  todo: Todo | null
  onClose: () => void
  onSuccess: () => void
}

interface FormErrors {
  title?: string
  priority?: string
  general?: string
}

interface FormData {
  title: string
  description: string
  priority: Todo['priority']
  due_date: string | null
  category: string
}

const categoryOptions = [
  { value: '', label: 'Select category (optional)' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export default function TodoForm({ todo, onClose, onSuccess }: TodoFormProps) {
  const isEditing = Boolean(todo)

  const [formData, setFormData] = useState<FormData>({
    title: todo?.title || '',
    description: todo?.description || '',
    priority: todo?.priority || 'medium',
    due_date: todo?.due_date || null,
    category: todo?.category || '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    // Priority validation
    if (!formData.priority) {
      newErrors.priority = 'Priority is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   *
   * Includes rapid-click protection via isLoading state:
   * - Form submission disabled while isLoading is true
   * - Early return prevents double-submission
   * - All buttons disabled during async operations
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double-submission
    if (isLoading) {
      return
    }

    // Clear previous errors
    setErrors({})

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (isEditing && todo) {
        // Update existing todo
        const updateData: TodoUpdate = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          priority: formData.priority,
          category: formData.category || undefined,
          due_date: formData.due_date || undefined,
        }

        await apiClient.updateTodo(todo.id, updateData)
      } else {
        // Create new todo
        const createData: TodoCreate = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          priority: formData.priority,
          category: formData.category || undefined,
          due_date: formData.due_date || undefined,
          status: 'pending',
        }

        await apiClient.createTodo(createData)
      }

      // Close form on success
      onClose()

      // Trigger parent refresh
      onSuccess()
    } catch (error) {
      console.error('Error saving todo:', error)

      if (error instanceof ApiRequestError) {
        const errorMessage = getErrorMessage(error)

        // Set general error
        setErrors({ general: errorMessage })
      } else {
        setErrors({ general: 'Failed to save todo. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* General error message */}
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800" role="alert">
            {errors.general}
          </p>
        </div>
      )}

      {/* Title field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            aria-invalid={errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? 'title-error' : undefined}
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="What needs to be done?"
          />
          {errors.title && (
            <p id="title-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.title}
            </p>
          )}
        </div>
      </div>

      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none"
            placeholder="Add more details..."
          />
        </div>
      </div>

      {/* Priority field */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <select
            id="priority"
            name="priority"
            required
            value={formData.priority}
            onChange={handleChange}
            aria-invalid={errors.priority ? 'true' : 'false'}
            aria-describedby={errors.priority ? 'priority-error' : undefined}
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.priority && (
            <p id="priority-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.priority}
            </p>
          )}
        </div>
      </div>

      {/* Category field */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="mt-1">
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due date field */}
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <div className="mt-1">
          <input
            id="due_date"
            name="due_date"
            type="date"
            value={formData.due_date || ''}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {/* Form actions */}
      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {isEditing ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            isEditing ? 'Update Todo' : 'Create Todo'
          )}
        </button>
      </div>
    </form>
  )
}
