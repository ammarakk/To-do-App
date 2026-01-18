"""
JWT Utilities

This module provides functions for creating and validating JWT tokens
for authentication and authorization.
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from src.config import get_settings


# Get settings
settings = get_settings()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hashed password.

    Args:
        plain_password: Plain text password from user input
        hashed_password: Bcrypt hashed password from database

    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        str: Bcrypt hashed password

    Security:
        - Uses bcrypt with cost factor 12 (automatic)
        - Password should be validated before hashing
    """
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Payload data to encode (typically user_id, email, role)
        expires_delta: Custom expiration time (optional, defaults to config)

    Returns:
        str: Encoded JWT access token

    Example:
        token = create_access_token(
            data={"sub": user_id, "email": email, "role": "user"}
        )
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })

    # Encode token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )

    return encoded_jwt


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT refresh token.

    Args:
        data: Payload data to encode (typically user_id, token_id)
        expires_delta: Custom expiration time (optional, defaults to 7 days)

    Returns:
        str: Encoded JWT refresh token

    Example:
        token = create_refresh_token(
            data={"sub": user_id, "token_id": str(uuid4())}
        )
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })

    # Encode token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )

    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.

    Args:
        token: JWT token to decode

    Returns:
        dict: Decoded token payload

    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError as e:
        raise JWTError(f"Invalid token: {str(e)}")


def verify_access_token(token: str) -> Dict[str, Any]:
    """
    Verify an access token and return the payload.

    Args:
        token: JWT access token

    Returns:
        dict: Token payload with user data

    Raises:
        JWTError: If token is invalid, expired, or not an access token
    """
    payload = decode_token(token)

    # Verify it's an access token
    if payload.get("type") != "access":
        raise JWTError("Invalid token type: expected 'access'")

    return payload


def verify_refresh_token(token: str) -> Dict[str, Any]:
    """
    Verify a refresh token and return the payload.

    Args:
        token: JWT refresh token

    Returns:
        dict: Token payload with user data

    Raises:
        JWTError: If token is invalid, expired, or not a refresh token
    """
    payload = decode_token(token)

    # Verify it's a refresh token
    if payload.get("type") != "refresh":
        raise JWTError("Invalid token type: expected 'refresh'")

    return payload


def get_token_expiry(token: str) -> Optional[datetime]:
    """
    Get the expiration datetime from a token without full validation.

    Args:
        token: JWT token

    Returns:
        datetime: Token expiration time, or None if invalid

    Note:
        This does NOT verify the signature, only decodes the payload.
        Use verify_access_token() or verify_refresh_token() for validation.
    """
    try:
        payload = jwt.get_unverified_claims(token)
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            return datetime.utcfromtimestamp(exp_timestamp)
        return None
    except Exception:
        return None
