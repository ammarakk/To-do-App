# 📋 Evolution of Todo - Full-Stack Application

A modern, full-featured Todo application built with Next.js 15, FastAPI, and Supabase. This project represents a production-ready implementation following Spec-Driven Development principles.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### Core Functionality
- ✅ **Create, Read, Update, Delete** todos with ease
- 🔍 **Filter & Search** todos by status and keywords
- 🎨 **Modern UI/UX** with beautiful design and animations
- 📱 **Fully Responsive** - works seamlessly on mobile, tablet, and desktop
- ♿ **Accessible** - WCAG AA compliant with keyboard navigation

### Authentication & Security
- 🔐 **JWT Authentication** with secure token management
- 📧 **Email-based Signup/Login** with validation
- 🛡️ **Protected Routes** - authentication required for sensitive operations
- 🔒 **Supabase RLS** - Row Level Security for data isolation

### Advanced Features
- 🌙 **Dark Mode Support** - toggle between light and dark themes
- ⚡ **Real-time Updates** - instant UI feedback
- 🎯 **Form Validation** - comprehensive client and server-side validation
- 🔄 **Auto-save** - prevents data loss
- 📊 **API Documentation** - interactive Swagger UI

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.1.7 (React 19)
- **Styling:** Tailwind CSS 3.4.19
- **UI Components:** Custom components with class-variance-authority
- **Forms:** React Hook Form 7.71.1 + Zod 4.3.5
- **Icons:** Lucide React
- **Auth:** Supabase Auth Helpers for Next.js

### Backend
- **Framework:** FastAPI 0.115.0
- **Server:** Uvicorn with auto-reload
- **Validation:** Pydantic 2.10.0
- **Database:** Supabase (PostgreSQL)
- **CORS:** Configured for development and production

### Development
- **Language:** TypeScript 5
- **Package Manager:** npm (frontend), uv (backend)
- **Testing:** Jest, React Testing Library, Pytest
- **Code Quality:** ESLint, TypeScript strict mode

## 📁 Project Structure

```
to-do-app/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages and layouts
│   │   │   ├── (auth)/      # Authentication pages (login, signup)
│   │   │   └── (dashboard)/ # Protected pages (todos)
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── todos/       # Todo-related components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # Reusable UI components
│   │   ├── lib/             # Utility functions and API client
│   │   └── styles/          # Global styles and theme
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
│
├── backend/                  # FastAPI backend application
│   ├── src/
│   │   ├── api/             # API route handlers
│   │   │   ├── routes/      # Route definitions (auth, todos)
│   │   │   └── dependencies.py # FastAPI dependencies
│   │   ├── models/          # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── config.py        # Configuration management
│   │   └── main.py          # FastAPI app entry point
│   ├── tests/               # Backend tests
│   ├── migrations/          # Database migrations
│   └── pyproject.toml       # Backend dependencies
│
├── .specify/                 # Spec-Driven Development templates
├── specs/                    # Feature specifications and plans
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **Supabase** account (free tier works)
- **npm** or **yarn** for frontend
- **uv** for backend (recommended) or pip

### 1. Clone the Repository

```bash
git clone https://github.com/ammarakk/To-do-App.git
cd To-do-App
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment and install dependencies
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt  # or: uv sync

# Create environment file
cp .env.example .env

# Edit .env and add your Supabase credentials:
# SUPABASE_URL=your_supabase_project_url
# SUPABASE_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_KEY=your_supabase_service_key
# JWT_SECRET=your_jwt_secret
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and add:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup (Supabase)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Run the SQL migration in the SQL Editor:

```sql
-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own todos"
ON todos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
ON todos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
ON todos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
ON todos FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_todos_user_id ON todos(user_id);
```

## 🏃 Running the Application

### Start Backend Server

```bash
# From backend directory
cd backend
.venv/Scripts/uvicorn src.main:app --reload --port 8000
```

Backend will be available at: **http://localhost:8000**

### Start Frontend Server

```bash
# From frontend directory (new terminal)
cd frontend
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### Run Both Simultaneously (Recommended)

You can run both servers in parallel using two terminal windows or use a tool like `concurrently`:

```bash
# In project root
npm run dev  # if you configure this script
```

## 📚 API Documentation

Once the backend is running, visit the interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Main API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/todos` | Get all todos | Yes |
| POST | `/api/todos` | Create todo | Yes |
| PUT | `/api/todos/{id}` | Update todo | Yes |
| DELETE | `/api/todos/{id}` | Delete todo | Yes |
| GET | `/health` | Health check | No |

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm test           # Run tests once
npm run test:watch # Watch mode
```

### Backend Tests

```bash
cd backend
uv run pytest tests/ -v
```

## 🎨 Features in Detail

### Authentication
- Email/password authentication via Supabase Auth
- JWT tokens stored securely in HTTP-only cookies
- Protected routes with automatic token validation
- Logout functionality with proper cleanup

### Todo Management
- Create todos with title and description
- Mark todos as complete/incomplete
- Edit existing todos
- Delete todos with confirmation
- Real-time updates via Supabase subscriptions

### User Interface
- Clean, modern design with Tailwind CSS
- Responsive layout for all screen sizes
- Dark mode toggle (coming soon)
- Loading states and error handling
- Success notifications
- Accessible keyboard navigation

## 🔒 Security Features

- **Row Level Security (RLS)** in Supabase
- **JWT-based authentication** with short-lived tokens
- **CORS configuration** for secure cross-origin requests
- **Input validation** on both client and server
- **SQL injection prevention** via parameterized queries
- **XSS protection** with React's built-in escaping

## 📸 Screenshots

<!-- Add screenshots here when available -->
> 🚧 *Screenshots coming soon!*

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ammar Ak** - *Initial work* - [GitHub](https://github.com/ammarakk)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icons

## 📧 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact [@ammarakk](https://github.com/ammarakk)

## 🗺️ Roadmap

- [ ] Add dark mode toggle
- [ ] Implement due dates for todos
- [ ] Add todo categories/tags
- [ ] Implement file attachments for todos
- [ ] Add shareable todo lists
- [ ] Create mobile app (React Native)
- [ ] Add real-time collaboration features

---

Made with ❤️ using Spec-Driven Development
