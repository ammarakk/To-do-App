# AGENT EXECUTION RULE
**Task Flow Control & Validation**

---

## CORE EXECUTION RULES

### Rule 1: ONLY ONE TASK ACTIVE AT A TIME

**Policy**: Single-threaded task execution. No parallel tasks.

```
┌─────────────────────────────────────────┐
│  Task A: IN_PROGRESS                    │  ← Only ONE task here
├─────────────────────────────────────────┤
│  Task B: pending                        │
│  Task C: pending                        │
│  Task D: pending                        │
└─────────────────────────────────────────┘
```

**What This Means:**
- Agent picks ONE task from `tasks.md`
- Marks it as `in_progress`
- Completes it fully
- Marks it as `completed`
- ONLY THEN moves to next task

**Prohibited:**
- ❌ Marking multiple tasks as `in_progress` simultaneously
- ❌ Starting Task B while Task A is still `in_progress`
- ❌ Working on tasks without updating status in `tasks.md`
- ❌ Leaving tasks in `in_progress` state when switching context

**Required Flow:**
```
1. Select Task ID
2. Verify dependencies are completed
3. Mark Task as "in_progress" in tasks.md
4. Execute Task
5. Verify Task completion (tests pass)
6. Mark Task as "completed" in tasks.md
7. ONLY THEN → Select next Task
```

---

### Rule 2: AGENT MUST REFERENCE TASK ID IN OUTPUT

**Policy**: Every agent action must explicitly reference the Task ID.

**Required in ALL Output:**

```python
# ✅ CORRECT - Task ID clearly referenced
"""
📋 TASK: TODO-001 (Create todo CRUD endpoints)

Status: in_progress → completed

Actions Taken:
1. Created POST /api/todos endpoint
2. Added JWT dependency for authentication
3. Implemented input validation via Pydantic

Files Modified:
- backend/src/api/routes/todos.py

Task Completion Verified: ✅
- All endpoints return 200/201
- JWT auth enforced
- Tests passing

Task TODO-001 marked as completed.
"""
```

```python
# ❌ WRONG - No Task ID reference
"""
I created the todo endpoints today.

Also added some validation and tests.

Everything looks good!
"""
```

**Required Format:**

**For EVERY action taken:**
```
📋 TASK: <TASK_ID> (<Task Title>)
Status: <pending|in_progress|completed>

Description: <What was done>

Files Modified:
- <file_path_1>
- <file_path_2>

Task Completion Verified: <✅|❌>
```

**For EVERY output message:**
```
[Task ID: XXX-XXX] Your message here
```

---

### Rule 3: SYSTEM ARCHITECT AGENT VALIDATES BEFORE MOVING ON

**Policy**: System Architect Agent must validate all work before task completion.

**Validation Gate:**

```
┌─────────────────────────────────────────┐
│  Task Execution (Any Agent)             │
└─────────────────┬───────────────────────┘
                  │ Task marked "completed"
                  ↓
┌─────────────────────────────────────────┐
│  System Architect Agent Validation      │  ← REQUIRED CHECKPOINT
│  ├─ Constitution compliance?            │
│  ├─ Spec alignment?                     │
│  ├─ Plan compliance?                    │
│  ├─ Tests passing?                      │
│  └─ No scope violations?                │
└─────────────────┬───────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ❌ FAIL             ✅ PASS
         │                 │
         ↓                 ↓
   Return to agent    Mark task
   for fixes          as completed
```

**System Architect Validation Checklist:**

```markdown
## Validation Report for Task: <TASK_ID>

### Constitution Compliance
- [ ] Prompt-only development followed
- [ ] No manual coding detected
- [ ] No assumptions made
- [ ] Authority hierarchy respected

### Spec Alignment
- [ ] Feature matches spec.md requirements
- [ ] No missing functionality
- [ ] No scope creep detected

### Plan Compliance
- [ ] Architecture matches plan.md
- [ ] Technology stack correct (FastAPI, Next.js, Supabase)
- [ ] Design patterns followed

### Quality Gates
- [ ] All tests passing
- [ ] Code properly typed
- [ ] Error handling implemented
- [ ] Documentation updated

### Security
- [ ] User isolation enforced
- [ ] JWT auth on protected routes
- [ ] RLS policies enabled (if DB changes)
- [ ] No hardcoded secrets

### Validation Result
✅ PASS - Task approved for completion
OR
❌ FAIL - Issues found:
  - <list of issues>

Action: <Mark completed|Return for fixes>
```

---

## TASK EXECUTION WORKFLOW

### Complete Flow Diagram

```
┌─────────────────────────────────────────┐
│  1. SELECT TASK                         │
│     - Read tasks.md                     │
│     - Find next pending task            │
│     - Verify dependencies completed     │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  2. CLAIM TASK                          │
│     - Mark as "in_progress"             │
│     - Add agent name                    │
│     - Add start timestamp               │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. EXECUTE TASK                        │
│     - Reference Task ID in all output   │
│     - Follow task requirements exactly  │
│     - Stop if unclear                   │
│     - Document work                     │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  4. SELF-VERIFY                         │
│     - Did I complete Task requirements? │
│     - Are tests passing?                │
│     - Is code clean?                    │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  5. REQUEST VALIDATION                  │
│     - Call System Architect Agent       │
│     - Submit work for review            │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  6. SYSTEM ARCHITECT VALIDATION         │
│     - Check constitution compliance     │
│     - Check spec alignment              │
│     - Check quality gates               │
└─────────────────┬───────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ❌ FAIL             ✅ PASS
         │                 │
         ↓                 ↓
   Return to Step 3    Mark completed
   with feedback       in tasks.md
         │                 │
         └─────────┬───────┘
                   ↓
┌─────────────────────────────────────────┐
│  7. TASK COMPLETE                       │
│     - Mark as "completed"               │
│     - Add completion timestamp          │
│     - Create PHR                        │
│     - Move to next task                 │
└─────────────────────────────────────────┘
```

---

## TASK STATUS IN TASKS.MD

### Required Task Status Format

```markdown
## Tasks

### Phase 2.1 - Backend Foundation

- [ ] TODO-001: Create FastAPI project structure
  - Status: pending
  - Agent: None
  - Dependencies: None

- [ ] TODO-002: Define Pydantic schemas
  - Status: in_progress  ← Agent updates this
  - Agent: backend-fastapi-implementation
  - Started: 2026-01-17 10:00 UTC
  - Dependencies: TODO-001

- [ ] TODO-003: Implement error handling
  - Status: pending
  - Dependencies: TODO-002
```

### Status Values

| Status | Meaning | Who Sets |
|--------|---------|----------|
| `pending` | Task not started | System |
| `in_progress` | Agent actively working | Agent (when starting) |
| `completed` | Task finished & validated | System Architect (after validation) |
| `blocked` | Cannot proceed (dependency issue) | System Architect |

---

## AGENT HANDOFF PROTOCOL

### When Switching Agents

```markdown
## Task Handoff: TODO-XXX

**From Agent**: backend-fastapi-implementation
**To Agent**: system-architect-validator
**Task ID**: TODO-XXX

### Work Completed
1. Created FastAPI project structure
2. Defined Pydantic schemas
3. Implemented error handling

### Files Modified
- backend/src/main.py
- backend/src/models/schemas.py
- backend/src/api/exceptions.py

### Tests Status
✅ All tests passing (15/15)

### Request
Please validate this work against:
- Constitution compliance
- spec.md alignment
- plan.md architecture

### Next Action
If validated → Mark task as completed
If issues found → Return with feedback
```

---

## ENFORCEMENT MECHANISMS

### 1. Automated Checks

Before marking task as `in_progress`:
```python
# Check if another task is already in_progress
active_tasks = get_tasks_with_status("in_progress")
if len(active_tasks) > 0:
    raise TaskExecutionError(
        f"Cannot start task. Another task is in progress: {active_tasks[0].id}"
    )
```

### 2. Task ID Required

Before any agent action:
```python
# Verify Task ID is present
if "task_id" not in context:
    raise TaskExecutionError(
        "Task ID required. Please specify which task you are working on."
    )
```

### 3. Validation Gate

Before marking task as `completed`:
```python
# Require System Architect validation
if not system_architect_validated(task_id):
    raise TaskExecutionError(
        "Task must be validated by System Architect Agent before completion."
    )
```

---

## ERROR SCENARIOS

### What If...?

**Scenario 1: Agent tries to work on 2 tasks simultaneously**
```
❌ DETECTED: Agent has TODO-001 and TODO-002 both marked "in_progress"
🛑 ACTION: Block execution. Force agent to complete TODO-001 first.
```

**Scenario 2: Agent works without referencing Task ID**
```
❌ DETECTED: Agent output does not contain Task ID reference
🛑 ACTION: Reject output. Require agent to re-submit with Task ID.
```

**Scenario 3: Agent marks task complete without validation**
```
❌ DETECTED: Task TODO-XXX marked "completed" without System Architect review
🛑 ACTION: Revert status to "in_progress". Trigger validation gate.
```

**Scenario 4: Task fails validation**
```
❌ DETECTED: System Architect found constitution violation
🛑 ACTION: Keep task "in_progress". Return to agent with feedback.
   Agent must fix issues before re-validation.
```

---

## EXAMPLE: PROPER TASK EXECUTION

```markdown
📋 TASK: TODO-001 (Create FastAPI project structure)

Status: in_progress

Agent: backend-fastapi-implementation
Started: 2026-01-17 10:00 UTC

### Actions Taken

1. ✅ Created backend/ directory structure
2. ✅ Initialized pyproject.toml with dependencies
3. ✅ Created main.py with FastAPI app
4. ✅ Added health check endpoint
5. ✅ Configured CORS middleware

### Files Created
- backend/pyproject.toml
- backend/src/main.py
- backend/src/api/__init__.py
- backend/.env.example

### Task Requirements Verification
- [x] FastAPI project initialized
- [x] Project structure created (backend/src/ hierarchy)
- [x] Health check endpoint implemented
- [x] CORS configured

### Tests
Running: `pytest backend/tests/`
Result: 5 tests passing ✅

### Requesting Validation
@system-architect-validator - Please validate task TODO-001

---
[Task TODO-001: Self-verification complete, awaiting System Architect validation]
```

---

## VALIDATION REPORT EXAMPLE

```markdown
## System Architect Validation Report

**Task**: TODO-001 (Create FastAPI project structure)
**Agent**: backend-fastapi-implementation
**Date**: 2026-01-17 11:00 UTC

### Constitution Compliance ✅
- [x] Prompt-only development followed
- [x] No manual coding detected
- [x] Technology stack correct (FastAPI, Python 3.13+)
- [x] No assumptions made

### Spec Alignment ✅
- [x] Matches spec.md requirements
- [x] Phase 2.1 deliverables complete
- [x] No scope creep detected

### Plan Compliance ✅
- [x] Architecture matches plan.md
- [x] Project structure correct
- [x] Dependencies defined correctly

### Quality Gates ✅
- [x] All tests passing (5/5)
- [x] Code properly typed
- [x] Error handling configured
- [x] CORS middleware implemented

### Security ✅
- [x] Environment variables configured
- [x] No hardcoded secrets
- [x] .env.example provided

### Validation Result
**✅ PASS - Task approved for completion**

**Action**: Mark TODO-001 as "completed" in tasks.md

**Next Task**: TODO-002 (Define Pydantic schemas)
**Dependencies**: TODO-001 ✅ Complete - Safe to proceed
```

---

## SUMMARY

### Three Immutable Rules

| Rule | Requirement | Enforcement |
|------|------------|-------------|
| **1. One Task Active** | Only one task in `in_progress` at a time | Automated check blocks parallel tasks |
| **2. Reference Task ID** | All output must include Task ID | Output rejected without Task ID |
| **3. Architect Validates** | System Architect must approve completion | Task cannot complete without validation |

### Execution Flow

```
Select → Claim → Execute → Self-Verify → Request Validation → Architect Validates → Complete
```

### Key Principle

**Single-threaded. Sequential. Validated. Every step.**

---

**Version**: 1.0.0
**Authority**: Subordinate to GLOBAL_SYSTEM_PROMPT.md
**Amendment**: Requires explicit human approval
