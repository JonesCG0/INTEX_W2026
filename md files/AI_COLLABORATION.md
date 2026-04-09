# AI Collaboration Guide

This file gives every AI coding agent and teammate the same baseline instructions for Project Haven.

The goal is to keep the codebase clear, deployable, and easy to reason about while avoiding overlapping edits or unnecessary abstractions.

---

## Current Project State

Project Haven is no longer a starter app. The current build includes:

- public home, impact, privacy, login, and donor signup pages
- donor contribution recording for logged-in donors
- a donor dashboard backed by the database
- an admin portal with CRUD for donors, contributions, residents, recordings, visitations, and users
- a public impact dashboard backed by Azure SQL
- cookie consent, role-based auth, and seeded admin/donor accounts
- an admin ML dashboard with eight notebook-backed pipeline slots
- Azure ML job submission support plus Blob-first and repo-fallback CSV snapshot reading

---

## Working Rules

1. Prefer clarity over cleverness.
2. Keep changes small and scoped.
3. Do not edit the same files concurrently.
4. State assumptions explicitly.
5. Never hardcode secrets or credentials.
6. Preserve deployability after every change.
7. Use patch-style edits instead of rewriting unrelated files.

---

## Stack

- Frontend: React + TypeScript + Vite
- Backend: ASP.NET Core Web API
- Database: Azure SQL with EF Core
- Hosting: Azure Static Web Apps + Azure App Service
- Auth: ASP.NET Identity with cookie sessions
- ML: Azure ML command jobs + Blob-backed generated outputs

---

## Coordination Notes

- The backend uses controller-based APIs.
- The frontend uses React Router and shared layout components.
- Admin CRUD now exists for the main portal entities, so UI and backend changes should be kept in sync.
- If a change affects public impact data, donor dashboard data, and admin portal data, update all three surfaces together.
- ML pipeline changes usually touch three layers together: notebook output schema, backend snapshot parsing, and the admin ML dashboard UI.
- Keep the local `ml-pipelines/generated_outputs/` fallback working unless the user explicitly asks to remove it.

---

## What To Report Back

When an agent makes changes, it should report:

- what changed
- which files changed
- assumptions made
- how it was verified
- any remaining TODOs
