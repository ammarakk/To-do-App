---
id: 002
title: Agent Execution Rule - Task Flow Control
stage: constitution
date: 2026-01-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-phase2-web
user: User
command: Agent Execution Rule setup
labels: ["execution", "tasks", "validation", "workflow"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/AGENT_EXECUTION_RULE.md
tests:
  - N/A (process rules, no tests)
---

## Prompt

create this . Agent Execution Rule
Only ONE task active at a time
Agent must reference Task ID in output
System Architect Agent validates before moving on

## Response snapshot

Created the Agent Execution Rule document that governs task flow control:

**File Created**: `.specify/AGENT_EXECUTION_RULE.md`

**Three Core Rules Established:**

1. **Only ONE Task Active At A Time**
   - Single-threaded task execution
   - Agent marks task as `in_progress` → completes → marks `completed`
   - Only THEN moves to next task
   - Prohibited: Multiple tasks in `in_progress` simultaneously

2. **Agent Must Reference Task ID In Output**
   - All agent output must explicitly include Task ID
   - Required format: `📋 TASK: <TASK_ID> (<Title>)`
   - Output without Task ID reference is rejected

3. **System Architect Agent Validates Before Moving On**
   - Validation checkpoint before task completion
   - System Architect checks: Constitution, Spec, Plan, Quality, Security
   - Task cannot be marked `completed` without validation approval

**Task Execution Workflow:**
```
Select → Claim → Execute → Self-Verify → Request Validation → Architect Validates → Complete
```

**Key Features:**
- Complete flow diagram showing task lifecycle
- Task status format for tasks.md
- Agent handoff protocol
- Enforcement mechanisms (automated checks)
- Error scenarios with resolution
- Example of proper task execution
- Validation report template

**Enforcement:**
- Automated checks prevent parallel task execution
- Task ID required before any agent action
- Validation gate required before completion
- Failed validation returns task to agent for fixes

## Outcome

- ✅ Impact: Established sequential, validated task execution flow
- 🧪 Tests: N/A (process rules, not testable code)
- 📁 Files: 1 execution rule document created
- 🔁 Next prompts: All agents must follow this rule when executing tasks from tasks.md
- 🧠 Reflection: This rule enforces the "one thing at a time, done properly" principle from the constitution

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (process rules)
- Prompt variant (if applicable): N/A
- Next experiment: Monitor task execution compliance during Phase 2 implementation

---

## Three Immutable Rules

| Rule | Requirement | Enforcement |
|------|------------|-------------|
| **1. One Task Active** | Only one task in `in_progress` at a time | Automated check blocks parallel tasks |
| **2. Reference Task ID** | All output must include Task ID | Output rejected without Task ID |
| **3. Architect Validates** | System Architect must approve completion | Task cannot complete without validation |

---

## Execution Flow Summary

```
1. SELECT TASK → Verify dependencies
2. CLAIM TASK → Mark as "in_progress"
3. EXECUTE TASK → Reference Task ID in all output
4. SELF-VERIFY → Tests passing?
5. REQUEST VALIDATION → Call System Architect
6. ARCHITECT VALIDATES → Constitution/Spec/Plan/Quality/Security
7. TASK COMPLETE → Mark as "completed" (only after validation)
```

---

## Task Status Values

| Status | Meaning | Who Sets |
|--------|---------|----------|
| `pending` | Task not started | System |
| `in_progress` | Agent actively working | Agent (when starting) |
| `completed` | Task finished & validated | System Architect (after validation) |
| `blocked` | Cannot proceed (dependency issue) | System Architect |

---

## Key Principle

**Single-threaded. Sequential. Validated. Every step.**

---

## Authority Reference

This document is subordinate to `.specify/GLOBAL_SYSTEM_PROMPT.md`

**Version**: 1.0.0
**Authority**: Subordinate to GLOBAL_SYSTEM_PROMPT.md
**Amendment**: Requires explicit human approval

---

## Related Documents

- `.specify/GLOBAL_SYSTEM_PROMPT.md` ← Supreme authority
- `.specify/memory/constitution.md` ← Project constitution
- `.specify/AGENT_EXECUTION_RULE.md` ← This document

---

## Quick Reference for Agents

**Before Starting Task:**
- [ ] Check if another task is `in_progress`
- [ ] Verify dependencies are `completed`
- [ ] Mark task as `in_progress` in tasks.md

**During Execution:**
- [ ] Include Task ID in ALL output: `[Task ID: XXX-XXX]`
- [ ] Follow task requirements exactly
- [ ] Stop if unclear, ask questions

**Before Completing:**
- [ ] Verify task requirements met
- [ ] Run tests - all passing?
- [ ] Call System Architect Agent for validation

**After Validation:**
- [ ] If PASS → Mark task as `completed`
- [ ] If FAIL → Fix issues, re-request validation

**Only Then:**
- [ ] Select next task
