---
id: 001
title: Ratify Project Constitution
stage: constitution
date: 2025-12-31
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: Ammar Ahmed Khan
command: /sp.constitution
labels: ["constitution", "governance", "phase-i", "sdd"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

```text
/sp.constitution

# PROJECT CONSTITUTION
AI-Native, Agent-Orchestrated, Spec-Driven Todo Evolution Project

Version: 2.1
Status: Phase I Active
Primary AI Engine: Claude Code
Development Method: Spec-Driven Development (SDD)
Execution Model: Agent / Subagent / Skill–Only Construction

---

## 1. Purpose

This constitution defines the immutable rules, structure, and execution workflow of the project.

This project is 100% AI-agent–constructed, meaning:
- No direct monolithic AI outputs
- No ad-hoc code generation
- No human-written implementation logic

All work is performed through Claude Code agents, subagents, and reusable skills.

This document is the single source of truth.

---

## 2. Core Rules

### 2.1 Spec First (Absolute Rule)
- No code is written or generated without an approved spec
- Specs must be written in Markdown
- Specs live in /specs
- Specs are produced only by the Spec Agent
- Implementation without a spec is forbidden

### 2.2 Agent-Only Execution (Mandatory)
- All project work must be performed by agents
- Claude Code must never:
  - Generate code directly in a single response
  - Bypass agents, subagents, or skills
- Every output must be traceable to:
  - An agent
  - One or more subagents
  - One or more reusable skills

Direct AI-to-code generation is forbidden.

### 2.3 Phase Locking
- Only one phase may be active at a time
- Completed phases are locked permanently
- Past phases cannot be edited
- Changes require:
  - A new phase, or
  - A migration spec

### 2.4 AI Discipline
- Claude Code must not assume requirements
- Claude Code must stop and ask when unclear
- Partial, stubbed, or placeholder implementations are forbidden
- Every decision must be spec-backed

### 2.5 Human Role
- Human acts as System Architect & Authority
- Human approves:
  - Specs
  - Phase transitions
  - Validation outcomes
- Claude Code acts as Executor only

---

## 3. Phase Governance

### 3.1 Phase Lifecycle (Agent-Enforced)
1. Orchestrator Agent loads phase rules
2. Spec Agent produces specs
3. Implementation Agent coordinates subagents
4. Validation Agent verifies output
5. Orchestrator Agent locks phase

### 3.2 Phase Status
- Phase I: Active
- Phase II–V: Defined but Locked

---

## 4. Phase Overview

Phase I  – In-Memory Python Console App
Phase II – Full-Stack Web Application
Phase III – AI-Powered Chatbot
Phase IV – Local Kubernetes Deployment
Phase V  – Cloud-Native Deployment

Only Phase I rules apply currently.

---

## 5. Phase I Constitution (Active)

### 5.1 Scope
- Python console application
- In-memory data only
- No database
- No web frontend
- No authentication
- No AI chatbot

### 5.2 Allowed Features
- Add task
- Update task
- Delete task
- View tasks
- Mark task as complete

### 5.3 Forbidden
- Web frameworks
- Databases
- External APIs
- Frontend UI
- Docker or Kubernetes
- Cloud services
- AI features

---

## 6. Three-Tier Architecture (Conceptual)

### Presentation Tier
- Console input/output only
- Handled by Presentation Subagents

### Application Tier
- Business logic
- Validation
- Task lifecycle rules
- Handled by Logic Subagents and Skills

### Data Tier
- In-memory structures only
- Handled by State Subagents

---

## 7. Claude Code Agent Architecture

### 7.1 Core Agents

Orchestrator Agent
- Reads and enforces this constitution
- Loads active phase
- Delegates work
- Stops execution on violations

Spec Agent
- Produces specs only
- No code generation

Implementation Agent
- Coordinates subagents and skills
- Assembles implementation from reusable units

Validation Agent
- Verifies spec compliance
- Verifies phase compliance
- Approves or rejects completion

---

## 8. Subagents

### 8.1 Rules
- Stateless
- Single responsibility
- Reusable across phases
- Perform all concrete work

Examples:
- TaskCreationSubagent
- TaskUpdateSubagent
- InputParsingSubagent
- StateMutationSubagent
- OutputRenderingSubagent

Subagents must not own state or make architectural decisions.

---

## 9. Skills

### 9.1 Rules
- Pure and deterministic
- Phase-agnostic
- Reusable across projects
- Callable only by agents or subagents

Examples:
- ValidateTaskFields
- NormalizeConsoleInput
- EnforcePhaseRules
- FormatTaskOutput
- CheckSpecCompleteness

---

## 10. Reusability Enforcement

- All agents, subagents, and skills must be reusable
- No hardcoded, one-off logic allowed
- Reusable logic must be implemented as skills

---

## 11. Claude Code Continuity Rules

### 11.1 State Persistence

.ai_state/state.json must store:
- Active phase
- Current spec
- Agent execution checkpoints
- Validation results

### 11.2 Resume Rule
If execution stops:
- User types: continue
- Orchestrator Agent resumes from last checkpoint
- No duplication
- No resets
- Locked steps remain locked

---

## 12. Environment Rules

### .env Policy
- .env required
- .env.example required
- No secrets committed

### Local-First Rule
- Must run locally
- Docker forbidden until Phase IV
- Cloud forbidden until Phase V

---

## 13. Repository Structure

/
├── README.md
├── docs/
│   ├── constitution.md
│   ├── architecture.md
│   └── phases.md
├── specs/
├── agents/
├── subagents/
├── skills/
├── backend/
├── frontend/
└── .ai_state/

---

## 14. Git Workflow

- Single branch: main
- No feature branches
- Each completed phase is tagged

Example:
phase-1-complete

---

## 15. Out of Scope

- Code
- Agent prompts
- API keys
- Secrets
- Phase specs
- Experiments

---

## 16. Authority

If any tool, framework, tutorial, or AI suggestion conflicts with this constitution, this constitution overrides everything.

---

## 17. Status

Phase I: Active
Phase II–V: Defined and Locked

End of Constitution
```

## Response snapshot

Constitution successfully ratified and written to `.specify/memory/constitution.md`.

**Version**: 2.1.0 (initial ratification)
**Date**: 2025-12-31

The constitution defines:
- 5 Core Principles (Spec First, Agent-Only Execution, Phase Locking, AI Discipline, Human Role)
- Phase I governance (In-Memory Python Console App)
- Agent architecture (Orchestrator, Spec, Implementation, Validation)
- Subagent and Skill rules for reusability
- Repository structure and git workflow
- Environment rules and state persistence

All placeholders in the template have been replaced with concrete values. A Sync Impact Report has been prepended to the constitution file documenting the initial ratification.

Templates flagged for review:
- plan-template.md
- spec-template.md
- tasks-template.md
- command files in .specify/templates/commands/

## Outcome

- ✅ Impact: Initial constitution ratified, establishing governance for AI-Native Todo Evolution Project
- 🧪 Tests: N/A (documentation change)
- 📁 Files: 1 file created (.specify/memory/constitution.md)
- 🔁 Next prompts: Review and update dependent templates (plan, spec, tasks) to align with constitution principles; Begin Phase I feature specification using /sp.specify
- 🧠 Reflection: Constitution successfully transformed from template to concrete governance document. All principles are declarative and testable. Version 2.1.0 reflects initial ratification. Templates need review to ensure alignment with agent-only execution and phase locking principles.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation PASS - no unresolved placeholders, semantic versioning followed, dates in ISO format, principles are declarative
- Prompt variant (if applicable): N/A (initial constitution)
- Next experiment (smallest change to try): Monitor template consistency during first spec/plan/tasks generation to identify any constitution misalignments
