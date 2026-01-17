"""
FastAPI Application Entry Point

This is the main application file for the Todo backend.
Initializes the FastAPI app with routes, CORS, and exception handlers.
"""

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from src.config import get_settings
from src.api.routes import todos, auth


# Create FastAPI application instance
app = FastAPI(
    title="Todo API",
    description="Backend API for Todo application with JWT authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Get settings
settings = get_settings()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # List of allowed origins
    allow_credentials=True,  # Allow cookies/auth headers
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Include routers
app.include_router(todos.router)
app.include_router(auth.router)


@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint with basic API information.

    Returns:
        dict: API status and version information
    """
    return {
        "status": "ok",
        "version": "1.0.0",
        "message": "Todo API is running",
        "docs": "/docs"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint to verify API is running.

    Returns:
        dict: Status information
    """
    return {
        "status": "healthy",
        "service": "todo-api",
        "version": "1.0.0"
    }


# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(status.HTTP_401_UNAUTHORIZED)
async def unauthorized_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle 401 Unauthorized errors.

    Args:
        request: The incoming request
        exc: The HTTPException that was raised

    Returns:
        JSONResponse: Standardized error response with 401 status
    """
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "code": "UNAUTHORIZED",
            "message": exc.detail or "Authentication required",
            "details": []
        }
    )


@app.exception_handler(status.HTTP_403_FORBIDDEN)
async def forbidden_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle 403 Forbidden errors.

    Args:
        request: The incoming request
        exc: The HTTPException that was raised

    Returns:
        JSONResponse: Standardized error response with 403 status
    """
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "code": "FORBIDDEN",
            "message": exc.detail or "Access denied",
            "details": []
        }
    )


@app.exception_handler(status.HTTP_404_NOT_FOUND)
async def not_found_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle 404 Not Found errors.

    Args:
        request: The incoming request
        exc: The HTTPException that was raised

    Returns:
        JSONResponse: Standardized error response with 404 status
    """
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "code": "NOT_FOUND",
            "message": exc.detail or "Resource not found",
            "details": []
        }
    )


@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors (422 Unprocessable Entity).

    Args:
        request: The incoming request
        exc: The ValidationError that was raised

    Returns:
        JSONResponse: Standardized error response with 422 status
    """
    # Extract validation errors
    details = []
    for error in exc.errors():
        details.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"]
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "code": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "details": details
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for unhandled errors (500 Internal Server Error).

    Args:
        request: The incoming request
        exc: The exception that was raised

    Returns:
        JSONResponse: Standardized error response with 500 status
    """
    # Log the error (in production, use proper logging)
    # For security, don't expose internal error details to client
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred. Please try again later.",
            "details": []
        }
    )


if __name__ == "__main__":
    import uvicorn

    # Run the application with uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
