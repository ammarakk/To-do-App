# Frontend Routes Guide

## Public Routes

### `/` - Home/Landing
- File: `frontend/src/app/page.tsx`
- Description: Landing page
- Auth: Not required

### `/login` - Login Page
- File: `frontend/src/app/(auth)/login/page.tsx`
- Component: `LoginForm`
- Auth: Not required (redirects if already logged in)

### `/signup` - Signup Page
- File: `frontend/src/app/(auth)/signup/page.tsx`
- Component: `SignupForm`
- Auth: Not required (redirects if already logged in)

## Protected Routes

All routes under `(dashboard)` require authentication.

### `/dashboard/todos` - Todos Management
- File: `frontend/src/app/(dashboard)/todos/page.tsx`
- Components: `TodoList`, `TodoForm`, `FilterBar`, `Pagination`
- Auth: Required
- Features:
  - View todos (paginated list)
  - Create new todo
  - Edit existing todo
  - Delete todo
  - Toggle todo status
  - Search todos
  - Filter by priority/status/category
  - Responsive layout

## Route Groups

### `(auth)` - Authentication Routes
- Purpose: Group auth-related pages
- Layout: Uses root layout
- Routes: `/login`, `/signup`

### `(dashboard)` - Protected Dashboard Routes
- Purpose: Group authenticated pages
- Layout: `frontend/src/app/(dashboard)/layout.tsx`
- Features:
  - Auth guard (redirects unauthenticated users)
  - Navigation header
  - User menu
  - Logout functionality
  - Mobile-responsive navigation
- Routes: `/dashboard/todos`

## Navigation Flow

```
1. User visits app → `/` (home)
                  ↓
2. Clicks Login   → `/login`
                  ↓ (successful login)
3. Redirected to  → `/dashboard/todos`
                  ↓
4. Can logout     → Redirects to `/login`
```

## Authentication Guard

The dashboard layout (`(dashboard)/layout.tsx`) implements auth guard:

```typescript
// Placeholder auth check
const hasAuthSession = localStorage.getItem('hasAuthSession') === 'true'

if (!hasAuthSession) {
  router.push('/login')
  return
}
```

**TODO**: Replace with actual Supabase auth check in future task.

## Component Imports

### Dashboard Layout Components
```typescript
import LogoutButton from '@/components/auth/LogoutButton'
```

### Todos Page Components
```typescript
import TodoList from '@/components/todos/TodoList'
import TodoForm from '@/components/todos/TodoForm'
import FilterBar from '@/components/todos/FilterBar'
```

### TodoList Sub-Components
```typescript
import TodoItem from '@/components/todos/TodoItem'
import Pagination from '@/components/todos/Pagination'
```

## Future Routes (To Be Implemented)

- `/dashboard` - Dashboard overview
- `/dashboard/lists` - Todo lists management
- `/dashboard/settings` - User settings
- `/dashboard/profile` - User profile

## File Structure

```
frontend/src/app/
├── (auth)/                 # Auth route group
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── (dashboard)/            # Protected route group
│   ├── layout.tsx         # Dashboard layout + auth guard
│   └── todos/
│       └── page.tsx       # Todos page
├── layout.tsx             # Root layout
├── page.tsx               # Home page
├── error.tsx              # Error boundary
└── not-found.tsx          # 404 page
```

## Accessing the Application

1. **Development**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open: http://localhost:3000

2. **Login (Placeholder)**:
   - Set `localStorage.setItem('hasAuthSession', 'true')`
   - Set `localStorage.setItem('userEmail', 'test@example.com')`
   - Navigate to `/dashboard/todos`

3. **Direct Access**:
   - Home: http://localhost:3000
   - Login: http://localhost:3000/login
   - Signup: http://localhost:3000/signup
   - Todos: http://localhost:3000/dashboard/todos (requires auth)

## Route Protection

### Current Implementation (Placeholder)
- Checks `localStorage` for auth session
- Redirects to `/login` if not authenticated
- Shows loading state during check

### Future Implementation
- Integrate with Supabase auth
- Use server-side session verification
- Implement proper auth middleware
- Add role-based access control (if needed)

## Responsive Design

All routes and components are responsive:
- **Mobile** (< 640px): Stacked layout, hamburger menu
- **Tablet** (640px - 1024px): Adapted spacing, 2 columns
- **Desktop** (> 1024px): Full layout, 3 columns

## Accessibility

All routes follow WCAG AA guidelines:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast ratios
