---
id: 001
title: Global System Prompt Foundation
stage: constitution
date: 2026-01-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-phase2-web
user: User
command: Global System Prompt setup
labels: ["constitution", "global-rules", "authority", "sdd"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/GLOBAL_SYSTEM_PROMPT.md
  - .specify/GLOBAL_QUICK_REF.md
tests:
  - N/A (foundational rules, no tests)
---

## Prompt

create this Global System Prompt (ONE TIME)
👉 Ye sab se pehle set hota hai
👉 Ye har agent par automatically apply hota hai
Claude Code me usually ye is tarah hota hai:
Ya to project ke root me
Ya Claude Code ke system config me
Ya first instruction ke taur par
Tum isko ek dafa paste karte ho:

You are an AI agent operating under a strict Spec-Driven Development system.

Authority order:
Constitution > Specify > Plan > Tasks > Implement

Rules:
- Execute only the active Task ID
- No manual coding unless explicitly instructed
- No assumptions
- Stop if anything is unclear
- No vibe coding
✅ Ye /agents ka part nahi
✅ Ye global brain rules hain

## Response snapshot

Created the foundational Global System Prompt that applies to ALL agents in the project:

**Files Created:**

1. `.specify/GLOBAL_SYSTEM_PROMPT.md` - Complete Global System Prompt
   - Authority hierarchy (Constitution > Spec > Plan > Tasks > Implement)
   - Core operating rules (5 fundamental rules)
   - Decision framework for all actions
   - Compliance gates before implementation
   - Error handling procedures
   - Scope boundaries (IN/OUT of scope)
   - PHR creation requirements
   - Agent-specific rules (System Architect, Backend, Frontend, etc.)
   - Prohibited patterns (vibe coding examples)
   - Quality gates before task completion
   - Emergency stop conditions

2. `.specify/GLOBAL_QUICK_REF.md` - Quick Reference Card
   - Decision framework (5 questions before ANY action)
   - Emergency stop conditions
   - Authority hierarchy visualization
   - IN/OUT scope checklist
   - Compliance gates
   - PHR location structure
   - Skills library reference
   - Prohibited pattern examples
   - Quality gates checklist
   - What to do when stuck

**Key Principles Established:**

| Principle | Rule |
|-----------|------|
| Task Execution | Execute ONLY the active Task ID from tasks.md |
| No Manual Coding | All code generated through agent prompts |
| No Assumptions | Stop and ask when unclear |
| Stop on Uncertainty | Uncertainty = Stop condition |
| No Vibe Coding | Only do what Task ID explicitly requires |

**Authority Hierarchy (Immutable):**
```
Constitution > Specify > Plan > Tasks > Implement
     ↓           ↓        ↓      ↓        ↓
   Supreme    Feature   Design   Code    Execution
```

## Outcome

- ✅ Impact: Established supreme authority rules that govern all agent behavior
- 🧪 Tests: N/A (foundational rules, not testable code)
- 📁 Files: 2 foundational prompt files created
- 🔁 Next prompts: All agents will load this prompt first, before any agent-specific instructions
- 🧠 Reflection: This is the "supreme document" - overrides all agent-specific prompts. Loaded FIRST in execution chain.

## Implementation Notes

**Where this applies:**
- Automatically applies to all agents (System Architect, Backend, Frontend, Supabase, SDD Executor)
- Loaded before any agent-specific instructions
- Cannot be overridden by lower-level prompts
- Amendments require explicit human approval

**How agents use this:**
1. Load GLOBAL_SYSTEM_PROMPT.md first
2. Load agent-specific prompts (subordinate to global)
3. Execute tasks following authority hierarchy
4. Create PHR after every interaction

**Decision Framework (5 Questions):**
```
1. Active Task ID exists? ──NO──→ STOP
2. Action matches Task scope? ──NO──→ STOP
3. Specified in Spec/Plan/Tasks? ──NO──→ STOP
4. Making assumptions? ──YES──→ STOP
5. Vibe coding? ──YES──→ STOP
```

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (foundational rules)
- Prompt variant (if applicable): N/A
- Next experiment: Monitor agent compliance during Phase 2 implementation via `/sp.implement`

---

## Authority Reference

This prompt is now the **SUPREME** authority in the project.

All agent-specific instructions in `.claude/agents/` are subordinate to this global prompt.

**Version**: 1.0.0
**Authority**: SUPREME (overrides all agent-specific prompts)
**Amendment**: Requires explicit human approval

---

## Quick Reference for Agents

**EMERGENCY STOP if:**
- No clear Task ID
- Ambiguous requirements
- "Fix something real quick"
- Making assumptions
- Vibe coding detected

**COMPLIANCE GATES (all must pass):**
✓ Constitutional?
✓ Spec-aligned?
✓ Plan-compliant?
✓ Task-validated?
✓ No assumptions?

**PHR CREATION:**
Location: `history/prompts/`
- constitution/ ← Constitution prompts
- <feature>/ ← Feature-specific
- general/ ← Uncategorized

**SKILLS LIBRARY:**
- `.specify/skills/jwt-auth-skill.md` ← JWT verification
- `.specify/skills/supabase-schema-builder-skill.md` ← Database schemas
- `.specify/skills/crud-pattern-skill.md` ← Service layer
