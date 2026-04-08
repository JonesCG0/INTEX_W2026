# Default App Setup Tasks

## Purpose
This file lists the concrete steps needed to create the default starter application before the main assignment week.

It is written so that a human teammate can follow it, or individual tasks can be assigned to AI coding agents such as Codex, Cursor, Claude Code, or other IDE agents.

The goal is not to finish the final project yet. The goal is to remove setup risk and create a clean deployable baseline.

---

## Target Outcome
By the end of this setup, we should have:

- a GitHub repo with clean structure
- a React + TypeScript + Vite frontend
- an ASP.NET Core backend
- frontend successfully calling backend
- environment variables configured
- starter README docs
- starter Azure deployment path
- cookie-based login for the initial admin user
- a repeatable Azure SQL seed workflow for the CSV export
- placeholders for expanded auth, DB migrations, and blob storage
- a task board and team ownership plan
- backend health endpoints for liveness, readiness, and detailed diagnostics

## Current Status

Completed in the current repository:

- the public home page
- the public impact dashboard
- the privacy policy page
- the cookie-consent banner and browser cookie storage
- the Azure-connected backend path for public impact data
- the secure login, sign-up, and admin area
- the seeded donor account and linked donor portal profile used for dashboard testing
- the authenticated admin/staff portal dashboard
- the persisted portal workflows for donors, residents, process recordings, visitations, and reports
- backend health endpoints for liveness, readiness, and detailed startup diagnostics

---

## Recommended Repo Structure
```text
/
├── frontend/
├── backend/
├── docs/
├── .github/
├── README.md
├── AI_COLLABORATION.md
└── SETUP_TASKS.md
```

---

## Work Breakdown

### 1. Repository Setup
**Owner:** Human or one AI agent

Tasks:
- Create the GitHub repository
- Add `.gitignore`
- Add base `README.md`
- Add `AI_COLLABORATION.md`
- Add `SETUP_TASKS.md`
- Create `frontend`, `backend`, and `docs` folders
- Protect main branch if desired
- Agree on branching workflow

Suggested prompt for Codex:
> Create a clean starter repository structure for a full-stack app with `frontend`, `backend`, `docs`, `.github`, a basic README, and no unnecessary files. Keep it simple and easy for students to understand.

---

### 2. Frontend Starter App
**Owner:** One AI agent only

Tasks:
- Create a React + TypeScript + Vite app inside `frontend`
- Remove unnecessary demo code
- Create a minimal homepage
- Show app title and environment status
- Add a button or automatic fetch to call the backend readiness endpoint
- Add clear loading, success, and error UI
- Keep styling minimal

Minimum result:
- Frontend runs locally
- Frontend can call backend URL from config

Suggested prompt for Codex:
> In the `frontend` folder, create a minimal React + TypeScript + Vite app. Replace template/demo code with a simple homepage that calls a backend health endpoint and clearly shows loading, success, and error states. Keep the code barebones and readable.

---

### 3. Backend Starter API
**Owner:** One AI agent only

Tasks:
- Create an ASP.NET Core Web API in `backend`
- Add `/api/health/live`, `/api/health/ready`, and `/api/health/full` endpoints
- Add one sample `/api/test` or `/api/message` endpoint returning JSON
- Enable local CORS for frontend origin
- Keep `Program.cs` simple
- Add appsettings placeholders, but do not hardcode secrets

Minimum result:
- Backend runs locally
- Endpoints respond correctly
- Frontend can fetch from backend

Suggested prompt for Codex:
> In the `backend` folder, create a minimal ASP.NET Core Web API with `/api/health/live`, `/api/health/ready`, and `/api/health/full` endpoints plus one sample JSON endpoint. Configure simple local CORS for the frontend. Keep the code very clear and avoid extra architecture.

---

### 4. Frontend/Backend Connection
**Owner:** Same agent as frontend or backend, but not multiple at once

Tasks:
- Add frontend env variable for backend base URL
- Create one small API helper/service file
- Connect the app to the backend readiness route
- Verify the request succeeds locally
- Document the local run order

Suggested prompt for Codex:
> Add minimal environment-variable-based API configuration to the frontend and connect it to the backend health endpoint. Keep the API code in one simple helper file.

---

### 5. Environment Configuration
**Owner:** One AI agent or human

Tasks:
- Add `.env.example` for frontend
- Add configuration examples for backend
- Document required variables
- Ensure secrets are excluded from source control
- Add local development notes

Suggested prompt for Codex:
> Create `.env.example` and configuration placeholder files for frontend and backend. Document each variable briefly and keep secrets out of source control.

---

### 6. Database Placeholder
**Owner:** One AI agent only

Tasks:
- Add the minimal EF Core schema needed for the app bootstrap and admin user
- Add a repeatable seeding path for the `lighthouse_csv_v7` CSV export
- Document how Azure SQL is connected in development and deployment
- Keep any future domain tables separate from the bootstrap/auth pieces

Current repository note:
- The portal now has its own EF Core tables for donors, contributions, residents, process recordings, and visitations
- Portal seed data is loaded after migrations so the authenticated dashboard has immediate starter content
- Any future schema work should extend those tables rather than replacing them with in-memory storage

Important:
- Do not overbuild this part yet
- Keep the bootstrap schema small and understandable
- Only create the simplest path for later integration

Suggested prompt for Codex:
> Add the minimum backend structure needed to support a future database connection. Do not fully implement the database layer yet. Keep it simple and document TODOs.

---

### 7. Azure Blob Storage Placeholder
**Owner:** One AI agent only

Tasks:
- Add a simple service placeholder or interface for blob storage
- Add config placeholders for Azure Blob Storage
- Document expected environment variables
- Do not build full upload/download flow unless needed

Suggested prompt for Codex:
> Add a minimal placeholder for future Azure Blob Storage integration in the backend, including configuration placeholders and comments about intended usage. Do not implement full storage logic yet.

---

### 8. Security/Auth Placeholder
**Owner:** One AI agent only

Tasks:
- Add cookie-based login for the initial admin user
- Document the current admin seed env vars and login flow
- Keep the app open/simple for unauthenticated visitors
- Add TODO comments for fuller role management, protected routes, and donor/admin authorization

Current repository note:
- Authenticated staff now land on the dedicated admin/staff portal dashboard
- The shared admin shell is used by the dashboard, user management, and SQL query pages
- Role-based redirects now distinguish between donor-facing and staff-facing flows

Suggested prompt for Codex:
> Add the minimum project structure and documentation needed for future authentication/authorization support in the ASP.NET backend and React frontend. Do not fully implement auth yet.

---

### 9. Deployment Preparation
**Owner:** One AI agent or human

Tasks:
- Decide on Azure deployment target
- Add deployment notes in `docs/`
- Optionally draft GitHub Actions workflow
- Document what environment variables will be needed in deployment
- Keep deployment path as simple as possible

Suggested prompt for Codex:
> Create simple deployment notes for hosting the React frontend and ASP.NET backend on Azure. If reasonable, draft a basic GitHub Actions workflow, but keep it minimal and easy to understand.

---

### 10. Documentation Cleanup
**Owner:** Human or one AI agent

Tasks:
- Update `README.md` with:
  - project purpose
  - stack
  - local setup
  - how to run frontend
  - how to run backend
  - how to seed Azure SQL
  - how to seed the initial admin user
  - backend health endpoints and local probe links
  - known TODOs
- Make sure docs match actual code
- Remove stale instructions

Suggested prompt for Codex:
> Write a clean student-friendly README for this repository that explains the stack, repo structure, local setup, and current TODOs. Keep it concise and practical.

---

### 11. Project Management Setup
**Owner:** Humans

Tasks:
- Create Trello board (or equivalent)
- Assign scrum roles
- Define ownership areas
- Break work into small tasks
- Decide daily check-in rhythm
- Track blockers early

Suggested initial ownership split:
- **Person 1:** Frontend + frontend/backend integration
- **Person 2:** Backend API + DB prep
- **Person 3:** Deployment + storage + documentation
- Shared: planning, testing, final integration, presentation

---

## Suggested Order
Do these in roughly this order:

1. Repository setup  
2. Backend starter  
3. Frontend starter  
4. Frontend/backend connection  
5. Environment configuration  
6. README cleanup  
7. Deployment preparation  
8. DB placeholder / seed workflow  
9. Blob storage placeholder  
10. Auth placeholder / login flow  
11. Team planning / Trello / scrum roles

This order reduces risk and gets a deployable baseline quickly.

---

## Acceptance Checklist
Use this checklist before the week starts:

- [x] GitHub repo created
- [ ] Basic branch strategy agreed on
- [x] React frontend created
- [x] ASP.NET backend created
- [x] Backend health endpoint works
- [x] Frontend successfully calls backend
- [x] `.env.example` files added
- [x] README updated
- [x] Azure deployment notes added (see README.md and `.github/workflows/`)
- [x] Azure SQL Database connected and seeded with CSV data
- [x] ASP.NET Identity configured (roles: Admin, Donor)
- [x] EF Core migrations created and auto-applied on startup
- [x] Admin seed account wired via App Service env vars
- [x] Login page built and deployed
- [x] Login confirmed working end-to-end in production
- [x] Public home page polished
- [x] Public impact dashboard built
- [x] Privacy policy page added
- [x] Cookie-consent banner added
- [x] Sign-up page (Donor self-registration)
- [x] Admin user management page (/admin/users)
- [x] Admin database query page (/admin/query)
- [x] Auth-aware home page nav
- [x] Admin portal — residents, recordings, donors, analytics pages live and deployed
- [x] Donor dashboard built and deployed
- [x] SPA routing fallback configured for Azure Static Web Apps
- [x] VITE_API_URL injected at build time via GitHub Actions secret
- [ ] Blob storage placeholder documented
- [ ] Trello board created
- [ ] Scrum roles assigned

---

## Important Guardrails for AI Agents
When assigning any of these tasks to an IDE agent:

- assign one area at a time
- do not let two agents edit the same files
- require simple readable code
- require a list of changed files
- require assumptions/TODOs to be stated
- reject over-engineered solutions

---

## Good First Prompts to Use This Week

### Prompt: create backend starter
> Build a minimal ASP.NET Core Web API starter in the `backend` folder with a health endpoint and one sample JSON endpoint. Keep `Program.cs` easy to read, enable local CORS for the frontend, and avoid unnecessary abstractions.

### Prompt: create frontend starter
> Build a minimal React + TypeScript + Vite app in the `frontend` folder. Remove the demo template and replace it with a simple page that calls the backend health endpoint and displays loading, success, and error states.

### Prompt: add env config
> Add the minimum environment variable setup needed for local frontend/backend communication. Create example config files and document each variable briefly.

### Prompt: add deployment notes
> Create a short deployment guide for putting this React frontend and ASP.NET backend on Azure with as little setup complexity as possible.

---

## Final Reminder
The starter app does not need to be impressive.

It needs to be:
- understandable
- runnable
- deployable
- safe to build on

That is the win for the prep week.
