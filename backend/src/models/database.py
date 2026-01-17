"""
Supabase Database Configuration Module

This module configures and provides access to the Supabase Python client.
It uses the service role key for backend operations that require elevated privileges.

Security Rules:
- SERVICE_ROLE_KEY is for backend use ONLY (bypasses RLS)
- Never expose this client or its configuration to frontend
- Use this client for JWT verification and privileged database operations
"""

from supabase import create_client, Client
from typing import Optional

from src.config import get_settings


# Global Supabase client instance (lazy-loaded)
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Get the global Supabase client instance (singleton pattern).

    Creates the client on first call using service role key for backend operations.
    This client bypasses Row Level Security (RLS) policies - use with extreme caution.

    Returns:
        Client: Authenticated Supabase client with service role privileges

    Raises:
        ValueError: If Supabase configuration is invalid

    Example:
        >>> client = get_supabase_client()
        >>> response = client.table('todos').select('*').execute()
    """
    global _supabase_client

    if _supabase_client is None:
        settings = get_settings()

        # Validate configuration
        if not settings.supabase_url or not settings.supabase_url.startswith("https://"):
            raise ValueError(
                f"Invalid SUPABASE_URL: must start with 'https://', got: {settings.supabase_url}"
            )

        if not settings.supabase_service_role_key:
            raise ValueError(
                "SUPABASE_SERVICE_ROLE_KEY is not configured. "
                "Please set it in your .env file."
            )

        # Create Supabase client with service role key
        _supabase_client = create_client(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_service_role_key
        )

    return _supabase_client


def reset_supabase_client():
    """
    Reset the global Supabase client instance.

    This is primarily used for testing purposes to force re-initialization
    with different configuration. Not recommended for production use.

    Example:
        >>> reset_supabase_client()
        >>> client = get_supabase_client()  # Creates new instance
    """
    global _supabase_client
    _supabase_client = None


# ============================================================================
# SECURITY DOCUMENTATION
# ============================================================================

"""
SUPABASE CLIENT SECURITY RULES
===============================

1. SERVICE ROLE KEY PRIVILEGES
   - The client returned by get_supabase_client() has service role privileges
   - It bypasses Row Level Security (RLS) policies
   - It can read/write ANY data in the database
   - Use ONLY for operations that require cross-user access or JWT verification

2. WHEN TO USE THIS CLIENT
   - JWT token verification (auth_service.py)
   - Admin operations that need to access all users' data
   - Background jobs that run with elevated privileges
   - Data migration scripts

3. WHEN NOT TO USE THIS CLIENT
   - Regular user CRUD operations (use user's JWT context instead)
   - Frontend-facing API endpoints that should enforce RLS
   - Any operation where user isolation is required

4. DEFENSE IN DEPTH
   - Even though this client bypasses RLS, always filter by user_id in application logic
   - Never assume RLS will protect your data
   - Implement user isolation at both application AND database layers
   - Log all privileged operations for audit trails

5. PRODUCTION SECURITY
   - Ensure SUPABASE_SERVICE_ROLE_KEY is set from environment variables
   - Never commit .env file to version control
   - Rotate service role key if accidentally exposed
   - Monitor database access logs for suspicious activity

EXAMPLE USAGE PATTERNS
======================

✅ CORRECT: JWT verification (backend-only operation)
    client = get_supabase_client()
    user = client.auth.get_user(token)

✅ CORRECT: Admin operations with explicit user filtering
    client = get_supabase_client()
    todos = client.table('todos').select('*').eq('user_id', user_id).execute()

❌ WRONG: Using without user_id filtering in user-facing endpoint
    client = get_supabase_client()
    todos = client.table('todos').select('*').execute()  # Returns ALL users' todos!

❌ WRONG: Exposing client to frontend
    # Never return the client instance in API responses
    # Never include client configuration in frontend builds

For more information:
- Supabase Python Client: https://supabase.com/docs/reference/python
- RLS Policies: https://supabase.com/docs/guides/auth/row-level-security
"""
