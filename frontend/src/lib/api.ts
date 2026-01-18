/**
 * API Client Module
 *
 * This module provides a typed client for interacting with the Todo API.
 * All requests include JWT authentication tokens from localStorage.
 *
 * Features:
 * - Automatic JWT injection from localStorage access_token
 * - Global error handling with user-friendly messages
 * - Typed request/response functions for all endpoints
 * - Proper HTTP status code handling
 * - 401 redirect to login
 *
 * PLACEHOLDER: During Phase II-N migration, this uses placeholder auth.
 * Will be updated with proper Axios integration and JWT interceptors in Task Group 5.
 *
 * @see https://github.com/colinhacks/zod for runtime validation
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

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
 * Get current JWT token from localStorage
 *
 * TODO: In Task Group 5, this will integrate with token refresh logic
 * @returns JWT access token or null if not authenticated
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return localStorage.getItem('access_token') || null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

/**
 * Create Axios instance with JWT interceptors
 *
 * TODO: In Task Group 5, add:
 * - Request interceptor for JWT injection
 * - Response interceptor for 401 handling and token refresh
 * - Automatic retry on token expiry
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add JWT token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 and token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: string | undefined) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token || undefined)
    }
  })

  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return axiosInstance(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          { refresh_token: refreshToken }
        )

        const { access_token, refresh_token: newRefreshToken } = response.data

        // Store new tokens
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', newRefreshToken)

        // Store token expiry
        const payload = JSON.parse(atob(access_token.split('.')[1]))
        const expiryTime = payload.exp * 1000
        localStorage.setItem('token_expiry', expiryTime.toString())

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }

        processQueue(null, access_token)
        isRefreshing = false

        // Retry original request with new token
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(refreshError, null)
        isRefreshing = false

        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        localStorage.removeItem('token_expiry')

        // Store current path for redirect after login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
          window.location.href = '/login'
        }

        return Promise.reject(
          new ApiRequestError(
            'Your session has expired. Please log in again.',
            401,
            'SESSION_EXPIRED',
            []
          )
        )
      }
    }

    // For other errors, reject normally
    return Promise.reject(error)
  }
)

/**
 * Make an authenticated API request using Axios
 *
 * @param endpoint - API endpoint path (will be prefixed with API_URL)
 * @param options - Axios request config (method, data, params)
 * @returns Parsed JSON response
 * @throws ApiRequestError for non-2xx responses
 */
async function apiRequest<T>(
  endpoint: string,
  options: Partial<InternalAxiosRequestConfig> = {}
): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({
      url: endpoint,
      ...options,
    })

    return response.data
  } catch (error) {
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 0
      let errorData: ApiError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: [],
      }

      if (error.response?.data) {
        errorData = error.response.data as ApiError
      }

      throw new ApiRequestError(
        errorData.message || `HTTP ${status}`,
        status,
        errorData.code,
        errorData.details
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
 * All methods automatically include JWT authentication via axiosInstance interceptors.
 */
export const apiClient = {
  /**
   * Create a new todo
   * POST /api/todos
   * @param todoData - Todo creation data
   * @returns Created todo object
   */
  async createTodo(todoData: TodoCreate): Promise<Todo> {
    const response = await axiosInstance.post<Todo>('/api/todos', todoData)
    return response.data
  },

  /**
   * Get todos with pagination and filters
   * GET /api/todos
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of todos
   */
  async getTodos(params: GetTodosParams = {}): Promise<PaginatedResponse<Todo>> {
    const { page = 1, page_size = 20, search, status, priority, category } = params

    const queryParams: Record<string, string | number> = {
      page,
      page_size,
    }

    if (search) queryParams.search = search
    if (status) queryParams.status = status
    if (priority) queryParams.priority = priority
    if (category) queryParams.category = category

    const response = await axiosInstance.get<PaginatedResponse<Todo>>('/api/todos', {
      params: queryParams,
    })

    return response.data
  },

  /**
   * Get a specific todo by ID
   * GET /api/todos/{id}
   * @param todoId - Todo UUID
   * @returns Todo object
   */
  async getTodoById(todoId: string): Promise<Todo> {
    const response = await axiosInstance.get<Todo>(`/api/todos/${todoId}`)
    return response.data
  },

  /**
   * Update a todo
   * PUT /api/todos/{id}
   * @param todoId - Todo UUID
   * @param todoData - Partial todo update data
   * @returns Updated todo object
   */
  async updateTodo(todoId: string, todoData: TodoUpdate): Promise<Todo> {
    const response = await axiosInstance.put<Todo>(`/api/todos/${todoId}`, todoData)
    return response.data
  },

  /**
   * Delete a todo
   * DELETE /api/todos/{id}
   * @param todoId - Todo UUID
   * @returns Delete confirmation response
   */
  async deleteTodo(todoId: string): Promise<{ message: string; id: string }> {
    const response = await axiosInstance.delete<{ message: string; id: string }>(
      `/api/todos/${todoId}`
    )
    return response.data
  },

  /**
   * Mark a todo as completed
   * PATCH /api/todos/{id}/complete
   * @param todoId - Todo UUID
   * @returns Updated todo object
   */
  async markTodoCompleted(todoId: string): Promise<Todo> {
    const response = await axiosInstance.patch<Todo>(`/api/todos/${todoId}/complete`)
    return response.data
  },
}

/**
 * Helper function to convert API error to user-friendly message
 *
 * Provides specific, actionable error messages based on status code and error type.
 * Messages use simple language and guide users toward resolution.
 *
 * @param error - ApiRequestError object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: ApiRequestError): string {
  // Handle by status code for more specific messages
  if (error.statusCode === 0) {
    // Network error - no connection or timeout
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }

  if (error.statusCode === 400) {
    // Validation error
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
    return 'Invalid request. Please check your input and try again.'
  }

  if (error.statusCode === 401) {
    // Authentication error
    return 'Your session has expired. Please sign in again.'
  }

  if (error.statusCode === 403) {
    // Authorization error
    return 'You don\'t have permission to perform this action.'
  }

  if (error.statusCode === 404) {
    // Not found error
    return 'The requested resource was not found. It may have been deleted.'
  }

  if (error.statusCode === 409) {
    // Conflict error - optimistic update conflict
    return 'This item was modified by another session. Please refresh and try again.'
  }

  if (error.statusCode === 429) {
    // Rate limiting error
    return 'You\'re making too many requests. Please wait a moment and try again.'
  }

  if (error.statusCode >= 500) {
    // Server error
    return 'Server error. Please try again later. If the problem persists, contact support.'
  }

  // Fallback to error code or message
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
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}
