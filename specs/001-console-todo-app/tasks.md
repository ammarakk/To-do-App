---
description: "Task list for Phase I Console Todo Application"
---

# Tasks: Phase I Console Todo Application

**Input**: Design documents from `/specs/001-console-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT requested for Phase I - manual testing per quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story per constitutional Agent/Subagent/Skill model.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths shown below follow plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure (src/, src/models/, src/services/, src/presentation/, src/skills/)
- [ ] T002 [P] Create Python package __init__.py files in all src subdirectories
- [ ] T003 [P] Initialize .ai_state directory and create state.json with phase tracking

**Checkpoint**: Foundation directories created, ready for agent/subagent implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Skills and base infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Skills Layer (Pure Functions - Constitutional Requirement)

- [ ] T004 [P] Implement validate_title() in src/skills/validators.py (non-empty string validation)
- [ ] T005 [P] Implement validate_id() in src/skills/validators.py (ID existence and format check)
- [ ] T006 [P] Implement normalize_input() in src/skills/validators.py (trim whitespace, handle empty)
- [ ] T007 [P] Implement generate_next_id() in src/skills/id_generator.py (sequential ID generation)
- [ ] T008 [P] Implement format_task() in src/skills/formatters.py (single task display formatting)
- [ ] T009 [P] Implement format_task_list() in src/skills/formatters.py (multiple tasks with summary)

### Data Model

- [ ] T010 Create Task class in src/models/task.py (id, title, description, completed attributes)

### Storage Service (Data Tier - Subagent)

- [ ] T011 Implement StorageService class in src/services/storage_service.py with in-memory dictionary
- [ ] T012 Add store_task() method to StorageService (store task by ID)
- [ ] T013 Add get_task(task_id) method to StorageService (retrieve single task)
- [ ] T014 Add get_all_tasks() method to StorageService (retrieve all tasks)
- [ ] T015 Add update_task(task_id, task) method to StorageService (update existing task)
- [ ] T016 Add delete_task(task_id) method to StorageService (remove task)
- [ ] T017 Add ID counter management to StorageService (track next_id)

**Checkpoint**: Foundation ready - Skills layer complete, data model defined, storage service operational. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to add tasks and view their task list - core MVP functionality

**Independent Test**: Launch app, add 2-3 tasks with titles and descriptions, view list to confirm all tasks appear with details and status

### Task Service Operations for US1 (Application Tier - Subagents)

- [ ] T018 [P] [US1] Implement create_task(title, description) in src/services/task_service.py using validate_title and generate_next_id skills
- [ ] T019 [P] [US1] Implement get_all_tasks() in src/services/task_service.py using StorageService
- [ ] T020 [US1] Add error handling for create_task (empty title validation, return success/error tuple)
- [ ] T021 [US1] Add error handling for get_all_tasks (empty list case)

### Presentation Layer for US1 (Presentation Tier - Subagents)

- [ ] T022 [P] [US1] Implement display_menu() in src/presentation/menu.py (show 6 options menu per contract)
- [ ] T023 [P] [US1] Implement get_menu_choice() in src/presentation/menu.py (validate numeric input 1-6)
- [ ] T024 [P] [US1] Implement prompt_for_new_task() in src/presentation/input_handler.py (get title and description)
- [ ] T025 [P] [US1] Implement display_task_list() in src/presentation/output_formatter.py using format_task_list skill
- [ ] T026 [P] [US1] Implement display_success() in src/presentation/output_formatter.py (success messages with checkmark)
- [ ] T027 [P] [US1] Implement display_error() in src/presentation/output_formatter.py (error messages with X mark)

### Main Application Loop for US1

- [ ] T028 [US1] Create main() function in src/main.py (initialize services, welcome message)
- [ ] T029 [US1] Add menu loop to main() (display menu, get choice, route to operations)
- [ ] T030 [US1] Implement handle_add_task() in src/main.py (call input_handler, task_service, output_formatter)
- [ ] T031 [US1] Implement handle_view_tasks() in src/main.py (call task_service, output_formatter)
- [ ] T032 [US1] Add KeyboardInterrupt handling to main() (graceful Ctrl+C exit)
- [ ] T033 [US1] Add exit option (6) handler in src/main.py (goodbye message, clean exit)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can add and view tasks.

---

## Phase 4: User Story 2 - Complete and Update Tasks (Priority: P2)

**Goal**: Enable task completion status changes and task detail updates

**Independent Test**: Create a task, mark it complete and verify status changes, then update another task's title/description and confirm changes persist

### Task Service Operations for US2 (Application Tier - Subagents)

- [ ] T034 [P] [US2] Implement mark_complete(task_id) in src/services/task_service.py using validate_id skill
- [ ] T035 [P] [US2] Implement update_task(task_id, title, description) in src/services/task_service.py using validate_id and validate_title skills
- [ ] T036 [US2] Add error handling for mark_complete (non-existent ID, already complete case)
- [ ] T037 [US2] Add error handling for update_task (non-existent ID, empty title case)

### Presentation Layer for US2 (Presentation Tier - Subagents)

- [ ] T038 [P] [US2] Implement prompt_for_task_id() in src/presentation/input_handler.py (get and validate ID input)
- [ ] T039 [P] [US2] Implement prompt_for_task_updates() in src/presentation/input_handler.py (get new title/description, allow Enter to skip)
- [ ] T040 [P] [US2] Implement display_task_details() in src/presentation/output_formatter.py (show single task with all fields)

### Main Application Integration for US2

- [ ] T041 [US2] Implement handle_mark_complete() in src/main.py (call input_handler, task_service, output_formatter)
- [ ] T042 [US2] Implement handle_update_task() in src/main.py (call input_handler for ID and updates, task_service, output_formatter)
- [ ] T043 [US2] Add mark complete (option 5) to menu router in src/main.py
- [ ] T044 [US2] Add update task (option 3) to menu router in src/main.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can create, view, complete, and update tasks.

---

## Phase 5: User Story 3 - Delete Tasks (Priority: P3)

**Goal**: Enable task removal from the list

**Independent Test**: Create several tasks, delete specific ones by ID, view list to confirm deleted tasks are removed and remaining tasks intact

### Task Service Operations for US3 (Application Tier - Subagents)

- [ ] T045 [US3] Implement delete_task(task_id) in src/services/task_service.py using validate_id skill
- [ ] T046 [US3] Add error handling for delete_task (non-existent ID case)

### Presentation Layer for US3 (Presentation Tier - Subagents)

- [ ] T047 [US3] Implement prompt_for_deletion_confirmation(task) in src/presentation/input_handler.py (show task, ask y/n)

### Main Application Integration for US3

- [ ] T048 [US3] Implement handle_delete_task() in src/main.py (get ID, confirm, call task_service, output_formatter)
- [ ] T049 [US3] Add delete task (option 4) to menu router in src/main.py

**Checkpoint**: All user stories should now be independently functional. Full CRUD operations available.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T050 [P] Add input validation for non-numeric menu choices in src/presentation/menu.py
- [ ] T051 [P] Add input validation for invalid ID formats in src/presentation/input_handler.py
- [ ] T052 [P] Ensure consistent error message formatting across all operations
- [ ] T053 Add task count display to menu header in src/presentation/menu.py
- [ ] T054 Test complete user journey per quickstart.md validation scenarios
- [ ] T055 Verify constitutional compliance (no DB imports, no file I/O, no web frameworks, stdlib only)
- [ ] T056 [P] Update .ai_state/state.json with phase-1:validated checkpoint
- [ ] T057 Final validation against all success criteria from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - No dependencies on US1 (shares services)
  - User Story 3 (P3): Can start after Foundational - No dependencies on US1/US2 (shares services)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Independently testable
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independently testable (uses shared services)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independently testable (uses shared services)

**Key Insight**: All three user stories share the same foundational services (StorageService, Skills), so once Phase 2 is complete, all stories CAN run in parallel if multiple developers are available.

### Within Each User Story

- Task Service methods before Main App integration
- Presentation methods can be developed in parallel with Service methods (marked [P])
- Main App integration depends on both Service and Presentation being ready

### Parallel Opportunities

**Phase 1 (Setup)**: All 3 tasks can run in parallel (T002, T003 are independent)

**Phase 2 (Foundational)**: High parallelization potential
- All 6 Skills tasks (T004-T009) can run in parallel [P]
- Storage Service tasks (T011-T017) are sequential (depend on T011)
- Task model (T010) is independent

**Phase 3 (User Story 1)**: Moderate parallelization
- Service methods (T018, T019) can run in parallel [P]
- Presentation methods (T022-T027) can run in parallel [P] with each other AND with service methods
- Main integration (T028-T033) depends on services and presentation being complete

**Phase 4-5 (User Stories 2-3)**: Similar parallelization to US1

**Phase 6 (Polish)**: Tasks T050-T052 can run in parallel [P]

---

## Parallel Example: Foundational Phase

```bash
# Launch all Skills in parallel (T004-T009):
Task: "Implement validate_title() in src/skills/validators.py"
Task: "Implement validate_id() in src/skills/validators.py"
Task: "Implement normalize_input() in src/skills/validators.py"
Task: "Implement generate_next_id() in src/skills/id_generator.py"
Task: "Implement format_task() in src/skills/formatters.py"
Task: "Implement format_task_list() in src/skills/formatters.py"

# These all touch different files and have no dependencies
```

---

## Parallel Example: User Story 1

```bash
# After Phase 2 complete, launch US1 Service + Presentation in parallel:

# Service Layer (T018-T021)
Task: "Implement create_task() in src/services/task_service.py"
Task: "Implement get_all_tasks() in src/services/task_service.py"

# Presentation Layer (T022-T027) - can run SAME TIME as Service
Task: "Implement display_menu() in src/presentation/menu.py"
Task: "Implement get_menu_choice() in src/presentation/menu.py"
Task: "Implement prompt_for_new_task() in src/presentation/input_handler.py"
Task: "Implement display_task_list() in src/presentation/output_formatter.py"
Task: "Implement display_success() in src/presentation/output_formatter.py"
Task: "Implement display_error() in src/presentation/output_formatter.py"

# All touching different files, no dependencies between Service and Presentation
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T017) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T018-T033)
4. **STOP and VALIDATE**: Test User Story 1 independently per quickstart.md
5. Deploy/demo if ready - working todo app with add and view!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T017)
2. Add User Story 1 (T018-T033) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T034-T044) → Test independently → Deploy/Demo
4. Add User Story 3 (T045-T049) → Test independently → Deploy/Demo
5. Add Polish (T050-T057) → Final validation → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers or agents:

1. Team completes Setup + Foundational together (T001-T017)
2. Once Foundational is done (checkpoint reached):
   - Developer/Agent A: User Story 1 (T018-T033)
   - Developer/Agent B: User Story 2 (T034-T044)
   - Developer/Agent C: User Story 3 (T045-T049)
3. Stories complete and integrate independently
4. Final polish together (T050-T057)

**Agent Orchestration Note**: Per constitution, Orchestrator Agent controls checkpoints and ensures Phase 2 completion before allowing User Story phases to begin.

---

## Constitutional Compliance Checkpoints

**After Phase 2 (Foundational)**: Validate that:
- [ ] All skills are pure functions (no side effects)
- [ ] Services are stateless operations
- [ ] No database imports present
- [ ] No file I/O operations
- [ ] Only stdlib imports used

**After Phase 6 (Polish)**: Final validation that:
- [ ] Agent/Subagent/Skill architecture maintained
- [ ] Three-tier separation preserved
- [ ] Phase I constraints verified (per T055)
- [ ] All success criteria from spec.md met (per T057)
- [ ] Ready for Orchestrator Agent to lock phase

---

## Notes

- [P] tasks = different files, no dependencies, safe to parallelize
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Agent/Subagent Execution Model

Per Project Constitution v2.1, this task list supports the agent orchestration model:

**Orchestrator Agent**: Controls phase transitions, validates checkpoints (T003, Phase 2 completion, T056, T057)

**Implementation Agent**: Coordinates subagent execution for each task group

**Subagents** (mapped to tasks):
- **SkillDesignSubagent**: T004-T009 (Skills layer)
- **TaskCreationSubagent**: T018, T020 (Create operations)
- **TaskViewSubagent**: T019, T021, T031 (View operations)
- **TaskUpdateSubagent**: T035, T037, T042, T044 (Update operations)
- **TaskCompletionSubagent**: T034, T036, T041, T043 (Complete operations)
- **TaskDeletionSubagent**: T045, T046, T048, T049 (Delete operations)
- **StateMutationSubagent**: T011-T017 (Storage service)
- **InputParsingSubagent**: T024, T038, T039, T047 (Input handling)
- **OutputRenderingSubagent**: T025-T027, T040 (Output formatting)

**Validation Agent**: T054, T055, T057 (Final validation tasks)

All tasks designed for autonomous agent execution per constitutional requirements.

---

**Total Tasks**: 57
**Parallel Tasks**: 21 (37% can run in parallel)
**User Story Breakdown**:
- Setup: 3 tasks
- Foundational: 14 tasks (blocks all stories)
- User Story 1 (P1): 16 tasks
- User Story 2 (P2): 11 tasks
- User Story 3 (P3): 5 tasks
- Polish: 8 tasks

**Suggested MVP Scope**: Complete through User Story 1 (T001-T033) for working add/view functionality
