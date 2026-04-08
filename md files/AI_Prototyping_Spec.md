# Project Haven AI Prototyping Spec

## Purpose

This document records the prototype direction that led to the current app, but it should now be read as implementation guidance rather than a mock-only plan.

The repository now contains a real backend, real database persistence, and the public and authenticated flows described below.

---

## Current Product Shape

Project Haven currently includes:

- public home page
- public impact dashboard
- privacy policy page
- login and donor signup
- donor dashboard
- donor contribution recording
- admin dashboard
- admin CRUD for donors, contributions, residents, recordings, visitations, and users

---

## UI Stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Public UI: editorial, warm, brand-forward
- Authenticated UI: shadcn/ui for forms, tables, sheets, and dialogs
- Icons: Tabler Icons
- Motion: Framer Motion
- Charts: Nivo

---

## Prototype-to-Production Notes

The older mock-only assumptions are no longer current:

- backend calls are real, not MSW-only
- data is persisted in Azure SQL
- admin actions create, update, and delete real records
- donor sign-up and donation recording both write to the database

---

## Remaining Design Targets

The remaining product work should stay aligned with the current implementation:

- keep public pages polished and accessible
- keep admin screens efficient and readable
- keep donor actions simple and explicit
- keep public impact data anonymized
- keep destructive actions behind confirmation dialogs

---

## Notes for Future AI Work

- Do not reintroduce mock-only language into current docs or code comments.
- If you add new pages, match the existing visual language.
- If you add new portal actions, ensure the dashboard data is updated everywhere that consumes it.
