# Quick Start Testing Guide - Frontend ↔ Backend Integration

## Prerequisites

### 1. Environment Setup

**Backend (`.env`):**
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Configuration
API_PORT=8000
API_HOST=0.0.0.0
ENVIRONMENT=development

# CORS Configuration
CORS_ORIGINS=http://localhost:3000
```

**Frontend (`.env.local`):**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python -m uvicorn src.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Verify Services

- **Backend:** http://localhost:8000/docs (Swagger UI)
- **Frontend:** http://localhost:3000
- **Health Check:** http://localhost:8000/health

---

## Testing Scenarios

### Test 1: User Registration & Login

1. Go to http://localhost:3000/signup
2. Fill out the form:
   - Email: `test1@example.com`
   - Password: `password123` (min 8 characters)
   - Confirm Password: `password123`
3. Click "Create account"
4. Check email for verification link (or skip for development)
5. Go to http://localhost:3000/login
6. Login with: `test1@example.com` / `password123`
7. **Expected:** Redirect to dashboard

### Test 2: Create Todo

1. Click "Add Todo" button
2. Fill out the form:
   - Title: `Test Todo 1`
   - Description: `This is a test todo`
   - Priority: `High`
   - Category: `Work`
   - Due Date: Select tomorrow
3. Click "Create Todo"
4. **Expected:**
   - Form closes
   - Todo appears in list
   - Loading states visible during creation

### Test 3: View Todos

1. Check that your new todo appears in the list
2. Verify todo details:
   - Title matches
   - Description visible
   - Priority badge shows "High Priority"
   - Category badge shows "Work"
   - Due date shows "Tomorrow"

### Test 4: Filter Todos

1. **Search Filter:**
   - Type "Test" in search box
   - **Expected:** Only todos with "Test" in title/description

2. **Priority Filter:**
   - Select "High" from priority dropdown
   - **Expected:** Only high priority todos shown

3. **Status Filter:**
   - Select "Pending" from status dropdown
   - **Expected:** Only pending todos shown

4. **Category Filter:**
   - Select "Work" from category dropdown
   - **Expected:** Only work todos shown

5. **Clear Filters:**
   - Click "Clear Filters" button
   - **Expected:** All todos shown

### Test 5: Edit Todo

1. Click "Edit" button on your todo
2. Modify the title to "Updated Test Todo 1"
3. Change priority to "Medium"
4. Click "Update Todo"
5. **Expected:**
   - Form closes
   - Todo updated in list
   - New values visible

### Test 6: Toggle Status

1. Click the checkbox next to your todo
2. **Expected:**
   - Todo immediately marked as completed (optimistic)
   - Green checkmark appears
   - Title shows strikethrough
   - Status badge changes to "Completed"
3. Click checkbox again
4. **Expected:**
   - Todo marked as pending
   - Strikethrough removed

### Test 7: Delete Todo

1. Click "Delete" button on your todo
2. Confirm deletion in the dialog
3. **Expected:**
   - Todo immediately removed from list (optimistic)
   - List updates total count

### Test 8: Pagination

1. Create 25+ todos (use bulk creation or manual)
2. Scroll to bottom of list
3. **Expected:**
   - Pagination controls visible
   - Page 1 of X shown
   - "Next" button enabled
4. Click "Next"
5. **Expected:**
   - Next page of todos loaded
   - Page counter updates
6. Click specific page number
7. **Expected:** Navigates to that page

### Test 9: User Isolation

1. Logout (click logout button)
2. Register/login as second user: `test2@example.com`
3. **Expected:**
   - Empty todo list
   - Cannot see todos from `test1@example.com`
4. Create a todo for user 2
5. Logout and login as user 1
6. **Expected:**
   - Only user 1's todos visible
   - User 2's todo not accessible

### Test 10: Error Handling

1. **401 Unauthorized:**
   - Logout
   - Try to access http://localhost:3000/dashboard directly
   - **Expected:** Redirect to login

2. **Validation Error:**
   - Try to create todo with empty title
   - **Expected:** "Title is required" error

3. **Network Error:**
   - Stop the backend server (Ctrl+C in terminal)
   - Try to create a todo
   - **Expected:** "Network error" message
   - Restart backend

---

## Troubleshooting

### Issue: "Authentication required" errors

**Solution:**
1. Check that backend is running
2. Check that `NEXT_PUBLIC_API_URL` is correct
3. Logout and login again
4. Check browser console for errors

### Issue: CORS errors

**Solution:**
1. Check backend `.env` file has `CORS_ORIGINS=http://localhost:3000`
2. Restart backend after changing CORS settings
3. Check browser console for specific CORS error

### Issue: Todos not loading

**Solution:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check if `/api/todos` request is made
4. Check response status code
5. Check JWT token in Request Headers

### Issue: "Network error"

**Solution:**
1. Verify backend is running on port 8000
2. Check `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Try accessing http://localhost:8000/health in browser
4. Check firewall/antivirus settings

---

## Browser DevTools Tips

### Check API Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "todos" or "api"
4. Check:
   - Request URL
   - Request Headers (Authorization: Bearer <token>)
   - Response status (200, 401, 500, etc.)
   - Response body

### Check Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Common errors:
   - `Failed to fetch` → Network/backend issue
   - `401 Unauthorized` → Auth issue
   - `CORS policy` → Backend CORS config

### Check LocalStorage
1. Open DevTools (F12)
2. Go to Application tab
3. Local Storage → http://localhost:3000
4. Check for `supabase-auth-token`

---

## API Testing with cURL

### Test Authentication
```bash
# Get JWT token from browser DevTools first
curl -X GET "http://localhost:8000/api/todos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Create Todo
```bash
curl -X POST "http://localhost:8000/api/todos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test from cURL",
    "description": "Testing API directly",
    "priority": "high",
    "category": "work"
  }'
```

---

## Success Criteria

All tests pass if:
- ✅ User can signup and login
- ✅ User can create todos
- ✅ User can view their todos
- ✅ User can filter todos
- ✅ User can edit todos
- ✅ User can toggle todo status
- ✅ User can delete todos
- ✅ User A cannot see User B's todos
- ✅ Error messages are user-friendly
- ✅ Loading states are visible
- ✅ UI updates are smooth (optimistic updates)

---

**Last Updated:** 2026-01-17
**Status:** Ready for Testing
