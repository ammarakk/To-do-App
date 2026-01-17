# GLOBAL SYSTEM PROMPT - QUICK REFERENCE
**Print this. Keep it visible. Refer to it often.**

---

## 🚦 DECISION FRAMEWORK (Before ANY Action)

```
1. Active Task ID exists? ──NO──→ STOP
2. Action matches Task scope? ──NO──→ STOP
3. Specified in Spec/Plan/Tasks? ──NO──→ STOP
4. Making assumptions? ──YES──→ STOP
5. Vibe coding? ──YES──→ STOP
```

---

## ⛔ EMERGENCY STOP (Immediately Halt If)

- No clear Task ID
- Ambiguous requirements after asking
- "Fix something real quick"
- "This would be nice to add"
- Refactoring outside task scope
- Making assumptions to proceed
- Violating authority hierarchy

---

## 📋 AUTHORITY HIERARCHY (Immutable)

```
Constitution > Specify > Plan > Tasks > Implement
     ↑           ↑        ↑      ↑        ↑
  Supreme    Feature  Design   Code   Execute
```

**Lower levels CANNOT override higher levels.**

---

## ✅ IN SCOPE (What You SHOULD Do)

- Execute active Task ID exactly as specified
- Follow authority hierarchy strictly
- Ask clarifying questions when uncertain
- Reference Constitution/Spec/Plan/Tasks
- Document what you did and why
- Stop when scope is reached

---

## ❌ OUT OF SCOPE (What You MUST NOT Do)

- Work without a Task ID
- Expand scope beyond Task ID
- Make assumptions about requirements
- Refactor unrelated code
- Add "nice to have" features
- Fix "issues" not in task
- Skip validation gates
- Proceed with unclear requirements

---

## 🔐 COMPLIANCE GATES (Must Pass ALL)

```
✓ Constitutional?
✓ Spec-aligned?
✓ Plan-compliant?
✓ Task-validated?
✓ No assumptions?
```

**ALL gates must PASS → Proceed**

---

## 📝 EVERY PROMPT CREATES A PHR

**Location**: `history/prompts/`

**Structure**:
```
history/prompts/
├── constitution/     ← Constitution prompts
├── <feature>/        ← Feature-specific
└── general/          ← General/uncategorized
```

**Required Fields**:
- ID, Title, Stage, Date
- User prompt (verbatim)
- Response summary
- Outcome, Files, Next steps

---

## 🎯 SKILLS LIBRARY (Reusable Components)

### JWT Auth Skill
- Location: `.specify/skills/jwt-auth-skill.md`
- Use for: Authentication, token verification

### Schema Builder Skill
- Location: `.specify/skills/supabase-schema-builder-skill.md`
- Use for: Database tables, RLS policies

### CRUD Pattern Skill
- Location: `.specify/skills/crud-pattern-skill.md`
- Use for: Service layer, validation

---

## 🚫 PROHIBITED PATTERNS

### ❌ Don't:
```python
# "While I'm here, let me also..."
# "This pattern is better, let me refactor..."
# "I think user probably wants..."
# "Let me add this just in case..."
```

### ✅ Do:
```python
# Execute ONLY what Task ID specifies
# Ask if unclear
# Stop when done
# Document the work
```

---

## 🧪 QUALITY GATES (Before Complete)

- [ ] Matches Task ID exactly?
- [ ] Follows Constitution?
- [ ] Specified in spec.md?
- [ ] Architected in plan.md?
- [ ] No assumptions made?
- [ ] No vibe coding?
- [ ] PHR created?

---

## 📞 WHEN STUCK

1. **Check authority hierarchy** (Constitution > Spec > Plan > Task)
2. **Read the Task ID** carefully
3. **Ask 2-3 targeted questions**
4. **Wait for response**
5. **Document clarification**

**Never guess. Never assume.**

---

## 🎓 REMEMBER

**This is the foundation.**

- Constitution is supreme
- Spec defines features
- Plan defines architecture
- Tasks define implementation
- You execute ONLY what's specified

**No shortcuts. No assumptions. No vibe coding.**

---

**Print this. Keep it on your desk.**
