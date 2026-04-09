# Project Haven Web Application PRD

Project Haven is a secure full-stack web application for a nonprofit safehouse supporting abuse and trafficking survivors.

---

## Current Build

The repository currently includes:

- public home page with scroll-animated hero (Framer Motion), Our Story section, cultural motifs, and donation CTA
- public impact dashboard with Nivo charts and animated stat cards
- privacy policy page
- cookie consent banner
- login and donor signup
- donor dashboard with contribution history, charts, and personal impact framing
- donor contribution recording
- admin operational overview dashboard with real-time metrics, alerts, activity feed, and ML reintegration queue
- admin CRUD for donors, contributions, residents, recordings, visitations, and case conferences
- outreach performance view
- admin user and role management
- admin analytics dashboard with Nivo charts
- admin ML pipelines dashboard with eight pipeline slots, CSV output previews, and Azure ML run support
- Azure ML job-trigger integration with Blob-backed output previews and local CSV fallback
- production auth configuration targeting `https://api.jonescg0.net` for same-site mobile-safe cookie auth
- uniform visual design system: Yeseva One for all page headings, Geist for body and UI text
- WCAG AA accessibility: aria-labels on icon-only buttons, aria-hidden on decorative icons
- CSP-compliant: no inline event handlers in `index.html`

---

## User Stories

### Unauthenticated Visitor

- Browse the home page and Our Story section.
- View public impact data and anonymized safehouse stats.
- Read the privacy policy.
- Access login or signup.

### Donor

- Log in and see personal donation history and impact summary.
- Record a donation after sign-in.
- View anonymized impact data on the public dashboard.

### Admin

- Review the operational overview with live metrics, system alerts, and recent activity.
- Manage donor profiles and contributions.
- Manage residents, recordings, visitations, and case conferences.
- Review outreach performance.
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
- Accessible forms, tables, charts, and dialogs (WCAG AA).
- Aria-labels on all icon-only buttons; decorative icons marked aria-hidden.
- Uniform typography: Yeseva One for headings (h1/h2), Geist for all body and UI text.
- No inline event handlers — CSP script-src 'self' compliant.
- Azure deployment for frontend and backend.
- Secrets remain outside source control.
- Backend and frontend builds must pass before release.
