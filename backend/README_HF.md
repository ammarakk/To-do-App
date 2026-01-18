---
title: Todo API Backend
emoji: ⚡
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Todo API Backend

FastAPI backend with custom JWT authentication and Neon PostgreSQL.

## 🚀 Features

- ✅ **Custom JWT Authentication** (Access + Refresh tokens)
- ✅ **Neon PostgreSQL** Database (Async SQLAlchemy)
- ✅ **User Registration & Login**
- ✅ **Todo CRUD Operations**
- ✅ **User Data Isolation**
- ✅ **API Documentation** (Swagger UI)

## 🔗 Live API

**Base URL:** Replace with your Hugging Face Space URL

```
https://your-username-todo-api.hf.space
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Todos
- `GET /api/todos` - List todos (paginated)
- `POST /api/todos` - Create todo
- `GET /api/todos/{id}` - Get single todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Soft delete todo
- `PATCH /api/todos/{id}/complete` - Mark completed

### System
- `GET /health` - Health check

## 🧪 Testing

**Test Signup:**
```bash
curl -X POST https://your-space.hf.space/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123","full_name":"Test User"}'
```

## ⚙️ Environment Variables

Set these in Hugging Face Space Settings → Variables:

```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
JWT_SECRET_KEY=your-secret-key-min-32-chars
BETTER_AUTH_SECRET=your-secret-key
ENVIRONMENT=production
CORS_ORIGINS=https://your-frontend.vercel.app
```

## 📖 Documentation

- **API Docs:** [Swagger UI](/docs)
- **ReDoc:** [Alternative Docs](/redoc)
- **GitHub:** [Repository](https://github.com/yourusername/to-do-app)

## 🛠️ Tech Stack

- **Framework:** FastAPI 2.0
- **Database:** Neon PostgreSQL
- **ORM:** SQLAlchemy 2.0 (Async)
- **Auth:** Custom JWT (python-jose)
- **Python:** 3.11

---

**Made with ❤️ using Spec-Driven Development**
