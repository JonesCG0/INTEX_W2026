# Project Haven AI Coding Rules

This document defines the coding conventions and requirements for AI coding assistants contributing to Project Haven.

Follow the rules below when making changes.

---

## Project Overview

Project Haven is a secure full-stack web application for a nonprofit safehouse supporting survivors of abuse and trafficking.

Current implementation:

- public home, impact, privacy, login, and donor signup pages
- donor dashboard and donor contribution recording
- admin dashboard, donor management, resident management, process recordings, visitations, analytics, and user management
- ML pipelines page with eight notebook-backed pipelines, CSV output previews, and demo run simulation
- seeded admin and donor accounts
- Azure SQL-backed data persistence

---

## Core Rules

- Use controller-based ASP.NET Core APIs.
- Use async EF Core calls only.
- Keep frontend and backend changes aligned.
- Use DTOs for API boundaries.
- Do not expose EF entities directly.
- Do not hardcode secrets.
- Respect role-based access control.
- Keep delete actions behind confirmation modals.

---

## Current Roles

- Admin: full CRUD across the portal and user management
- Donor: read own dashboard, record donations, view public impact
- Unauthenticated: public pages only

---

## Coding Conventions

- TypeScript strict mode
- No `any`
- React function components only
- C# PascalCase naming
- Tailwind for styling
- shadcn/ui for forms, tables, dialogs, and buttons

---

## Verification

Before shipping changes:

- run the backend build
- run the frontend build
- verify auth-sensitive routes
- verify any changed dashboards still load

---

## Important Notes

- If you change donor data, check donor dashboard, admin portal, and public impact output.
- If you change resident data, check resident, recording, visitation, and analytics views.
- If you change user management, ensure donor and admin login flows still work.
