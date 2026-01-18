# Todo App - Full Stack Application

A professional full-stack todo application with authentication, built with Next.js (frontend) and FastAPI (backend).

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI**: Tailwind CSS with custom components
- **State Management**: React hooks
- **Authentication**: JWT with HTTP-only cookies

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **Database**: PostgreSQL (Neon)
- **ORM**: SQLAlchemy (async)
- **Authentication**: JWT tokens (access + refresh)
- **Migrations**: Alembic

## ✨ Features

### Authentication
- ✅ User signup with email/password
- ✅ Secure login with JWT
- ✅ Automatic token refresh
- ✅ Password hashing with bcrypt
- ✅ Session management

### Todo Management
- ✅ Create, read, update, delete todos
- ✅ Mark todos as completed
- ✅ Priority levels (low, medium, high)
- ✅ Categories for organization
- ✅ Due dates
- ✅ Search functionality
- ✅ Filtering by status, priority, category
- ✅ Pagination for large lists

### UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark theme (Neon aesthetic)
- ✅ Loading states with skeletons
- ✅ Empty states
- ✅ Error handling with retry
- ✅ Optimistic updates
- ✅ Toast notifications

## 📁 Project Structure

```
to-do-app/
├── backend/                # FastAPI backend
│   ├── src/
│   │   ├── api/           # API routes
│   │   ├── models/        # Database models & schemas
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities (JWT, etc)
│   │   ├── config.py      # Configuration
│   │   └── main.py        # Application entry
│   ├── alembic_migrations/# Database migrations
│   ├── Dockerfile         # Container image
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment template
│
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities & API client
│   │   └── styles/       # CSS styles
│   ├── package.json      # Node dependencies
│   ├── tailwind.config.ts
│   └── vercel.json       # Vercel deployment
│
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL database (Neon recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/ammarakk/To-do-App.git
cd To-do-App
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your values:
# DATABASE_URL=postgresql+asyncpg://user:pass@host/db
# JWT_SECRET_KEY=your-secret-key-min-32-chars
# ENVIRONMENT=development
# CORS_ORIGINS=http://localhost:3000

# Run database migrations
alembic upgrade head

# Start backend
uvicorn src.main:app --reload
```

Backend will run on: http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend will run on: http://localhost:3000

## 🔐 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql+asyncpg://user:password@host/database?sslmode=require
JWT_SECRET_KEY=your-cryptographically-secure-key-min-32-chars
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📦 Deployment

### Backend Deployment Options

#### Option 1: Railway.app (Recommended)
```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway add postgresql
railway up
```

#### Option 2: Render.com
- Create account at render.com
- Connect GitHub repository
- Add PostgreSQL database
- Deploy as Web Service

#### Option 3: Docker
```bash
cd backend
docker build -t todo-backend .
docker run -p 8000:8000 --env-file .env todo-backend
```

### Frontend Deployment

#### Vercel (Recommended)
```bash
cd frontend
npm install -g vercel
vercel
```

Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📚 API Documentation

Once backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Main Endpoints

#### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

#### Todos
- `GET /api/todos` - Get all todos (paginated, filtered)
- `POST /api/todos` - Create new todo
- `GET /api/todos/{id}` - Get specific todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo
- `PATCH /api/todos/{id}/complete` - Mark as completed

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication with access/refresh tokens
- ✅ Automatic token refresh
- ✅ User data isolation (user_id filtering)
- ✅ CORS protection
- ✅ SQL injection prevention (ORM)
- ✅ Input validation (Pydantic)
- ✅ HTTP-only cookies for tokens

## 🐛 Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify JWT_SECRET_KEY is set
- Ensure PostgreSQL is accessible
- Check port 8000 is available

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend is running
- Ensure CORS_ORIGINS includes frontend URL

### Database connection errors
- Verify DATABASE_URL format
- Check SSL is enabled (`sslmode=require`)
- Ensure database is accessible from your network

## 📝 Development Guidelines

### Code Style
- Python: PEP 8
- TypeScript: ESLint + Prettier
- Commit messages: Conventional Commits

### Branching Strategy
- `main` - Production-ready code (Phase 1 + Phase 2 complete)
- Feature branches - For new features

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Spec-Driven Development**
