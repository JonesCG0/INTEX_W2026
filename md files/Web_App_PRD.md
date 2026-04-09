# Project Haven Web Application PRD

Project Haven is a secure full-stack web application for a nonprofit safehouse supporting abuse and trafficking survivors.

---

## Current Build

The repository currently includes:

- public home, impact, privacy, login, and donor signup pages
- donor dashboard
- donor contribution recording
- admin dashboard
- admin CRUD for donors, contributions, residents, recordings, visitations, and users
- public impact data backed by Azure SQL
- seeded admin and donor accounts
- admin ML pipelines dashboard with eight pipeline slots
- Azure ML job-trigger integration with Blob-backed output previews and local CSV fallback
- production auth configuration targeting `https://api.jonescg0.net` for same-site mobile-safe cookie auth

---

## User Stories

### Unauthenticated Visitor

- Browse the home page.
- View public impact data.
- Read the privacy policy.
- Access login or signup.

### Donor

- Log in and see donation history.
- Record a donation after sign-in.
- View anonymized impact data.

### Admin

- Manage donor profiles and contributions.
- Manage residents, recordings, and visitations.
- Manage users and roles.
- Review reporting and analytics.
- Review notebook-backed ML outputs and trigger Azure ML jobs from the admin ML dashboard.

---

## Functional Scope

- Public pages are read-only.
- Donor features are restricted to the donor role.
- Admin features require the admin role.
- Delete actions use confirmation dialogs.
- Public impact data combines public and portal contribution sources.
- The admin ML page reads pipeline CSV snapshots from Azure Blob when configured, or from `ml-pipelines/generated_outputs/` as a fallback.
- All eight current notebook slots have expected fallback CSV outputs wired into the admin ML dashboard.
- Production login is intended to run with the frontend on `jonescg0.net`, the API on `api.jonescg0.net`, and the auth cookie scoped to `.jonescg0.net`.

---

## Non-Functional Requirements

- Responsive layout for desktop and mobile.
- Accessible forms, tables, and dialogs.
- Azure deployment for frontend and backend.
- Secrets remain outside source control.
- Backend and frontend builds must pass before release.
