# Project Haven Setup Tasks

This file is the current setup and verification checklist for the repository.

The app is already beyond starter state, so this list now focuses on keeping the environment reproducible and the docs aligned with the build.

---

## Current Status

Completed:

- public home page with scroll-animated hero and Our Story section
- public impact dashboard
- privacy policy page
- cookie consent banner
- login and donor signup
- donor dashboard
- donor contribution recording
- admin portal with CRUD for donors, contributions, residents, recordings, visitations, conferences, and users
- outreach performance page
- ML pipelines page with eight notebooks, CSV output previews, and demo run simulation
- Azure SQL persistence
- seeded admin and donor accounts
- backend health checks
- admin ML pipelines dashboard
- Azure Blob-backed ML snapshot reading with local repo fallback
- Azure ML command-job trigger support in the backend
- custom API domain target for same-site production auth: `https://api.jonescg0.net`
- visual design system applied uniformly across all pages (Yeseva One for headings, Geist for body/UI)
- CSP inline event handler removed from `index.html`
- WCAG AA accessibility improvements: aria-labels, aria-hidden decorative icons on all admin pages

---

## Local Setup

1. Install Node.js 20+ and .NET 10 SDK.
2. Restore frontend dependencies with `npm ci` in `frontend/`.
3. Run the frontend with `npm run dev`.
4. Set `VITE_API_URL` in `frontend/.env`.
5. Configure the backend connection string with `dotnet user-secrets`.
6. Run the backend with `dotnet run` in `backend/`.
7. Confirm the app can log in as admin and donor.
8. If using the ML dashboard in demo mode, confirm CSV outputs exist under `ml-pipelines/generated_outputs/`.
9. If using live Azure ML mode, configure the `AzureMl` section in backend settings and confirm Blob access.
10. For production auth, keep the frontend on `jonescg0.net` and the backend API on `api.jonescg0.net`.
11. In Azure App Service, set `AuthCookie__Domain=.jonescg0.net` and `AuthCookie__SameSite=None`.
12. In the frontend production build, set `VITE_API_URL=https://api.jonescg0.net`.

---

## Documentation To Keep Updated

- `README.md`
- `md files/PRD.md`
- `md files/Web_App_PRD.md`
- `md files/SETUP_TASKS.md`
- `md files/AI_COLLABORATION.md`
- `md files/claude.md`
- `ml-pipelines/AZURE_ML_SETUP.md`

---

## Verification Checklist

- [x] Backend builds cleanly
- [x] Frontend builds cleanly
- [x] Admin CRUD routes are present
- [x] Donor dashboard loads seeded or user-recorded contributions
- [x] Public impact dashboard includes portal contributions
- [x] User management routes exist
- [x] Admin ML dashboard reads local CSV snapshots
- [x] Backend can submit Azure ML jobs when configured
- [x] Production config now targets same-site auth via `api.jonescg0.net`
- [x] CSP inline event handler removed
- [x] Visual design system uniform across all pages
- [x] Accessibility: aria-labels and aria-hidden on all icon-only buttons
- [ ] End-to-end validation of live Azure ML runs in deployed environment
