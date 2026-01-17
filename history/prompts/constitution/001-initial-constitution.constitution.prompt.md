---
id: 001
title: Initial Constitution Ratification
stage: constitution
date: 2026-01-16
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: ammarakk
command: /sp.constitution update
labels: ["constitution","governance","fastapi","supabase","sdd"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - N/A (constitution update, no code changes)
---

## Prompt

update Here is the updated **`speckit.constitution`** reflecting your specific requirements: integrating **FastAPI**, using **Supabase** (Database, Auth, and PostgreSQL), and focusing strictly on a **prompts-driven** workflow without unnecessary extra MCP tools.

***

# **speckit.constitution**

## **1. Core Mission & Development Philosophy**
*   **Prompt-Only Development:** The engineer acts as a "System Architect". **No code is to be written manually** [1]. All implementation is driven through **System Prompts** and **Agent Prompts** that must be refined until the AI generates the correct output [1, 2].
*   **Spec-Driven Development (SDD):** All development follows the strict lifecycle: **Specify → Plan → Tasks → Implement** [3].
*   **Hierarchy of Truth:** Constitution > Specify > Plan > Tasks [4].

## **2. Mandatory Technology Stack**
*   **Backend:** **Python 3.13+** and **FastAPI** (RESTful API endpoints) [5, 6].
*   **Frontend:** **Next.js 16+** (App Router), TypeScript, and Tailwind CSS [5, 7].
*   **Database & Auth:** **Supabase** (PostgreSQL database, Supabase Auth for user isolation) [User Request].
*   **AI Agentic Stack:** Claude Code, Spec-Kit Plus, OpenAI Agents SDK, and Official MCP SDK [8, 9].
*   **Cloud Native:** Docker, Kubernetes (Minikube), Helm Charts, Kafka, and Dapr [8, 10, 11].

## **3. Project Phases (The Evolution of Todo)**
*   **Phase I: In-Memory Python Console App:** CLI-based CRUD (Add, Delete, Update, View, Mark Complete) stored in memory using `uv` and Python [12, 13].
*   **Phase II: Full-Stack Web Application:** Transition to a multi-user web app using **FastAPI** and **Supabase**. Replace in-memory storage with Supabase PostgreSQL and secure it with Supabase Auth [5, 14].
*   **Phase III: AI-Powered Todo Chatbot:** A conversational interface using the **OpenAI Agents SDK**. Use the **Official MCP SDK** to build stateless tools for task management [9, 15].
*   **Phase IV: Local Kubernetes Deployment:** Containerize the FastAPI/Next.js services and deploy to **Minikube** using **Helm Charts** and AIOps tools like **kubectl-ai** [16, 17].
*   **Phase V: Advanced Cloud Deployment:** Implement event-driven architecture with **Kafka** and **Dapr** for recurring tasks and reminders [18, 19].

## **4. Architecture of Intelligence (Prompts & Skills)**
*   **Agent Roles & Prompts**:
    *   **The Executor (Claude Code):** Follows the **System Prompt** to perform code changes based on validated Task IDs [3, 20].
    *   **Subagents:** Specialized AI instances spawned for domain-specific tasks (e.g., generating Supabase schemas or FastAPI routes) [21].
*   **Reusable Intelligence:**
    *   **Agent Skills:** Encapsulated capabilities like the **MCP Builder Skill** and **Cloud-Native Blueprints** [21, 22].
    *   **Stateless logic:** All agent prompts must ensure that the backend and MCP tools remain stateless, with all persistence handled by the **Supabase** database [23, 24].

## **5. Operational Constraints**
*   **No "Vibe Coding":** Agents must not improvise. If a prompt or spec is incomplete, the agent must stop and request clarification [3, 25].
*   **Task Identification:** Every implementation must be tied to a specific **Task ID** from `speckit.tasks` [3].
*   **Security:** All **FastAPI** routes must enforce user isolation, ensuring a user can only access their own data via authenticated Supabase sessions [6, 26].

***

### **How to Use This File**
Agents must re-read this **Constitution** before starting any task to ensure strict adherence to the **FastAPI** backend, **Supabase** infrastructure, and the **Prompts-only** development rule. Any suggestion for manual coding or using excluded technologies (like Neon) must be rejected.

## Response snapshot

Successfully created the initial constitution (v1.0.0) for the "Evolution of Todo" project with the following principles:

**Core Principles Established:**
1. **Prompt-Only Development** - No manual coding, all AI-driven
2. **Spec-Driven Development (SDD)** - Strict lifecycle: Specify → Plan → Tasks → Implement
3. **Mandatory Technology Stack** - FastAPI (backend), Next.js 16+ (frontend), Supabase (database/auth)
4. **Project Phases** - 5 defined phases from console app to cloud-native deployment
5. **Architecture of Intelligence** - Prompts and skills encapsulation
6. **Operational Constraints** - No vibe coding, task identification, security requirements

**Key Technology Requirements:**
- Backend: Python 3.13+ with FastAPI
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- Database/Auth: Supabase (PostgreSQL + Auth)
- Prohibited: Neon DB, Express.js, Flask, Django, Pages Router
- AI Stack: Claude Code, Spec-Kit Plus, OpenAI Agents SDK, Official MCP SDK
- Cloud Native: Docker, Kubernetes (Minikube), Helm, Kafka, Dapr

**Governance:**
- Version: 1.0.0
- Ratified: 2026-01-16
- Amendment procedure documented
- Hierarchy: Constitution > Spec > Plan > Tasks

## Outcome

- ✅ Impact: Constitution successfully established with 6 core principles and comprehensive governance model
- 🧪 Tests: N/A (constitution update, no code changes)
- 📁 Files: `.specify/memory/constitution.md` (created/updated)
- 🔁 Next prompts: Consider updating templates for FastAPI/Supabase references, create quickstart guide
- 🧠 Reflection: Initial constitution provides strong foundation for spec-driven development with clear technology constraints and phase evolution model

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution created successfully on first attempt
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Review and update agent-file-template.md and command files to align with FastAPI/Supabase requirements; create quickstart guide for Phase 2 setup
