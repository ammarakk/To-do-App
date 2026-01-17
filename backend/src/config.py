"""
Environment Configuration Module for Todo Backend

This module loads and validates all environment variables required for
the FastAPI application to connect to Supabase.

Security Rules:
- NEVER commit .env file to version control
- SERVICE_ROLE_KEY is for backend use ONLY (bypasses RLS, use with extreme caution)
- ANON_KEY is for frontend use (RLS enforced)
- All sensitive values must come from environment variables
"""

from typing import List
import os
from pydantic import Field, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All fields are required at runtime. Use .env file for local development.
    """

    # API Configuration
    api_host: str = Field(
        default="0.0.0.0",
        description="Host address for the FastAPI server"
    )
    api_port: int = Field(
        default=8000,
        description="Port number for the FastAPI server"
    )
    environment: str = Field(
        default="development",
        description="Environment name (development, staging, production)"
    )

    # Supabase Configuration
    supabase_url: str = Field(
        ...,
        description="Supabase project URL (e.g., https://xyzcompany.supabase.co)"
    )
    supabase_anon_key: str = Field(
        ...,
        description="Supabase anonymous/public key (for frontend use)"
    )
    supabase_service_role_key: str = Field(
        ...,
        description="Supabase service role key (BACKEND ONLY - bypasses RLS)"
    )

    # CORS Configuration
    # This is parsed from CORS_ORIGINS env var (comma-separated string)
    # Store as string internally to avoid pydantic-settings JSON parsing issues
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="Comma-separated list of allowed CORS origins"
    )

    # Application Metadata
    app_name: str = "Todo API"
    app_version: str = "1.0.0"
    debug_mode: bool = False

    @property
    def cors_origins_list(self) -> List[str]:
        """
        Parse cors_origins string into a list.

        Returns:
            List[str]: Parsed list of CORS origins
        """
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return self.cors_origins if isinstance(self.cors_origins, list) else []

    @validator("environment")
    def validate_environment(cls, v):
        """Validate that environment is one of the allowed values."""
        allowed = ["development", "staging", "production"]
        if v not in allowed:
            raise ValueError(f"environment must be one of {allowed}, got '{v}'")
        return v

    @validator("supabase_url")
    def validate_supabase_url(cls, v):
        """Validate Supabase URL format."""
        if not v.startswith("https://"):
            raise ValueError(
                f"supabase_url must start with 'https://', got: {v}"
            )
        if ".supabase.co" not in v and ".supabase.in" not in v:
            raise ValueError(
                f"supabase_url must be a valid Supabase domain (*.supabase.co or *.supabase.in)"
            )
        return v

    @validator("debug_mode", pre=True, always=True)
    def set_debug_mode(cls, v, values):
        """Automatically set debug mode based on environment."""
        if "environment" in values:
            return values["environment"] == "development"
        return v

    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
        case_sensitive = False,  # Allow env vars in any case
        extra = "ignore"  # Ignore extra env vars
    )


# Global settings instance (lazy-loaded)
_settings: Settings | None = None


def get_settings() -> Settings:
    """
    Get the global settings instance (singleton pattern).

    Creates the settings instance on first call and reuses it.

    Returns:
        Settings: Application settings loaded from environment

    Example:
        >>> settings = get_settings()
        >>> print(settings.supabase_url)
        'https://xyzcompany.supabase.co'
    """
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


# Export convenience function for direct imports
# Usage: from config import get_settings; settings = get_settings()
# NOTE: Don't auto-instantiate to avoid validation errors during import
# settings = get_settings()  # Removed: causes import-time validation

# ============================================================================
# SECURITY DOCUMENTATION
# ============================================================================

"""
SECURITY RULES FOR SUPABASE KEYS
=================================

1. ANON_KEY (Public/Anonymous Key)
   - Purpose: Used by frontend clients (Next.js app)
   - Capabilities: Can access data with Row Level Security (RLS) policies enforced
   - Where to use: Frontend only (browser/client-side code)
   - Security: Safe to expose in frontend builds
   - NEVER use in backend for admin operations

2. SERVICE_ROLE_KEY (Backend-Only Key)
   - Purpose: Used by backend (FastAPI) for privileged operations
   - Capabilities: Bypasses RLS policies (full database access)
   - Where to use: Backend server ONLY (never in frontend)
   - Security: MUST NEVER be exposed in frontend builds or committed to git
   - Use ONLY when you need to:
     * Validate JWT tokens
     * Perform cross-user operations (admin tasks)
     * Manage users programmatically

3. JWT SECRET (Supabase JWT Secret)
   - Purpose: Used to verify JWT signatures issued by Supabase Auth
   - Capabilities: Cryptographic key for token validation
   - Where to use: Backend only
   - Security: MUST NEVER be exposed to frontend
   - Usage: Verify access tokens from Authorization headers

KEY HANDLING RULES
==================

1. Environment Variables Only
   - NEVER hardcode keys in source code
   - ALWAYS load from environment variables or .env file
   - Use python-dotenv or similar for .env loading

2. Git Safety
   - .env file MUST be in .gitignore
   - .env.example file SHOULD be committed (with placeholder values)
   - Verify: `git status` should never show .env file

3. Frontend vs Backend
   - Frontend uses: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Backend uses: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
   - NEVER put service_role_key in frontend environment

4. Production Environment
   - Use platform-specific secret management:
     * Vercel: Environment Variables dashboard
     * Railway: Config vars
     * AWS: Secrets Manager
     * Docker: Docker secrets or env_file
   - Rotate keys if accidentally exposed

5. Local Development
   - Create .env file from .env.example
   - Fill in real values from Supabase dashboard
   - Never share .env file via screenshots or chat

JWT TOKEN VALIDATION FLOW
==========================

1. Frontend sends request with Authorization header:
   Authorization: Bearer <jwt_token>

2. Backend extracts token from header

3. Backend validates token using:
   - Option A: Supabase Python client (recommended)
     * Uses supabase_service_role_key to verify signature
     * Returns user metadata if valid
   - Option B: Manual JWT verification
     * Uses JWT_SECRET from Supabase dashboard
     * Verifies signature, expiration, issuer

4. If valid, extract user_id from token

5. Use user_id to:
   - Filter database queries (defense in depth)
   - Enforce user isolation in application logic
   - Pass to RLS policies via auth.uid()

SECURITY CHECKLIST
==================

Before deploying:
- [ ] .env is in .gitignore
- [ ] No keys in source code (grep for "eyJ", "service_role")
- [ ] .env.example has placeholder values only
- [ ] Service role key used in backend ONLY
- [ ] Anon key used in frontend ONLY
- [ ] CORS origins restricted to real domains
- [ ] Environment variables set in production platform
- [ ] Keys rotated if accidentally exposed

FOR MORE INFORMATION
====================

Supabase Docs: https://supabase.com/docs/guides/api
RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
JWT Verification: https://supabase.com/docs/guides/auth/server-side-rendering
"""
