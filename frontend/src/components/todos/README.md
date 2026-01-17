# Todo UI Components

This directory contains all UI components for the Todo application. These components are designed with placeholder data and will be integrated with the backend API in a future phase.

## Components

### 1. TodoForm (`TodoForm.tsx`)
Form component for creating and editing todos.

**Features:**
- Title input (required, 3-100 characters)
- Description textarea (optional)
- Priority selector (required: low, medium, high)
- Category dropdown (optional)
- Due date picker (optional)
- Client-side validation
- Loading state during submission

**Usage:**
```tsx
import TodoForm from '@/components/todos/TodoForm'

<TodoForm
  todo={todoToEdit} // null for create mode
  onClose={() => setIsFormOpen(false)}
/>
```

### 2. TodoItem (`TodoItem.tsx`)
Card component displaying individual todo details.

**Features:**
- Title and description display
- Priority badge (color-coded)
- Status badge (color-coded)
- Category badge
- Due date with overdue indication
- Edit and delete buttons
- Status toggle checkbox
- Strikethrough for completed todos

**Usage:**
```tsx
import TodoItem from '@/components/todos/TodoItem'

<TodoItem
  todo={todoData}
  onEdit={(todo) => openEditModal(todo)}
  onDelete={(id) => deleteTodo(id)}
  onToggleStatus={(id, status) => toggleStatus(id, status)}
/>
```

### 3. TodoList (`TodoList.tsx`)
Main list component with loading states, empty state, and pagination.

**Features:**
- Loading skeleton (6 items)
- Empty state with call-to-action
- Error state with retry button
- Responsive grid layout (1/2/3 columns)
- Client-side filtering (placeholder)
- Pagination support

**Usage:**
```tsx
import TodoList from '@/components/todos/TodoList'

<TodoList
  filters={{ search: '', priority: '', status: '', category: '' }}
  pagination={{ page: 1, limit: 10, total: 50 }}
  onPageChange={(page) => setCurrentPage(page)}
  onEdit={(todo) => openEditModal(todo)}
/>
```

### 4. FilterBar (`FilterBar.tsx`)
Search and filter controls for todos.

**Features:**
- Search input (searches title and description)
- Priority filter dropdown
- Status filter dropdown
- Category filter dropdown
- Clear all filters button
- Active filters display (mobile)
- Responsive layout

**Usage:**
```tsx
import FilterBar from '@/components/todos/FilterBar'

<FilterBar
  filters={currentFilters}
  onFilterChange={(newFilters) => setFilters(newFilters)}
  onClearFilters={() => resetFilters()}
/>
```

### 5. Pagination (`Pagination.tsx`)
Page navigation component.

**Features:**
- Previous/Next buttons
- Page number buttons
- Ellipsis for large page counts
- Current page highlighting
- Disabled states for boundaries
- Touch-friendly buttons (min 44x44px)
- Responsive design

**Usage:**
```tsx
import Pagination from '@/components/todos/Pagination'

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => goToPage(page)}
/>
```

## Data Types

### Todo
```typescript
interface Todo {
  id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  due_date: string | null
  category: string | null
  created_at: string
  updated_at: string
}
```

### TodoFilters
```typescript
interface TodoFilters {
  search: string
  priority: string
  status: string
  category: string
}
```

### PaginationState
```typescript
interface PaginationState {
  page: number
  limit: number
  total: number
}
```

## Styling

All components use:
- **Tailwind CSS** for styling
- **Mobile-first** responsive design
- **Touch-friendly** button sizes (min 44x44px)
- **Accessible** ARIA labels and roles
- **Professional** color scheme with proper contrast

## Responsive Breakpoints

- **Mobile (< 640px)**: 1 column, stacked layout
- **Tablet (640px - 1024px)**: 2 columns, adapted spacing
- **Desktop (> 1024px)**: 3 columns, optimal spacing

## API Integration

All components currently use **placeholder data** and need API integration:

### TodoForm
- `handleSubmit`: Needs API call to create/update todo

### TodoList
- `fetchTodos`: Needs API call to fetch todos with filters
- `handleDelete`: Needs API call to delete todo
- `handleToggleStatus`: Needs API call to update status

### Components are ready for API integration with:
- Proper error handling
- Loading states
- Optimistic UI updates
- Form validation

## Future Enhancements

1. **API Integration**: Replace placeholder data with actual API calls
2. **Real-time Updates**: WebSocket integration for live updates
3. **Drag & Drop**: Reorder todos
4. **Bulk Actions**: Select and update multiple todos
5. **Advanced Filters**: Date range, multiple categories
6. **Export**: Download todos as CSV/JSON
7. **Notifications**: Toast notifications for actions
8. **Animations**: Smooth transitions between states

## Accessibility

All components follow WCAG AA guidelines:
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Proper color contrast ratios
- Focus indicators
