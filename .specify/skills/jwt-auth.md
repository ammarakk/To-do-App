# JWT Auth Skill

**Skill Type**: Authentication & Authorization
**Reusability**: Phase II-N, Phase III, all future phases

## Purpose

Implement secure JWT-based authentication with access and refresh tokens, following OWASP best practices.

## Capabilities

1. **Token Generation**
   - Create access tokens with short expiry (15 minutes)
   - Create refresh tokens with long expiry (7 days)
   - Use HS256 algorithm with strong secret key
   - Include user_id, email, exp, iat, type in payload

2. **Token Validation**
   - Verify JWT signature and expiry
   - Extract user_id from token payload
   - Handle token expiry gracefully
   - Return 401 Unauthorized for invalid tokens

3. **Password Security**
   - Hash passwords with bcrypt (cost factor 12)
   - Verify passwords against hashed stored values
   - Enforce password strength requirements
   - Never store plaintext passwords

4. **Token Refresh Flow**
   - Validate refresh token from database
   - Check refresh token hasn't been revoked
   - Generate new access token
   - Optionally rotate refresh tokens

## Usage Pattern

```python
# Create access token
def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=15)
    payload = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=HS256)

# Validate token
def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[HS256])
        return payload.get("sub")
    except JWTError:
        return None
```

## Best Practices

- Always use short-lived access tokens (15 minutes)
- Always store refresh tokens in database (not localStorage)
- Always use httpOnly cookies for tokens (prevent XSS)
- Always validate tokens on every protected request
- Always return generic error messages (don't reveal if email or password is wrong)

## Security Considerations

- JWT secret must be at least 32 characters
- Tokens must be transmitted over HTTPS only
- Refresh tokens must be single-use (rotation)
- Failed login attempts should be rate-limited
- All auth events must be logged for audit

## Exit Criteria

JWT auth system working: tokens generated, validated, refreshed automatically, passwords hashed securely.
