"""
Basic tests for FastAPI application
"""

import pytest
from fastapi.testclient import TestClient

from src.main import app


@pytest.fixture
def client():
    """Create test client for FastAPI app"""
    return TestClient(app)


def test_health_check(client):
    """Test health check endpoint returns correct response"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "todo-api"
    assert "version" in data


def test_root_endpoint(client):
    """Test root endpoint returns welcome message"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Todo API is running"
    assert data["version"] == "0.1.0"
    assert data["docs"] == "/docs"


def test_docs_endpoint(client):
    """Test that OpenAPI docs are accessible"""
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_schema(client):
    """Test that OpenAPI schema is generated"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "Todo API"
    assert schema["info"]["version"] == "0.1.0"
