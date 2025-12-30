# Implementation Plan: Phase I Console Todo Application

**Branch**: `001-console-todo-app` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-console-todo-app/spec.md`

## Summary

Implement an in-memory Python console todo application supporting CRUD operations (Create, Read, Update, Delete, Mark Complete) with strict adherence to Phase I constitutional constraints. The application follows an Agent/Subagent/Skill architecture using Python standard library only, with no persistence, no external dependencies, and console-only interface.

**Key Requirements**:
- 5 core operations: Add, View, Update, Delete, Mark Complete tasks
- In-memory storage with auto-incrementing integer IDs
- Console menu interface with validation and error handling
- Session-scoped data (lost on exit)
- Constitutional compliance: Agent-only execution, reusable skills, no forbidden features

## Technical Context

**Language/Version**: Python 3.8+
**Primary Dependencies**: Python standard library only (no external packages)
**Storage**: In-memory dictionary (no persistence, no files, no database)
**Testing**: Manual console testing per quickstart.md (automated tests optional)
**Target Platform**: Any OS with Python 3.8+ and terminal/console access
**Project Type**: Single project (console application)
**Performance Goals**: All operations complete within 3 seconds (per SC-001)
**Constraints**:
- Python stdlib only
- No file I/O
- No network I/O
- No external dependencies
- Console interface only
- Agent/Subagent/Skill architecture required
**Scale/Scope**: Single-user, single-session, ~1000 tasks per session max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase I Constitutional Constraints

✅ **PASS**: No databases or persistence
✅ **PASS**: No web frameworks or HTTP endpoints
✅ **PASS**: No frontend UI or web interfaces
✅ **PASS**: No authentication or user management
✅ **PASS**: No external APIs or network communication
✅ **PASS**: No Docker or Kubernetes
✅ **PASS**: No cloud services
✅ **PASS**: No AI or ML features
✅ **PASS**: Python standard library only
✅ **PASS**: In-memory storage only
✅ **PASS**: Console/terminal interface only

### Agent/Subagent/Skill Architecture

✅ **PASS**: Skills defined as reusable pure functions (validators.py, id_generator.py, formatters.py)
✅ **PASS**: Services act as subagents (task_service.py, storage_service.py)
✅ **PASS**: Clear separation of concerns (presentation, services, models, skills)
✅ **PASS**: No monolithic code generation
✅ **PASS**: Stateless subagent operations

**Status**: All constitutional gates passed. Proceed to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-console-todo-app/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file - implementation plan
├── data-model.md        # Data model design (completed)
├── quickstart.md        # Implementation guide (completed)
├── contracts/
│   └── console-interface.md  # Console I/O contract (completed)
└── checklists/
    └── requirements.md   # Spec quality checklist (completed)
```

### Source Code (repository root)

```text
src/
├── main.py                 # Entry point, main application loop
├── models/
│   └── task.py            # Task data model (id, title, description, completed)
├── services/
│   ├── task_service.py    # Task CRUD operations (Application Tier)
│   └── storage_service.py # In-memory storage management (Data Tier)
├── presentation/
│   ├── menu.py            # Console menu display (Presentation Tier)
│   ├── input_handler.py   # User input parsing and prompts
│   └── output_formatter.py # Task display formatting
└── skills/
    ├── validators.py      # Reusable validation functions
    ├── id_generator.py    # ID generation logic
    └── formatters.py      # Output formatting helpers

tests/
└── test_console_app.py    # Integration tests (optional for Phase I)
```

**Structure Decision**: Single project structure chosen because this is a standalone console application with no web/mobile components. The structure follows the three-tier architecture (Presentation/Application/Data) mandated by the constitution, with an additional skills/ directory for reusable pure functions per Agent/Subagent/Skill architecture requirements.

## Complexity Tracking

> **No constitutional violations** - This section is empty as all implementation choices comply with Phase I constitution.

## Architecture Design

### Three-Tier Architecture (Constitutional Requirement)

**Presentation Tier** (`src/presentation/`):
- Console I/O: menu display, user prompts, task formatting
- Subagents: InputHandler, OutputFormatter, MenuDisplay
- Responsibility: User interaction only, no business logic

**Application Tier** (`src/services/`):
- Business logic: CRUD operations, validation, task lifecycle
- Subagents: TaskService (orchestrates operations), ValidationSubagent
- Responsibility: Enforce business rules, coordinate between presentation and data

**Data Tier** (`src/services/storage_service.py`):
- In-memory storage: dictionary-based task storage
- Subagent: StorageService (manages state)
- Responsibility: Store and retrieve tasks, maintain ID counter

### Agent/Subagent/Skill Model

**Orchestrator Agent** (Conceptual):
- Controls execution flow through main.py
- Ensures operations follow spec and constitution

**Implementation Agent** (Conceptual):
- Coordinates all subagents
- Assembles implementation from reusable units

**Subagents** (Implemented as Services/Modules):

| Subagent | Location | Responsibility | Stateless? |
|----------|----------|----------------|------------|
| TaskCreationSubagent | task_service.create_task() | Create new tasks with validation | Yes |
| TaskUpdateSubagent | task_service.update_task() | Update existing task details | Yes |
| TaskDeletionSubagent | task_service.delete_task() | Remove tasks from storage | Yes |
| TaskCompletionSubagent | task_service.mark_complete() | Mark tasks as complete | Yes |
| TaskViewSubagent | task_service.get_all_tasks() | Retrieve tasks for display | Yes |
| StateMutationSubagent | storage_service.* | Manage in-memory state | Yes (per-operation) |
| InputParsingSubagent | input_handler.* | Parse and validate user input | Yes |
| OutputRenderingSubagent | output_formatter.* | Format task data for display | Yes |

**Skills** (Pure Reusable Functions):

| Skill | Location | Purpose | Pure? |
|-------|----------|---------|-------|
| ValidateTaskInput | validators.validate_title() | Validate title is non-empty | Yes |
| ValidateTaskID | validators.validate_id() | Validate ID format and existence | Yes |
| GenerateTaskID | id_generator.generate_next_id() | Generate sequential IDs | Yes |
| NormalizeUserInput | validators.normalize_input() | Trim whitespace, handle empty | Yes |
| FormatTaskOutput | formatters.format_task() | Format task for console display | Yes |
| FormatTaskList | formatters.format_task_list() | Format multiple tasks with summary | Yes |
| EnforcePhaseIRules | validators.check_phase_constraints() | Verify no forbidden features | Yes |

### Data Flow

```
User Input → InputHandler (Presentation)
    ↓
Validation Skills (validate, normalize)
    ↓
TaskService (Application) → Business Logic
    ↓
StorageService (Data) → In-Memory Dictionary
    ↓
TaskService (Application) → Result
    ↓
OutputFormatter (Presentation) → Formatted Display
    ↓
Console Output → User
```

### Key Design Decisions

**Decision 1: Dictionary-Based Storage**
- **Rationale**: Simplest in-memory structure for key-value lookups by ID
- **Alternatives**: List (rejected: O(n) lookup), Class with list (rejected: unnecessary complexity)
- **Trade-offs**: Dictionary provides O(1) lookup, natural ID-to-Task mapping

**Decision 2: Separate Skills Module**
- **Rationale**: Constitutional requirement for reusable pure functions
- **Alternatives**: Inline validation (rejected: violates Agent/Subagent/Skill model)
- **Trade-offs**: Extra module increases file count but enforces reusability

**Decision 3: Service Layer Pattern**
- **Rationale**: Separation of concerns, clear Application Tier boundary
- **Alternatives**: Direct storage access from presentation (rejected: violates three-tier architecture)
- **Trade-offs**: Extra abstraction layer, but enforces business logic encapsulation

**Decision 4: No Automated Tests Initially**
- **Rationale**: Manual testing sufficient for Phase I MVP per constitution
- **Alternatives**: Full pytest suite (deferred to Phase II+)
- **Trade-offs**: Faster initial implementation, manual validation required

## Implementation Phases

### Phase 0: Research

**Status**: Complete (no research needed)

All technical decisions are constrained by Phase I constitution:
- Language: Python 3.8+ (per spec, widely available)
- Dependencies: None (stdlib only per constitution)
- Storage: In-memory only (per constitution)
- Interface: Console (per constitution)

No clarifications needed - all requirements explicit in spec.md.

### Phase 1: Design

**Status**: Complete

**Artifacts Created**:
1. ✅ `data-model.md`: Task entity with validation rules and state transitions
2. ✅ `contracts/console-interface.md`: Complete console I/O specification
3. ✅ `quickstart.md`: Step-by-step implementation and validation guide

**Key Deliverables**:
- Task entity defined: (id: int, title: str, description: str, completed: bool)
- Console interface contract: Menu structure, prompts, outputs, error messages
- Project structure: src/ layout with presentation/services/models/skills separation
- Validation rules: Non-empty title, valid ID, graceful error handling
- Implementation guide: 10-step process with validation checkpoints

**Constitution Re-Check**: ✅ All Phase 1 artifacts comply with constitutional constraints

### Phase 2: Implementation Planning (This Document)

**Status**: Complete

This plan.md provides:
- Complete technical context
- Constitutional compliance verification
- Architecture design (Three-Tier + Agent/Subagent/Skill)
- Data flow diagrams
- Implementation phases breakdown
- Validation criteria

**Next Step**: Proceed to `/sp.tasks` to generate actionable task breakdown

## Operation Specifications

### Create Task (FR-001, FR-002, FR-004)
1. Prompt for title (required) and description (optional)
2. Validate title non-empty (ValidateTaskInput skill)
3. Generate next ID (GenerateTaskID skill)
4. Create Task object with completed=False
5. Store in dictionary (StateMutationSubagent)
6. Display success with task details (OutputRenderingSubagent)

### View Tasks (FR-005)
1. Retrieve all tasks from storage (TaskViewSubagent)
2. If empty, display "No tasks found" message
3. If not empty, format each task with all attributes (FormatTaskList skill)
4. Display with count summary (OutputRenderingSubagent)

### Update Task (FR-007)
1. Prompt for task ID
2. Validate ID exists (ValidateTaskID skill)
3. Prompt for new title/description (Enter to keep current)
4. Validate new title if provided (ValidateTaskInput skill)
5. Update task in storage (StateMutationSubagent)
6. Display success with updated details (OutputRenderingSubagent)

### Delete Task (FR-008)
1. Prompt for task ID
2. Validate ID exists (ValidateTaskID skill)
3. Prompt for confirmation (y/n)
4. If confirmed, remove from storage (StateMutationSubagent)
5. Display success message (OutputRenderingSubagent)

### Mark Complete (FR-006)
1. Prompt for task ID
2. Validate ID exists (ValidateTaskID skill)
3. Set completed=True (StateMutationSubagent)
4. Display success with updated status (OutputRenderingSubagent)

### Main Loop (FR-010, FR-012)
1. Display menu with 6 options
2. Get user choice (1-6)
3. Route to appropriate operation
4. Handle KeyboardInterrupt (Ctrl+C) gracefully
5. Loop until Exit (option 6)

## Validation Criteria

### Functional Validation (from spec.md)

**User Story 1 (P1) - Create and View**:
- [ ] Can add task with title only
- [ ] Can add task with title and description
- [ ] Tasks display with ID, title, description, status
- [ ] Empty list shows "No tasks found"
- [ ] IDs auto-increment starting from 1

**User Story 2 (P2) - Complete and Update**:
- [ ] Can mark task complete (status changes to Complete)
- [ ] Can update task title
- [ ] Can update task description
- [ ] Can update both title and description
- [ ] Updates persist for session duration
- [ ] Non-existent ID shows error

**User Story 3 (P3) - Delete**:
- [ ] Can delete task by ID
- [ ] Deletion requires confirmation
- [ ] Deleted task removed from list
- [ ] Remaining tasks unaffected
- [ ] Non-existent ID shows error

**Edge Cases**:
- [ ] Empty title rejected with error message
- [ ] Whitespace-only title rejected
- [ ] Invalid ID format handled gracefully
- [ ] Non-numeric menu input handled
- [ ] Ctrl+C exits gracefully without traceback

### Success Criteria (from spec.md)

- [ ] **SC-001**: Operations complete within 3 seconds
- [ ] **SC-002**: All task details displayed in readable format
- [ ] **SC-003**: Complete status updates immediately visible
- [ ] **SC-004**: Updates persist for session duration
- [ ] **SC-005**: Deletions confirmed immediately
- [ ] **SC-006**: 100% of invalid ops show clear error messages
- [ ] **SC-007**: No crashes during user session
- [ ] **SC-008**: Menu self-explanatory without documentation

### Constitutional Validation

**Phase I Constraints**:
- [ ] No `import sqlite3`, `import mysql`, `import psycopg2` (databases)
- [ ] No `import flask`, `import django`, `import fastapi` (web frameworks)
- [ ] No `open()`, `with open()` for file I/O (persistence)
- [ ] No `requests`, `urllib` for network (external APIs)
- [ ] No `pip install` of external packages (stdlib only)
- [ ] Only `input()` and `print()` for I/O (console only)

**Agent/Subagent/Skill Compliance**:
- [ ] Skills are pure functions (no side effects)
- [ ] Services are stateless per-operation
- [ ] Clear three-tier separation maintained
- [ ] No monolithic files >200 lines

## Risk Analysis

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Integer ID overflow | Very Low | Low | Practical limit ~1000 tasks/session, Python ints unbounded |
| Memory exhaustion | Very Low | Medium | Scope to ~1000 tasks, no persistence means bounded growth |
| Unicode display issues | Low | Low | Use ASCII-safe symbols (✓ ✗ ℹ) with fallbacks |
| Platform compatibility | Very Low | Low | Python stdlib works across all major OS |

### Process Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Constitutional violation | Medium | High | Explicit validation checklist in quickstart.md |
| Scope creep (persistence, etc.) | Medium | High | Clear "Out of Scope" section, Phase I locked on completion |
| Over-engineering | Medium | Medium | Follow Agent/Subagent/Skill model, avoid premature abstractions |

## Dependencies

**Internal Dependencies**:
- Constitution v2.1 (defines Phase I constraints)
- Spec.md (defines functional requirements)
- No code dependencies (Phase I is first implementation)

**External Dependencies**:
- Python 3.8+ runtime
- Terminal/console environment
- No external packages

## Next Steps

1. **Generate Tasks**: Run `/sp.tasks` to create task breakdown from this plan
2. **Implement**: Follow quickstart.md step-by-step guide
3. **Validate**: Complete all validation checklists
4. **Lock Phase**: Tag repository `phase-1-complete` after validation passes

## Appendix

### File Size Estimates

| File | Est. Lines | Complexity |
|------|------------|------------|
| main.py | ~50 | Low |
| models/task.py | ~30 | Very Low |
| services/task_service.py | ~100 | Medium |
| services/storage_service.py | ~60 | Low |
| presentation/menu.py | ~40 | Low |
| presentation/input_handler.py | ~80 | Medium |
| presentation/output_formatter.py | ~60 | Low |
| skills/*.py | ~150 total | Low |
| **Total** | **~570 lines** | **Low-Medium** |

### Time Estimate

- **Setup**: 15 minutes (directory structure, empty files)
- **Models**: 30 minutes (Task class)
- **Skills**: 1 hour (validators, formatters, ID generator)
- **Storage Service**: 1 hour (in-memory dict operations)
- **Task Service**: 1.5 hours (CRUD business logic)
- **Presentation**: 2 hours (menu, input, output formatting)
- **Main Loop**: 1 hour (orchestration, error handling)
- **Testing**: 2 hours (manual validation per quickstart.md)
- **Total**: ~9 hours for complete Phase I implementation

---

**Plan Status**: ✅ Complete and ready for task generation
**Constitutional Compliance**: ✅ Verified
**Next Command**: `/sp.tasks` to generate implementation task list
