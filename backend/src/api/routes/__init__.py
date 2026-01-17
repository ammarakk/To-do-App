"""
API Routes Module

This module organizes API route handlers by feature/domain.
All HTTP status code constants and route-level utilities are defined here.
"""

# ============================================================================
# HTTP Status Code Constants
# ============================================================================

# Success Codes
HTTP_200_OK = 200
HTTP_201_CREATED = 201
HTTP_204_NO_CONTENT = 204

# Redirect Codes
HTTP_304_NOT_MODIFIED = 304

# Client Error Codes
HTTP_400_BAD_REQUEST = 400
HTTP_401_UNAUTHORIZED = 401
HTTP_403_FORBIDDEN = 403
HTTP_404_NOT_FOUND = 404
HTTP_409_CONFLICT = 409
HTTP_422_UNPROCESSABLE_ENTITY = 422
HTTP_429_TOO_MANY_REQUESTS = 429

# Server Error Codes
HTTP_500_INTERNAL_SERVER_ERROR = 500
HTTP_502_BAD_GATEWAY = 502
HTTP_503_SERVICE_UNAVAILABLE = 503


# ============================================================================
# Error Code Constants
# ============================================================================

# Validation errors
ERR_VALIDATION_FAILED = "VALIDATION_ERROR"
ERR_INVALID_INPUT = "INVALID_INPUT"
ERR_MISSING_FIELD = "MISSING_FIELD"
ERR_INVALID_FORMAT = "INVALID_FORMAT"

# Authentication errors
ERR_UNAUTHORIZED = "UNAUTHORIZED"
ERR_INVALID_TOKEN = "INVALID_TOKEN"
ERR_TOKEN_EXPIRED = "TOKEN_EXPIRED"
ERR_MISSING_TOKEN = "MISSING_TOKEN"

# Authorization errors
ERR_FORBIDDEN = "FORBIDDEN"
ERR_INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"

# Resource errors
ERR_NOT_FOUND = "NOT_FOUND"
ERR_ALREADY_EXISTS = "ALREADY_EXISTS"
ERR_CONFLICT = "CONFLICT"

# Server errors
ERR_INTERNAL_ERROR = "INTERNAL_ERROR"
ERR_DATABASE_ERROR = "DATABASE_ERROR"
ERR_EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"


# ============================================================================
# Error Message Templates
# ============================================================================

MSG_UNAUTHORIZED = "Authentication required"
MSG_INVALID_TOKEN = "Invalid or expired authentication token"
MSG_FORBIDDEN = "You do not have permission to access this resource"
MSG_NOT_FOUND = "The requested resource was not found"
MSG_VALIDATION_ERROR = "Request validation failed"
MSG_INTERNAL_ERROR = "An unexpected error occurred"
