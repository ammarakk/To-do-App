# Quickstart Guide: Phase I Console Todo Application

**Feature**: 001-console-todo-app
**Created**: 2025-12-31
**Audience**: Developers implementing this feature

## Purpose

This guide provides step-by-step instructions for implementing and validating the Phase I console todo application according to the specification and constitutional requirements.

## Prerequisites

- Python 3.8 or higher installed
- Access to terminal/console
- Familiarity with Project Constitution v2.1
- Completed spec.md and plan.md review

## Implementation Overview

### Architecture Summary

**Three-Tier Conceptual Model** (Per Constitution):

1. **Presentation Tier**: Console I/O (menu, prompts, display)
2. **Application Tier**: Business logic (CRUD operations, validation)
3. **Data Tier**: In-memory storage (dictionary-based)

**Agent/Subagent/Skill Model** (Per Constitution):

- **Orchestrator Agent**: Controls execution flow
- **Implementation Agent**: Coordinates subagents
- **Subagents**: TaskCreation, TaskUpdate, TaskDeletion, TaskView, StateManagement, etc.
- **Skills**: Reusable functions (validation, formatting, ID generation)

## Project Structure

```
src/
├── main.py                 # Entry point, main loop
├── models/
│   └── task.py            # Task data model
├── services/
│   ├── task_service.py    # Task CRUD operations
│   └── storage_service.py # In-memory storage management
├── presentation/
│   ├── menu.py            # Console menu display
│   ├── input_handler.py   # User input parsing
│   └── output_formatter.py # Task display formatting
└── skills/
    ├── validators.py      # Input validation skills
    ├── id_generator.py    # ID generation skill
    └── formatters.py      # Output formatting skills

tests/
└── test_console_app.py    # Integration and unit tests (optional for Phase I)
```

## Implementation Steps

### Step 1: Setup Project Structure

```bash
# Create directory structure
mkdir -p src/models src/services src/presentation src/skills
touch src/__init__.py
touch src/main.py
touch src/models/__init__.py src/models/task.py
touch src/services/__init__.py src/services/task_service.py src/services/storage_service.py
touch src/presentation/__init__.py src/presentation/menu.py src/presentation/input_handler.py src/presentation/output_formatter.py
touch src/skills/__init__.py src/skills/validators.py src/skills/id_generator.py src/skills/formatters.py
```

**Validation**:
- All directories created
- All `__init__.py` files present
- Structure matches plan.md

### Step 2: Implement Data Model

**File**: `src/models/task.py`

**Requirements**:
- Define Task class with attributes: id, title, description, completed
- Implement `__init__` method
- Implement `__repr__` for debugging
- No business logic (pure data model)

**Validation**:
- Task can be instantiated
- All attributes accessible
- Immutable ID enforcement

### Step 3: Implement Skills (Reusable Functions)

**Files**:
- `src/skills/validators.py`: validate_title, validate_id, validate_input_type
- `src/skills/id_generator.py`: generate_next_id
- `src/skills/formatters.py`: format_task_display, format_task_list

**Requirements**:
- Pure functions (no side effects)
- Deterministic behavior
- Reusable across multiple subagents
- Type hints for clarity

**Validation**:
- Each function returns expected output for given input
- No state mutation
- No external dependencies

### Step 4: Implement Storage Service

**File**: `src/services/storage_service.py`

**Requirements**:
- In-memory dictionary storage
- ID counter for auto-increment
- Methods: store_task, get_task, get_all_tasks, update_task, delete_task
- No persistence logic

**Validation**:
- Tasks can be stored and retrieved
- IDs are unique and auto-incrementing
- Deletion removes task from storage
- Data exists only in memory

### Step 5: Implement Task Service

**File**: `src/services/task_service.py`

**Requirements**:
- Implement CRUD operations using storage service
- Use validation skills before operations
- Business logic layer (e.g., prevent empty titles)
- Return success/error tuples

**Methods**:
- create_task(title, description)
- get_all_tasks()
- get_task(task_id)
- update_task(task_id, title, description)
- delete_task(task_id)
- mark_complete(task_id)

**Validation**:
- All operations enforce business rules
- Invalid inputs rejected with clear errors
- Task lifecycle state transitions correct

### Step 6: Implement Presentation Layer

**Files**:
- `src/presentation/menu.py`: display_menu, get_menu_choice
- `src/presentation/input_handler.py`: prompt_for_task_details, confirm_deletion
- `src/presentation/output_formatter.py`: display_tasks, display_success, display_error

**Requirements**:
- Console I/O only (use input() and print())
- Match console-interface.md contract exactly
- Use formatting skills for display
- Handle Ctrl+C gracefully

**Validation**:
- Menu displays correctly
- All prompts match specification
- Error messages clear and actionable
- Success confirmations displayed

### Step 7: Implement Main Application Loop

**File**: `src/main.py`

**Requirements**:
- Initialize services
- Display menu in loop
- Route to appropriate operations
- Handle errors gracefully
- Exit cleanly

**Structure**:
```python
def main():
    # Initialize services
    # Display welcome
    while True:
        # Show menu
        # Get choice
        # Execute operation
        # Handle errors
        # Loop or exit
```

**Validation**:
- Application runs without crashes
- Menu loop continues until exit
- All operations accessible
- Clean exit on option 6 or Ctrl+C

### Step 8: Integration Testing

**Manual Test Scenarios** (from spec.md):

1. **Create and View (P1)**:
   - Launch app
   - Add task "Buy groceries"
   - View tasks → verify appears
   - Verify ID=1, status=Incomplete

2. **Complete and Update (P2)**:
   - Add task "Finish report"
   - Mark task 2 complete
   - View tasks → verify status=Complete
   - Update task 1 title to "Buy groceries and snacks"
   - View tasks → verify updated

3. **Delete (P3)**:
   - Add task "Call dentist"
   - Delete task 3
   - View tasks → verify removed
   - Confirm tasks 1-2 still exist

4. **Edge Cases**:
   - Try to add task with empty title → error
   - Try to update non-existent ID → error
   - Try to delete non-existent ID → error
   - View tasks when list is empty → friendly message
   - Press Ctrl+C → graceful exit

**Validation Checklist**:
- [ ] All 5 operations work correctly
- [ ] Task IDs auto-increment properly
- [ ] Empty title validation enforced
- [ ] Non-existent ID errors displayed
- [ ] Console formatting matches contract
- [ ] No crashes or unhandled exceptions
- [ ] Graceful exit on Ctrl+C
- [ ] Data is in-memory only (no files created)

### Step 9: Constitutional Compliance Verification

**Phase I Constraints Check**:
- [ ] No database imports or connections
- [ ] No file I/O operations (open, write, read)
- [ ] No web framework imports (flask, django, fastapi)
- [ ] No external libraries beyond Python stdlib
- [ ] No authentication code
- [ ] No API endpoints
- [ ] Console interface only

**Agent/Subagent/Skill Compliance**:
- [ ] Skills are pure functions (reusable)
- [ ] Services act as subagents (stateless operations)
- [ ] Clear separation of concerns
- [ ] No monolithic code generation

### Step 10: Final Validation

Run through complete user journey:

```bash
python src/main.py
```

**Test Script**:
1. Select 1 (Add Task) → "Buy milk" → ""
2. Select 1 (Add Task) → "Finish homework" → "Math and Science"
3. Select 2 (View Tasks) → See 2 tasks
4. Select 5 (Mark Complete) → ID 1
5. Select 3 (Update Task) → ID 2 → "Complete homework" → Keep description
6. Select 2 (View Tasks) → Verify updates
7. Select 4 (Delete Task) → ID 1 → Confirm
8. Select 2 (View Tasks) → Only task 2 remains
9. Select 6 (Exit) → Clean exit

**Success Criteria** (from spec.md):
- [ ] SC-001: Operations complete within 3 seconds
- [ ] SC-002: Tasks display with all details
- [ ] SC-003: Complete status updates immediately
- [ ] SC-004: Updates persist for session
- [ ] SC-005: Deletions confirmed immediately
- [ ] SC-006: Invalid IDs show clear errors
- [ ] SC-007: No crashes during session
- [ ] SC-008: Menu is self-explanatory

## Running the Application

```bash
# From project root
python src/main.py
```

**Expected Behavior**:
- Menu displays immediately
- Operations respond instantly
- Clear feedback for all actions
- Graceful exit

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| ModuleNotFoundError | Ensure all `__init__.py` files exist |
| KeyError on task lookup | Validate ID exists before operations |
| Empty title accepted | Check validator is called before storage |
| Menu doesn't loop | Ensure while True loop in main() |
| Ctrl+C shows traceback | Wrap main loop in try/except KeyboardInterrupt |

## Next Steps

After Phase I completion:
1. Tag repository: `git tag phase-1-complete`
2. Lock phase in `.ai_state/state.json`
3. Prepare for Phase II specification (Web Application)

## Constitutional Compliance Summary

✅ **Spec First**: Implemented per approved spec.md
✅ **Agent-Only**: Skills/Services follow subagent model
✅ **Phase I Constraints**: No DB, no web, no external deps, console only
✅ **In-Memory Only**: Dictionary storage, no persistence
✅ **Python Stdlib Only**: No external packages

Phase I implementation is complete and constitutional when all validation checkpoints pass.
