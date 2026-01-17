# Todo Backend

FastAPI backend for the Todo application.

## Project Structure

```
backend/
├── src/
│   ├── api/           # API route handlers
│   ├── models/        # Pydantic schemas for validation
│   ├── services/      # Business logic
│   └── main.py        # FastAPI app entry point
├── tests/             # Test files
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── pyproject.toml     # Project dependencies
```

## Setup

1. Install dependencies:
```bash
uv sync
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Run the server:
```bash
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

Run tests:
```bash
uv run pytest tests/ -v
```

## Health Check

```bash
curl http://localhost:8000/health
```

## Architecture Notes

This is a skeleton setup with:
- Clean separation of concerns (api/, models/, services/)
- FastAPI with basic error handling
- Health check endpoint
- Test infrastructure with pytest
- No database or authentication logic yet (as per TASK-P2-001)
