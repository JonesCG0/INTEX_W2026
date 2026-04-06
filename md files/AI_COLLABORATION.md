# AI Collaboration Guide

## Purpose
This file gives every AI coding agent and teammate the same baseline instructions for this repository.

The goal is to keep the codebase simple, readable, and easy to deploy while avoiding duplicate work, conflicting edits, and over-engineered solutions.

This file should be updated as the team learns more about the assignment.

---

## Project Intent
We are building a full-stack application that reinforces what we learned in:

- Security
- Enterprise App Development
  - .NET
  - TypeScript
  - React
  - Vite
- Machine Learning
- Python with database management
- Project Management

We are working in a team of three over about one week.

This repository should start with a **barebones but deployable default app** so we can reduce setup risk before the main build week starts.

---

## High-Level Default Stack
Unless the team decides otherwise, use this default setup:

- **Frontend:** React + TypeScript + Vite
- **Backend:** ASP.NET Core Web API
- **Database:** Azure SQL Database (via Entity Framework Core)
- **Cloud Hosting:** Azure (Static Web Apps + App Service)
- **File/Image Storage:** Azure Blob Storage
- **CDN:** Azure Static Web Apps (built-in)
- **Version Control:** GitHub

---

## Main Engineering Principles
All agents and contributors should follow these rules:

1. **Prefer clarity over cleverness.**  
   Write simple code that a student teammate can read quickly.

2. **Start with the minimum working version.**  
   Build the smallest deployable version first, then improve it.

3. **Do not add architecture we are not using yet.**  
   No speculative abstractions, extra services, or unnecessary patterns.

4. **Make each file obvious.**  
   Each file should have a single clear purpose.

5. **Comment intent, not the obvious.**  
   Add short comments where business logic or setup could confuse a teammate.

6. **Keep changes small and scoped.**  
   Avoid broad repo-wide rewrites unless explicitly requested.

7. **Do not silently rename or reorganize major folders.**  
   Structural changes must be deliberate and documented.

8. **Preserve deployability.**  
   Every meaningful change should keep the app as close to runnable as possible.

---

## AI Agent Rules
To avoid multiple AI tools stepping on each other:

### 1) One task per agent
Each AI agent should be given one clearly scoped task at a time.

Examples:
- “Create the starter React app shell”
- “Add one ASP.NET health endpoint”
- “Create Azure Blob Storage service wrapper”
- “Write GitHub Actions deploy workflow draft”

Avoid assigning overlapping tasks to multiple agents at once.

### 2) Do not edit the same files concurrently
If one agent is working on:
- `frontend/src/App.tsx`
- `backend/Program.cs`

another agent should not be modifying those same files at the same time.

### 3) State assumptions explicitly
When an agent creates or modifies code, it should state:
- what it changed
- what assumptions it made
- what still needs human review
- how to run or test the change

### 4) Prefer patch-style output
Agents should make targeted edits instead of regenerating large files unless necessary.

### 5) Do not invent missing requirements
If something is unknown, add a TODO and keep the implementation minimal.

### 6) Protect secrets
Agents must never hardcode:
- API keys
- connection strings
- storage secrets
- auth secrets
- deployment credentials

Use environment variables and documented setup steps.

---

## Current Default Goal
Before the main assignment week, we want a working default application with:

- a basic React frontend
- a basic ASP.NET backend
- frontend calling backend successfully
- environment variable support
- simple folder structure
- starter deployment target on Azure
- placeholder support for auth/security
- placeholder support for database access
- placeholder support for image/file storage
- clear README and setup steps

---

## Suggested Repo Structure
```text
/
├── frontend/              # React + Vite app
├── backend/               # ASP.NET Core Web API
├── docs/                  # Setup notes, architecture notes, sprint notes
├── .github/               # GitHub workflows
├── README.md              # Main project overview
├── AI_COLLABORATION.md    # This file
└── SETUP_TASKS.md         # Default build/setup checklist
```

---

## File-Level Expectations
When creating files, follow these conventions:

### Frontend
- Keep components small
- Use TypeScript types clearly
- Avoid unnecessary global state
- Keep API access in a clear service/helper location
- Show obvious loading and error states

### Backend
- Keep endpoints explicit and easy to trace
- Use DTOs when helpful for clarity
- Separate config from business logic
- Keep dependency injection simple
- Start with one health/test endpoint and one sample API route

### Python / ML / Data Work
- Keep scripts isolated from production app unless intentionally integrated
- Document input/output clearly
- Use requirements or environment files when needed
- Do not connect ML logic to the app until the contract is defined

### Database
- Keep schema setup documented
- Use migrations if applicable
- Start with one simple entity/table if needed
- Make local development easy

---

## Deployment Architecture

The team is using **Microsoft Azure** as the hosting platform.

### Live URLs

| Service | URL |
|---|---|
| Frontend | https://polite-rock-003bb5b1e.1.azurestaticapps.net |
| Backend API | https://intexw2026-crd9brarcfhyf9b8.francecentral-01.azurewebsites.net |

### Target Architecture

```
GitHub Actions
├── npm run build → Azure Static Web Apps  (frontend)
└── dotnet publish → Azure App Service     (backend API)
                          ↓
                      Azure SQL (planned)
```

### Service Breakdown

| Layer | Service | Notes |
|---|---|---|
| Frontend | Azure Static Web Apps | Auto-deploys from `frontend/dist` on push to main |
| Backend | Azure App Service (INTEXW2026, France Central) | Auto-deploys on push to `backend/` |
| Database | Azure SQL Database | Planned — EF Core migrations |
| File Storage | Azure Blob Storage | Planned |

### Deployment To-Do List

- [x] Create Azure Static Web Apps resource
- [x] Create Azure App Service resource (INTEXW2026)
- [x] Set up GitHub Actions workflow for frontend
- [x] Set up GitHub Actions workflow for backend
- [x] Add GitHub Actions secrets (`AZURE_STATIC_WEB_APPS_API_TOKEN_*`, `AZURE_APP_SERVICE_NAME`, `AZURE_PUBLISH_PROFILE`)
- [x] Set CORS on backend to allow Static Web Apps domain
- [x] Verify frontend can call backend API in deployed environment
- [ ] Create Azure SQL Database
- [ ] Connect backend to Azure SQL via EF Core connection string in App Service env vars
- [ ] Set up Azure Blob Storage for file uploads

---

## Security Expectations
Security matters because this project builds on our security coursework.

Default expectations:
- Use environment variables for secrets
- Plan for authentication/authorization early
- Validate inputs on backend
- Do not trust frontend-only validation
- Use HTTPS in deployed environments
- Keep CORS explicit and minimal
- Document any 401/auth flow decisions

---

## Project Management Expectations
We should also use this repo to support team coordination.

Recommended:
- define scrum roles
- define ownership areas
- create a Trello board or similar task board
- keep tasks small and assigned
- track blockers daily

---

## What an AI Agent Should Do Before Writing Code
Before making changes, an agent should check:

- What is the exact file or feature I own?
- Is another agent already editing this area?
- What is the smallest working version of this change?
- Will this keep the app runnable?
- Did I avoid adding secrets or unnecessary complexity?

---

## What an AI Agent Should Include in Its Response
When asked to code, an AI agent should return:

1. A short summary of what it changed
2. Files created or modified
3. Any assumptions made
4. How to run/test it
5. Any TODOs left for the team

---

## Open Questions To Update Later
Add answers here as the team decides them:

- Final app idea:
- Final database choice:
- Final auth approach:
- Final hosting choice: **Azure — Static Web Apps (frontend), App Service (backend), Azure SQL (database)**
- Whether ML is integrated live or offline:
- Whether file/image upload is required:
- CI/CD approach:
- Definition of done for MVP:

---

## Default Rule
When in doubt:

**choose the simplest clear solution that keeps the project deployable and easy for teammates to understand.**
