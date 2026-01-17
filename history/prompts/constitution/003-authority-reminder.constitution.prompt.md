---
id: 003
title: Authority Reminder Document
stage: constitution
date: 2026-01-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-phase2-web
user: User
command: Authority Reminder setup
labels: ["authority", "hierarchy", "decision-making"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/AUTHORITY_REMINDER.md
tests:
  - N/A (reference document, no tests)
---

## Prompt

create this Authority Reminder

Constitution > Specify > Plan > Tasks > Agents > Implement

## Response snapshot

Created the Authority Reminder document - a visual, prominently displayed hierarchy reference.

**File Created**: `.specify/AUTHORITY_REMINDER.md`

**Purpose**: Reinforce the immutable chain of command for all decision-making.

**Key Visual Hierarchy:**

```
Constitution > Specify > Plan > Tasks > Agents > Implement
     ↓           ↓        ↓      ↓       ↓         ↓
   SUPREME   Feature  Design  Code  Execute  Build
```

**Chain of Command Diagram:**
```
📜 Constitution (Supreme Authority)
      ↓
📋 Specify (Feature Requirements)
      ↓
🏗️ Plan (Architecture Decisions)
      ↓
✅ Tasks (Implementation Tasks)
      ↓
🤖 Agents (Execution)
      ↓
🔨 Implement (Code)
```

**Key Sections:**

1. **The Chain of Command** - Visual hierarchy showing each level and its purpose
2. **What This Means** - Correct vs. incorrect decision-making examples
3. **When Executing Tasks** - 5-step checklist following the hierarchy
4. **Conflict Resolution** - How to resolve conflicts (higher authority wins)
5. **Quick Decision Tree** - Which document to follow in any situation
6. **Visual Summary** - Tree diagram of override relationships

**Decision Tree:**
```
Is it in Constitution? → YES → Follow Constitution
                     → NO  → Check Spec

Is it in Spec?        → YES → Follow Spec
                     → NO  → Check Plan

Is it in Plan?        → YES → Follow Plan
                     → NO  → Check Tasks

Is it in Tasks?       → YES → Follow Tasks
                     → NO  → STOP (not specified)
```

**Core Principle:**
> **This order is NON-NEGOTIABLE**
> - Constitution overrides everything
> - Spec overrides Plan, Tasks, Agents
> - Plan overrides Tasks, Agents
> - Tasks overrides Agents, Implementation
> - No level can override a higher level

**In Case of Doubt:**
1. Read the Constitution
2. Read the Spec
3. Read the Plan
4. Read the Tasks
5. Ask for clarification

## Outcome

- ✅ Impact: Created visual reference for authority hierarchy
- 🧪 Tests: N/A (reference document, not testable)
- 📁 Files: 1 authority reminder document created
- 🔁 Next prompts: All agents reference this when making decisions
- 🧠 Reflection: This serves as a quick "at a glance" reminder of the chain of command

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (reference document)
- Prompt variant (if applicable): N/A
- Next experiment: Display this prominently in agent context

---

## Visual Hierarchy Summary

```
Constitution
  │ Overrides everything
  │
  ├─── Spec
  │     │ Overrides Plan, Tasks, Agents
  │     │
  │     ├─── Plan
  │     │     │ Overrides Tasks, Agents
  │     │     │
  │     │     ├─── Tasks
  │     │     │     │ Overrides Agents, Implementation
  │     │     │     │
  │     │     │     ├─── Agents
  │     │     │     │     │ Execute what Tasks specify
  │     │     │     │     │
  │     │     │     │     └─── Implement
  │     │     │     │           Build the code
  │     │     │     │
  │     │     │     └───────────────────┘
  │     │     └───────────────────────────┘
  │     └─────────────────────────────────┘
  └───────────────────────────────────────┘
```

---

## Conflict Resolution Example

```
Question: Which document do I follow?

Answer: The HIGHEST one in the chain

Example:
- Plan.md says "use PostgreSQL"
- Constitution says "use Supabase"
→ Follow Constitution (it's higher)
```

---

## Remember

**Higher authority ALWAYS wins**

**No level can override a higher level**

**In doubt: Ask, don't assume**

---

## Authority Reference

This document is a visual reminder of the hierarchy defined in:
- `.specify/GLOBAL_SYSTEM_PROMPT.md` (Supreme authority)

**Version**: 1.0.0
**Authority**: Reminder of hierarchy
**Amendment**: Requires explicit human approval

---

## Related Documents

- `.specify/GLOBAL_SYSTEM_PROMPT.md` ← Supreme authority
- `.specify/memory/constitution.md` ← The Constitution itself
- `.specify/AGENT_EXECUTION_RULE.md` ← Task execution flow
- `.specify/AUTHORITY_REMINDER.md` ← This document

---

## Quick Reference for Agents

**Before ANY Decision:**

```
1. Check Constitution first
2. Check Spec second
3. Check Plan third
4. Check Tasks fourth
5. Execute fifth
```

**Decision Rule:**

```
Is it specified?
  ├─ YES → Follow the highest authority that specifies it
  └─ NO  → STOP and ask
```

**Conflict Rule:**

```
Multiple sources say different things?
  → Follow the HIGHEST authority
```

---

**Print this. Keep it visible.**
**Reference it before EVERY decision.**
