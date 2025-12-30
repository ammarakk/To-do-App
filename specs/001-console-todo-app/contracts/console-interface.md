# Console Interface Contract: Phase I Todo Application

**Feature**: 001-console-todo-app
**Created**: 2025-12-31
**Type**: Console/CLI Interface Specification

## Overview

This contract defines the console interface behavior for the Phase I todo application. It specifies the menu structure, user interactions, input/output formats, and error handling.

## Main Menu

### Display Format

```
===========================================
        TODO APPLICATION - PHASE I
===========================================

Current Tasks: X

1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete
6. Exit

Select an option (1-6):
```

### Menu Behavior

- Display after every completed operation (except Exit)
- Show current task count dynamically
- Accept numeric input (1-6)
- Handle invalid input gracefully
- Loop until user selects Exit (option 6)

## Operation Contracts

### 1. Add Task

**Input Prompts:**

```
Enter task title: [user input]
Enter task description (optional, press Enter to skip): [user input]
```

**Success Output:**

```
✓ Task created successfully!
  ID: 1
  Title: Buy groceries
  Description: Milk, eggs, bread
  Status: Incomplete
```

**Error Cases:**

| Error Condition | Output Message |
|----------------|----------------|
| Empty title | ✗ Error: Task title cannot be empty. Please try again. |
| Title is whitespace only | ✗ Error: Task title cannot be empty. Please try again. |

**Business Rules:**
- Title is required (non-empty)
- Description is optional (can be empty string)
- New task defaults to completed=False
- Task ID auto-assigned

---

### 2. View Tasks

**No Tasks Output:**

```
===========================================
           YOUR TASKS
===========================================

No tasks found. Add a task to get started!
```

**With Tasks Output:**

```
===========================================
           YOUR TASKS
===========================================

[ID: 1] Buy groceries
Description: Milk, eggs, bread
Status: Incomplete

[ID: 2] Finish project report
Description: Complete sections 3-5
Status: Complete

[ID: 3] Call dentist
Description:
Status: Incomplete

-------------------------------------------
Total: 3 tasks (1 complete, 2 incomplete)
```

**Format Rules:**
- Tasks ordered by ID (creation order)
- Show all attributes for each task
- Empty descriptions shown as blank line
- Summary line with counts

---

### 3. Update Task

**Input Prompts:**

```
Enter task ID to update: [user input]
Enter new title (press Enter to keep current): [user input]
Enter new description (press Enter to keep current): [user input]
```

**Success Output:**

```
✓ Task updated successfully!
  ID: 2
  Title: Finish project report (UPDATED)
  Description: Complete sections 3-6 and add references
  Status: Complete
```

**Error Cases:**

| Error Condition | Output Message |
|----------------|----------------|
| Invalid ID format | ✗ Error: Please enter a valid task ID (number). |
| Task ID not found | ✗ Error: Task with ID X not found. |
| New title is empty | ✗ Error: Task title cannot be empty. Update cancelled. |

**Business Rules:**
- Press Enter without input = keep current value
- Both title and description can be updated
- Cannot change ID or completed status via update
- Empty string for title is rejected

---

### 4. Delete Task

**Input Prompts:**

```
Enter task ID to delete: [user input]
Confirm deletion of task "Buy groceries"? (y/n): [user input]
```

**Success Output:**

```
✓ Task ID 1 deleted successfully.
```

**Cancelled Output:**

```
Deletion cancelled.
```

**Error Cases:**

| Error Condition | Output Message |
|----------------|----------------|
| Invalid ID format | ✗ Error: Please enter a valid task ID (number). |
| Task ID not found | ✗ Error: Task with ID X not found. |
| Invalid confirmation | Deletion cancelled. |

**Business Rules:**
- Requires confirmation (y/yes accepted, anything else cancels)
- Deleted task IDs not reused
- Irreversible operation

---

### 5. Mark Task Complete

**Input Prompts:**

```
Enter task ID to mark complete: [user input]
```

**Success Output:**

```
✓ Task marked complete!
  ID: 1
  Title: Buy groceries
  Status: Complete
```

**Already Complete Output:**

```
ℹ Task ID 1 is already marked as complete.
```

**Error Cases:**

| Error Condition | Output Message |
|----------------|----------------|
| Invalid ID format | ✗ Error: Please enter a valid task ID (number). |
| Task ID not found | ✗ Error: Task with ID X not found. |

**Business Rules:**
- One-way operation (cannot unmark)
- Idempotent (marking complete task as complete is allowed but shows info message)

---

### 6. Exit

**Output:**

```
Thank you for using TODO Application!
Goodbye!
```

**Behavior:**
- Exits application immediately
- No confirmation required
- All data lost (in-memory only)

## Error Handling

### Input Validation Errors

**Invalid Menu Selection:**

```
✗ Error: Invalid option. Please select 1-6.
```

**Non-Numeric Input:**

```
✗ Error: Please enter a number.
```

### Console Interruption (Ctrl+C)

**Output:**

```

Application interrupted. Goodbye!
```

**Behavior:**
- Catch KeyboardInterrupt exception
- Display graceful exit message
- Exit cleanly without stack trace

### Unexpected Errors

**Output:**

```
✗ An unexpected error occurred. Please try again.
```

**Behavior:**
- Catch all unhandled exceptions
- Log to console (Phase I, minimal logging)
- Return to main menu
- Do not crash application

## Input/Output Conventions

### Symbols
- ✓ = Success
- ✗ = Error
- ℹ = Information

### Input Handling
- Trim whitespace from all inputs
- Case-insensitive for y/n confirmations
- Accept "yes"/"y" and "no"/"n" for confirmations
- Empty input = keep current value (for updates) or skip (for optional fields)

### Display Formatting
- Use separators (===, ---) for visual clarity
- Consistent spacing and alignment
- Clear section headers
- Task status: "Complete" or "Incomplete" (not True/False)

## Non-Functional Requirements

**Response Time:**
- All operations complete within 100ms (excluding user input wait time)
- Menu displays instantly after operation

**Usability:**
- All prompts clearly labeled
- Error messages actionable
- Confirmation required only for destructive operations (delete)

**Accessibility:**
- Plain text output
- No special characters that might not render
- Works in any standard terminal/console
