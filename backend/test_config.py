#!/usr/bin/env python3
"""
Test script to validate configuration module without requiring real Supabase credentials.
This validates that the config module can load environment variables and parse them correctly.
"""

import sys
import os
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Set test environment variables before importing config
os.environ["ENVIRONMENT"] = "development"
os.environ["API_PORT"] = "8000"
os.environ["API_HOST"] = "0.0.0.0"
os.environ["CORS_ORIGINS"] = "http://localhost:3000,http://localhost:5173,https://example.com"

# Mock Supabase values (for validation testing only)
os.environ["SUPABASE_URL"] = "https://test-project.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "test-anon-key-placeholder"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "test-service-role-key-placeholder"

# Now import config
from src.config import Settings, get_settings

def test_config_validation():
    """Test that configuration validates correctly."""
    print("=" * 70)
    print("CONFIG MODULE VALIDATION TEST")
    print("=" * 70)
    print()

    # Test 1: Create Settings instance
    print("Test 1: Creating Settings instance...")
    try:
        settings = Settings()
        print("[PASS] Settings instance created successfully")
    except Exception as e:
        print(f"[FAIL] Could not create Settings instance: {e}")
        return False

    print()

    # Test 2: Verify API configuration
    print("Test 2: Verifying API configuration...")
    assert settings.environment == "development", "Environment should be 'development'"
    assert settings.api_port == 8000, "API port should be 8000"
    assert settings.api_host == "0.0.0.0", "API host should be '0.0.0.0'"
    print("[PASS] API configuration loaded correctly")
    print(f"  - Environment: {settings.environment}")
    print(f"  - API Host: {settings.api_host}")
    print(f"  - API Port: {settings.api_port}")

    print()

    # Test 3: Verify Supabase configuration
    print("Test 3: Verifying Supabase configuration...")
    assert settings.supabase_url == "https://test-project.supabase.co"
    assert settings.supabase_anon_key == "test-anon-key-placeholder"
    assert settings.supabase_service_role_key == "test-service-role-key-placeholder"
    print("[PASS] Supabase configuration loaded correctly")
    print(f"  - Supabase URL: {settings.supabase_url}")
    print(f"  - Anon Key: {settings.supabase_anon_key[:20]}...")
    print(f"  - Service Role Key: {settings.supabase_service_role_key[:20]}...")

    print()

    # Test 4: Verify CORS origins parsing
    print("Test 4: Verifying CORS origins parsing...")
    assert isinstance(settings.cors_origins, str), "cors_origins should be a string"
    assert isinstance(settings.cors_origins_list, list), "cors_origins_list should be a list"
    assert len(settings.cors_origins_list) == 3, "Should have 3 CORS origins"
    assert "http://localhost:3000" in settings.cors_origins_list
    assert "http://localhost:5173" in settings.cors_origins_list
    assert "https://example.com" in settings.cors_origins_list
    print("[PASS] CORS origins parsed correctly")
    print(f"  - Raw CORS origins: {settings.cors_origins}")
    print(f"  - Parsed CORS origins: {settings.cors_origins_list}")

    print()

    # Test 5: Verify debug mode is set automatically
    print("Test 5: Verifying debug mode auto-configuration...")
    assert settings.debug_mode == True, "Debug mode should be True in development"
    print("[PASS] Debug mode configured correctly")
    print(f"  - Debug Mode: {settings.debug_mode}")

    print()

    # Test 6: Verify singleton pattern
    print("Test 6: Verifying singleton pattern...")
    settings1 = get_settings()
    settings2 = get_settings()
    assert settings1 is settings2, "get_settings() should return the same instance"
    print("[PASS] Singleton pattern working correctly")

    print()

    # Test 7: Verify Supabase URL validation
    print("Test 7: Verifying Supabase URL validation...")
    try:
        bad_settings = Settings(
            environment="development",
            supabase_url="invalid-url",  # Missing https://
            supabase_anon_key="test",
            supabase_service_role_key="test"
        )
        print("[FAIL] Should have raised validation error for invalid URL")
        return False
    except Exception as e:
        print("[PASS] Supabase URL validation working correctly")
        print(f"  - Expected error caught: {type(e).__name__}")

    print()

    # Test 8: Verify environment validation
    print("Test 8: Verifying environment validation...")
    try:
        bad_settings = Settings(
            environment="invalid-env",  # Not in allowed list
            supabase_url="https://test.supabase.co",
            supabase_anon_key="test",
            supabase_service_role_key="test"
        )
        print("[FAIL] Should have raised validation error for invalid environment")
        return False
    except Exception as e:
        print("[PASS] Environment validation working correctly")
        print(f"  - Expected error caught: {type(e).__name__}")

    print()
    print("=" * 70)
    print("ALL TESTS PASSED")
    print("=" * 70)
    print()
    print("Configuration module is ready for use!")
    print()
    print("NEXT STEPS:")
    print("1. Create a Supabase project at https://supabase.com")
    print("2. Copy your credentials to backend/.env file")
    print("3. Reference: backend/SUPABASE_SETUP.md for detailed instructions")
    print()

    return True

if __name__ == "__main__":
    success = test_config_validation()
    sys.exit(0 if success else 1)
