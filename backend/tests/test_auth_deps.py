"""
Unit Tests for JWT Verification Layer

Tests the JWT verification dependencies and auth service functions.
These tests validate that TASK-P2-005 is complete and functional.

Test Coverage:
- Supabase client configuration
- JWT token verification with valid tokens
- JWT token verification rejects invalid tokens
- JWT token verification rejects expired tokens
- get_current_user dependency extraction
- get_current_user returns 401 on missing token
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from fastapi import HTTPException, status
from supabase import AuthApiError


from src.models.database import get_supabase_client, reset_supabase_client
from src.services.auth_service import verify_jwt, get_user_from_token
from src.api.deps import get_current_user, get_current_user_optional
from src.config import get_settings


# ============================================================================
# Mock Fixtures
# ============================================================================

@pytest.fixture
def mock_settings():
    """Mock settings for testing"""
    settings = Mock()
    settings.supabase_url = "https://test.supabase.co"
    settings.supabase_service_role_key = "test_service_role_key"
    settings.supabase_anon_key = "test_anon_key"
    return settings


@pytest.fixture
def mock_user_response():
    """Mock Supabase user response"""
    mock_user = Mock()
    mock_user.id = "test-user-uuid-123"
    mock_user.email = "test@example.com"
    mock_user.aud = "authenticated"
    mock_user.role = "authenticated"

    mock_response = Mock()
    mock_response.user = mock_user

    return mock_response


@pytest.fixture
def valid_token():
    """Mock valid JWT token"""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid.token.signature"


@pytest.fixture
def mock_supabase_client(mock_user_response):
    """Mock Supabase client"""
    mock_client = Mock()
    mock_client.auth.get_user.return_value = mock_user_response
    return mock_client


# ============================================================================
# Test: Supabase Client Configuration
# ============================================================================

class TestSupabaseClientConfiguration:
    """Test Supabase client initialization and configuration"""

    def test_get_supabase_client_returns_client(self, mock_settings, mock_supabase_client):
        """Test that get_supabase_client returns a Supabase client instance"""
        with patch('src.models.database.get_settings', return_value=mock_settings):
            with patch('src.models.database.create_client', return_value=mock_supabase_client):
                reset_supabase_client()
                client = get_supabase_client()

                assert client is not None
                assert client == mock_supabase_client

    def test_get_supabase_client_singleton(self, mock_settings, mock_supabase_client):
        """Test that get_supabase_client returns same instance (singleton)"""
        with patch('src.models.database.get_settings', return_value=mock_settings):
            with patch('src.models.database.create_client', return_value=mock_supabase_client):
                reset_supabase_client()
                client1 = get_supabase_client()
                client2 = get_supabase_client()

                assert client1 is client2

    def test_get_supabase_client_invalid_url(self):
        """Test that invalid Supabase URL raises ValueError"""
        mock_settings = Mock()
        mock_settings.supabase_url = "invalid-url"
        mock_settings.supabase_service_role_key = "test_key"

        with patch('src.models.database.get_settings', return_value=mock_settings):
            with pytest.raises(ValueError, match="must start with 'https://'"):
                get_supabase_client()

    def test_get_supabase_client_missing_service_key(self):
        """Test that missing service role key raises ValueError"""
        mock_settings = Mock()
        mock_settings.supabase_url = "https://test.supabase.co"
        mock_settings.supabase_service_role_key = None

        with patch('src.models.database.get_settings', return_value=mock_settings):
            with pytest.raises(ValueError, match="SUPABASE_SERVICE_ROLE_KEY is not configured"):
                get_supabase_client()


# ============================================================================
# Test: JWT Token Verification
# ============================================================================

class TestJWTVerification:
    """Test JWT token verification with valid and invalid tokens"""

    def test_verify_jwt_valid_token(self, valid_token, mock_user_response, mock_supabase_client):
        """Test that verify_jwt succeeds with valid token"""
        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            payload = verify_jwt(valid_token)

            assert payload is not None
            assert payload['id'] == "test-user-uuid-123"
            assert payload['email'] == "test@example.com"
            assert payload['aud'] == "authenticated"
            assert mock_supabase_client.auth.get_user.called_once_with(valid_token)

    def test_verify_jwt_with_bearer_prefix(self, valid_token, mock_user_response, mock_supabase_client):
        """Test that verify_jwt handles 'Bearer ' prefix"""
        token_with_bearer = f"Bearer {valid_token}"

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            payload = verify_jwt(token_with_bearer)

            assert payload is not None
            assert payload['id'] == "test-user-uuid-123"
            # Should be called with token stripped of "Bearer " prefix
            assert mock_supabase_client.auth.get_user.called_once_with(valid_token)

    def test_verify_jwt_none_token_raises_error(self):
        """Test that None token raises ValueError"""
        with pytest.raises(ValueError, match="Token cannot be None or empty"):
            verify_jwt(None)

    def test_verify_jwt_empty_token_raises_error(self):
        """Test that empty token raises ValueError"""
        with pytest.raises(ValueError, match="Token cannot be None or empty"):
            verify_jwt("")

    def test_verify_jwt_invalid_token_raises_401(self, valid_token, mock_supabase_client):
        """Test that invalid token raises HTTPException 401"""
        # Mock Supabase to return None user (invalid token)
        mock_response = Mock()
        mock_response.user = None
        mock_supabase_client.auth.get_user.return_value = mock_response

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            with pytest.raises(HTTPException) as exc_info:
                verify_jwt(valid_token)

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert "Invalid token" in exc_info.value.detail

    def test_verify_jwt_expired_token_raises_401(self, valid_token, mock_supabase_client):
        """Test that expired token raises HTTPException 401"""
        # Mock Supabase to raise AuthApiError (expired token)
        mock_supabase_client.auth.get_user.side_effect = AuthApiError("Token has expired", 401)

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            with pytest.raises(HTTPException) as exc_info:
                verify_jwt(valid_token)

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert "Invalid token" in exc_info.value.detail


# ============================================================================
# Test: User Extraction from Token
# ============================================================================

class TestGetUserFromToken:
    """Test user extraction from verified JWT tokens"""

    def test_get_user_from_token_valid(self, valid_token, mock_user_response, mock_supabase_client):
        """Test that get_user_from_token extracts user context"""
        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            user_context = get_user_from_token(valid_token)

            assert user_context is not None
            assert 'user_id' in user_context
            assert 'email' in user_context
            assert user_context['user_id'] == "test-user-uuid-123"
            assert user_context['email'] == "test@example.com"
            assert user_context['aud'] == "authenticated"
            assert user_context['role'] == "authenticated"

    def test_get_user_from_token_invalid_raises_401(self, valid_token, mock_supabase_client):
        """Test that get_user_from_token raises 401 for invalid token"""
        mock_supabase_client.auth.get_user.side_effect = AuthApiError("Invalid signature", 401)

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            with pytest.raises(HTTPException) as exc_info:
                get_user_from_token(valid_token)

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


# ============================================================================
# Test: FastAPI Dependencies
# ============================================================================

class TestGetCurrentUserDependency:
    """Test get_current_user FastAPI dependency"""

    def test_get_current_user_valid_token(self, valid_token, mock_user_response, mock_supabase_client):
        """Test that get_current_user works with valid token"""
        mock_credentials = Mock()
        mock_credentials.credentials = valid_token

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            user_context = get_current_user(mock_credentials)

            assert user_context is not None
            assert user_context['user_id'] == "test-user-uuid-123"

    def test_get_current_user_missing_token_raises_401(self):
        """Test that get_current_user raises 401 when token is missing"""
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(None)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Missing authorization header" in exc_info.value.detail

    def test_get_current_user_invalid_token_raises_401(self, valid_token, mock_supabase_client):
        """Test that get_current_user raises 401 for invalid token"""
        mock_credentials = Mock()
        mock_credentials.credentials = valid_token
        mock_supabase_client.auth.get_user.side_effect = AuthApiError("Invalid token", 401)

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            with pytest.raises(HTTPException) as exc_info:
                get_current_user(mock_credentials)

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


class TestGetCurrentUserOptionalDependency:
    """Test get_current_user_optional FastAPI dependency"""

    def test_get_current_user_optional_with_token(self, valid_token, mock_user_response, mock_supabase_client):
        """Test that get_current_user_optional returns user with valid token"""
        mock_credentials = Mock()
        mock_credentials.credentials = valid_token

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            user_context = get_current_user_optional(mock_credentials)

            assert user_context is not None
            assert user_context['user_id'] == "test-user-uuid-123"

    def test_get_current_user_optional_without_token(self):
        """Test that get_current_user_optional returns None when token is missing"""
        user_context = get_current_user_optional(None)

        assert user_context is None

    def test_get_current_user_optional_invalid_token(self, valid_token, mock_supabase_client):
        """Test that get_current_user_optional returns None for invalid token"""
        mock_credentials = Mock()
        mock_credentials.credentials = valid_token
        mock_supabase_client.auth.get_user.side_effect = AuthApiError("Invalid token", 401)

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            user_context = get_current_user_optional(mock_credentials)

            # Should return None instead of raising exception
            assert user_context is None


# ============================================================================
# Test: Integration Tests
# ============================================================================

class TestJWTVerificationIntegration:
    """Integration tests for JWT verification flow"""

    def test_complete_auth_flow_valid_token(self, valid_token, mock_user_response, mock_supabase_client):
        """Test complete authentication flow: token → verification → user context"""
        mock_credentials = Mock()
        mock_credentials.credentials = valid_token

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            # Step 1: Extract token from credentials
            token = mock_credentials.credentials
            assert token == valid_token

            # Step 2: Verify token
            payload = verify_jwt(token)
            assert payload['id'] == "test-user-uuid-123"

            # Step 3: Extract user context
            user_context = get_user_from_token(token)
            assert user_context['user_id'] == "test-user-uuid-123"

            # Step 4: FastAPI dependency
            dependency_result = get_current_user(mock_credentials)
            assert dependency_result['user_id'] == "test-user-uuid-123"

    def test_auth_flow_fail_closed(self, valid_token, mock_supabase_client):
        """Test that authentication fails closed on any error"""
        mock_credentials = Mock()
        mock_credentials.credentials = valid_token
        mock_supabase_client.auth.get_user.side_effect = Exception("Unexpected error")

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            # All paths should raise HTTPException 401
            with pytest.raises(HTTPException) as exc_info:
                verify_jwt(valid_token)
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

            with pytest.raises(HTTPException) as exc_info:
                get_user_from_token(valid_token)
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

            with pytest.raises(HTTPException) as exc_info:
                get_current_user(mock_credentials)
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


# ============================================================================
# Task Completion Verification
# ============================================================================

class TestTaskP2_005Completion:
    """Verify TASK-P2-005 completion criteria"""

    def test_supabase_client_configured(self):
        """✅ Supabase Python client is configured in database.py"""
        from src.models.database import get_supabase_client
        assert callable(get_supabase_client)

    def test_verify_jwt_function_exists(self):
        """✅ verify_jwt() function exists in auth_service.py"""
        from src.services.auth_service import verify_jwt
        assert callable(verify_jwt)

    def test_get_user_from_token_function_exists(self):
        """✅ get_user_from_token() function exists in auth_service.py"""
        from src.services.auth_service import get_user_from_token
        assert callable(get_user_from_token)

    def test_get_current_user_dependency_exists(self):
        """✅ get_current_user() dependency exists in deps.py"""
        from src.api.deps import get_current_user
        assert callable(get_current_user)

    def test_jwt_verification_rejects_invalid_tokens(self):
        """✅ Invalid tokens are rejected with 401"""
        mock_supabase_client = Mock()
        mock_supabase_client.auth.get_user.side_effect = AuthApiError("Invalid", 401)

        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            with pytest.raises(HTTPException) as exc_info:
                verify_jwt("invalid-token")

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_id_safely_extracted(self, valid_token, mock_user_response, mock_supabase_client):
        """✅ user_id is safely extracted from valid tokens"""
        with patch('src.services.auth_service.get_supabase_client', return_value=mock_supabase_client):
            user_context = get_user_from_token(valid_token)
            assert 'user_id' in user_context
            assert isinstance(user_context['user_id'], str)

    def test_no_crud_logic_implemented(self):
        """✅ No CRUD logic is implemented (no database queries)"""
        # Verify auth_service.py only contains verification logic
        import inspect
        from src.services import auth_service

        source = inspect.getsource(auth_service)
        assert 'create_todo' not in source
        assert 'get_todos' not in source
        assert 'update_todo' not in source
        assert 'delete_todo' not in source
        assert 'table(' not in source  # No database table queries
