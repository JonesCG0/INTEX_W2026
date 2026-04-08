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

---

## Functional Scope

- Public pages are read-only.
- Donor features are restricted to the donor role.
- Admin features require the admin role.
- Delete actions use confirmation dialogs.
- Public impact data combines public and portal contribution sources.

---

## Non-Functional Requirements

- Responsive layout for desktop and mobile.
- Accessible forms, tables, and dialogs.
- Azure deployment for frontend and backend.
- Secrets remain outside source control.
- Backend and frontend builds must pass before release.
