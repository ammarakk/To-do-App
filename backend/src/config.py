"""
Environment Configuration Module for Todo Backend

This module loads and validates all environment variables required for
the FastAPI application to connect to Neon PostgreSQL.

Security Rules:
- NEVER commit .env file to version control
- Database URL contains sensitive credentials
- JWT secret must be cryptographically secure
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

    # Database Configuration (Neon PostgreSQL)
    database_url: str = Field(
        ...,
        description="Neon PostgreSQL connection URL (postgresql://...)"
    )

    # JWT Configuration
    jwt_secret_key: str = Field(
        ...,
        description="Secret key for JWT token signing (must be cryptographically secure)"
    )
    jwt_algorithm: str = Field(
        default="HS256",
        description="Algorithm for JWT token signing"
    )
    access_token_expire_minutes: int = Field(
        default=15,
        description="Access token expiration time in minutes"
    )
    refresh_token_expire_days: int = Field(
        default=7,
        description="Refresh token expiration time in days"
    )

    # CORS Configuration
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="Comma-separated list of allowed CORS origins"
    )

    # Application Metadata
    app_name: str = "Todo API"
    app_version: str = "2.0.0"
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

    @validator("database_url")
    def validate_database_url(cls, v):
        """Validate Neon database URL format."""
        if not v.startswith("postgresql://") and not v.startswith("postgres://"):
            raise ValueError(
                f"database_url must start with 'postgresql://' or 'postgres://', got: {v[:20]}..."
            )
        return v

    @validator("jwt_secret_key")
    def validate_jwt_secret(cls, v):
        """Validate JWT secret key is sufficiently long."""
        if len(v) < 32:
            raise ValueError(
                f"jwt_secret_key must be at least 32 characters for security, got {len(v)} characters"
            )
        return v

    @validator("debug_mode", pre=True, always=True)
    def set_debug_mode(cls, v, values):
        """Automatically set debug mode based on environment."""
        if "environment" in values:
            return values["environment"] == "development"
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
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
        >>> print(settings.database_url)
        'postgresql://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require'
    """
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


# ============================================================================
# SECURITY DOCUMENTATION
# ============================================================================

"""
SECURITY RULES FOR NEON POSTGRESQL & JWT
=========================================

1. DATABASE URL
   - Purpose: Connection string to Neon PostgreSQL
   - Contains: Username, password, host, port, database name
   - Security: MUST NEVER be exposed in frontend or committed to git
   - Format: postgresql://user:password@host:port/database?sslmode=require

2. JWT SECRET KEY
   - Purpose: Cryptographic key for signing JWT tokens
   - Requirements: At least 32 characters, cryptographically random
   - Security: MUST NEVER be exposed to frontend or committed to git
   - Generation: Use `openssl rand -hex 32` or similar

3. ACCESS TOKEN (15 minutes)
   - Purpose: Short-lived token for API authentication
   - Storage: HTTP-only cookies or secure localStorage
   - Contains: user_id, email, role, exp
   - Security: Validated on every protected route

4. REFRESH TOKEN (7 days)
   - Purpose: Long-lived token for getting new access tokens
   - Storage: HTTP-only cookies or secure database
   - Contains: user_id, token_id, exp
   - Security: Stored in database, revocable

DATABASE SECURITY
=================

1. SSL Mode
   - Always use `?sslmode=require` in database URL
   - Neon enforces SSL by default
   - Never disable SSL for production

2. Connection Pooling
   - SQLAlchemy manages connection pooling
   - Pool size should match your concurrent load
   - Use `pool_pre_ping=True` for health checks

3. Row Level Security (Future)
   - Can be enabled in PostgreSQL for additional security
   - Use application-level filtering for now
   - User isolation enforced in service layer

JWT TOKEN VALIDATION FLOW
===========================

1. Frontend sends request with Authorization header:
   Authorization: Bearer <access_token>

2. Backend extracts token from header

3. Backend validates token using:
   - Verify signature using jwt_secret_key
   - Check expiration time (exp claim)
   - Verify issuer (iss claim) if set

4. If valid, extract user_id from token

5. Use user_id to:
   - Filter database queries (enforce user isolation)
   - Load user-specific data
   - Enforce authorization rules

TOKEN REFRESH FLOW
==================

1. Access token expires (after 15 minutes)

2. Frontend sends refresh request:
   POST /api/v1/auth/refresh
   Body: { "refresh_token": "<refresh_token>" }

3. Backend validates refresh token:
   - Check token exists in database
   - Verify not revoked
   - Check not expired

4. If valid, generate new tokens:
   - New access_token (15 min)
   - New refresh_token (7 days)
   - Rotate old refresh token (invalidate old one)

5. Return new tokens to frontend

KEY HANDLING RULES
===================

1. Environment Variables Only
   - NEVER hardcode secrets in source code
   - ALWAYS load from environment variables or .env file
   - Use python-dotenv for .env loading

2. Git Safety
   - .env file MUST be in .gitignore
   - .env.example file SHOULD be committed (with placeholder values)
   - Verify: `git status` should never show .env file

3. Production Environment
   - Use platform-specific secret management:
     * Vercel: Environment Variables dashboard
     * Railway: Config vars
     * AWS: Secrets Manager
     * Neon: Supports connection pooling
   - Rotate secrets if accidentally exposed

4. Local Development
   - Create .env file from .env.example
   - Generate strong JWT secret with: `openssl rand -hex 32`
   - Get Neon database URL from Neon console
   - Never share .env file via screenshots or chat

SECURITY CHECKLIST
===================

Before deploying:
- [ ] .env is in .gitignore
- [ ] No secrets in source code (grep for passwords, keys)
- [ ] .env.example has placeholder values only
- [ ] JWT secret is at least 32 characters
- [ ] Database URL uses sslmode=require
- [ ] CORS origins restricted to real domains
- [ ] Environment variables set in production platform
- [ ] Secrets rotated if accidentally exposed

NEON POSTGRESQL SETUP
======================

1. Create Neon Project
   - Go to https://neon.tech
   - Create new project
   - Select region closest to your users
   - Copy connection string

2. Connection String Format
   postgresql://username:password@ep-cool-name.aws.neon.tech/neondb?sslmode=require

3. Environment Variable
   DATABASE_URL=postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require

4. Connection Pooling (Optional)
   - Neon supports PgBouncer for connection pooling
   - Use for production to reduce connection overhead
   - Add ?pgbouncer=true to connection string if needed

FOR MORE INFORMATION
====================

Neon Docs: https://neon.tech/docs
SQLAlchemy Async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
JWT Best Practices: https://tools.ietf.org/html/rfc8725
"""
