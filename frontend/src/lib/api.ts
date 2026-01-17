/**
 * API Client Module
 *
 * This module provides a typed client for interacting with the Todo API.
 * All requests include JWT authentication tokens from Supabase session.
 *
 * Features:
 * - Automatic JWT injection from Supabase session
 * - Global error handling with user-friendly messages
 * - Typed request/response functions for all endpoints
 * - Proper HTTP status code handling
 * - 401 redirect to login
 *
 * @see https://github.com/colinhacks/zod for runtime validation
 */

import { supabase } from './supabase'

/**
 * API base URL from environment variable
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Todo status enumeration matching backend schema
 */
export type TodoStatus = 'pending' | 'in_progress' | 'completed'

/**
 * Todo priority enumeration matching backend schema
 */
export type TodoPriority = 'low' | 'medium' | 'high'

/**
 * Todo data structure matching backend TodoResponse schema
 */
export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TodoStatus
  priority: TodoPriority
  due_date: string | null
  category: string | null
  created_at: string
  updated_at: string
}

/**
 * Todo creation data matching backend TodoCreate schema
 */
export interface TodoCreate {
  title: string
  description?: string
  priority: TodoPriority
  due_date?: string
  category?: string
  status?: TodoStatus
}

/**
 * Todo update data matching backend TodoUpdate schema
 * All fields are optional for partial updates
 */
export interface TodoUpdate {
  title?: string
  description?: string
  status?: TodoStatus
  priority?: TodoPriority
  due_date?: string | null
  category?: string | null
}

/**
 * Paginated response structure matching backend PaginatedResponse schema
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/**
 * Query parameters for GET /api/todos
 */
export interface GetTodosParams {
  page?: number
  page_size?: number
  search?: string
  status?: TodoStatus
  priority?: TodoPriority
  category?: string
}

/**
 * API error structure matching backend ErrorResponse schema
 */
export interface ApiError {
  code: string
  message: string
  details: Array<{
    field?: string
    message: string
  }>
}

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  statusCode: number
  code: string
  details: Array<{ field?: string; message: string }>

  constructor(message: string, statusCode: number, code: string, details: Array<{ field?: string; message: string }>) {
    super(message)
    this.name = 'ApiRequestError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/**
 * Get current JWT token from Supabase session
 *
 * @returns JWT access token or null if not authenticated
 * @throws Error if session cannot be retrieved
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting Supabase session:', error)
      return null
    }

    return session?.access_token || null
  } catch (error) {
    console.error('Unexpected error getting auth token:', error)
    return null
  }
}

/**
 * Make an authenticated API request
 *
 * @param endpoint - API endpoint path (will be prefixed with API_URL)
 * @param options - Fetch options (method, headers, body)
 * @returns Parsed JSON response
 * @throws ApiRequestError for non-2xx responses
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  // Get JWT token
  const token = await getAuthToken()

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      // Store current path for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
      }
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new ApiRequestError(
        'Authentication required. Please log in.',
        401,
        'UNAUTHORIZED',
        []
      )
    }

    // Handle other non-2xx responses
    if (!response.ok) {
      let errorData: ApiError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: [],
      }

      try {
        errorData = await response.json()
      } catch {
        // Use default error data if JSON parsing fails
      }

      throw new ApiRequestError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.code,
        errorData.details
      )
    }

    // Parse and return JSON response
    return await response.json()
  } catch (error) {
    // Re-throw ApiRequestError as-is
    if (error instanceof ApiRequestError) {
      throw error
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiRequestError(
        'Network error. Please check your connection.',
        0,
        'NETWORK_ERROR',
        []
      )
    }

    // Unknown errors
    throw new ApiRequestError(
      'An unexpected error occurred',
      0,
      'UNKNOWN_ERROR',
      []
    )
  }
}

/**
 * API Client Object
 *
 * Provides typed methods for all Todo API endpoints.
 * All methods automatically include JWT authentication.
 */
export const apiClient = {
  /**
   * Create a new todo
   * POST /api/todos
   *
   * @param todoData - Todo creation data
   * @returns Created todo object
   */
  async createTodo(todoData: TodoCreate): Promise<Todo> {
    return apiRequest<Todo>('/api/todos', {
      method: 'POST',
      body: JSON.stringify(todoData),
    })
  },

  /**
   * Get todos with pagination and filters
   * GET /api/todos
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of todos
   */
  async getTodos(params: GetTodosParams = {}): Promise<PaginatedResponse<Todo>> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.page_size) queryParams.append('page_size', params.page_size.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.status) queryParams.append('status', params.status)
    if (params.priority) queryParams.append('priority', params.priority)
    if (params.category) queryParams.append('category', params.category)

    const queryString = queryParams.toString()
    const endpoint = `/api/todos${queryString ? `?${queryString}` : ''}`

    return apiRequest<PaginatedResponse<Todo>>(endpoint)
  },

  /**
   * Get a specific todo by ID
   * GET /api/todos/{id}
   *
   * @param todoId - Todo UUID
   * @returns Todo object
   */
  async getTodoById(todoId: string): Promise<Todo> {
    return apiRequest<Todo>(`/api/todos/${todoId}`)
  },

  /**
   * Update a todo
   * PUT /api/todos/{id}
   *
   * @param todoId - Todo UUID
   * @param todoData - Partial todo update data
   * @returns Updated todo object
   */
  async updateTodo(todoId: string, todoData: TodoUpdate): Promise<Todo> {
    return apiRequest<Todo>(`/api/todos/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify(todoData),
    })
  },

  /**
   * Delete a todo
   * DELETE /api/todos/{id}
   *
   * @param todoId - Todo UUID
   * @returns Delete confirmation response
   */
  async deleteTodo(todoId: string): Promise<{ message: string; id: string }> {
    return apiRequest<{ message: string; id: string }>(`/api/todos/${todoId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Mark a todo as completed
   * PATCH /api/todos/{id}/complete
   *
   * @param todoId - Todo UUID
   * @returns Updated todo object
   */
  async markTodoCompleted(todoId: string): Promise<Todo> {
    return apiRequest<Todo>(`/api/todos/${todoId}/complete`, {
      method: 'PATCH',
    })
  },
}

/**
 * Helper function to convert API error to user-friendly message
 *
 * @param error - ApiRequestError object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: ApiRequestError): string {
  // Validation errors - show field-specific messages
  if (error.code === 'VALIDATION_ERROR' && error.details.length > 0) {
    const fieldErrors = error.details
      .map(detail => {
        if (detail.field) {
          return `${detail.field}: ${detail.message}`
        }
        return detail.message
      })
      .join(', ')
    return fieldErrors || error.message
  }

  // Specific error codes
  switch (error.code) {
    case 'UNAUTHORIZED':
      return 'Please log in to continue.'
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.'
    case 'NOT_FOUND':
      return 'The requested resource was not found.'
    case 'NETWORK_ERROR':
      return 'Network error. Please check your internet connection.'
    case 'INTERNAL_SERVER_ERROR':
      return 'Server error. Please try again later.'
    default:
      return error.message || 'An unexpected error occurred.'
  }
}
