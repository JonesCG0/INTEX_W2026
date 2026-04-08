# Project Haven Setup Tasks

This file is the current setup and verification checklist for the repository.

The app is already beyond starter state, so this list now focuses on keeping the environment reproducible and the docs aligned with the build.

---

## Current Status

Completed:

- public home page
- public impact dashboard
- privacy policy page
- cookie consent banner
- login and donor signup
- donor dashboard
- donor contribution recording
- admin portal with CRUD for donors, contributions, residents, recordings, visitations, and users
- Azure SQL persistence
- seeded admin and donor accounts
- backend health checks

---

## Local Setup

1. Install Node.js 20+ and .NET 10 SDK.
2. Restore frontend dependencies with `npm ci` in `frontend/`.
3. Run the frontend with `npm run dev`.
4. Set `VITE_API_URL` in `frontend/.env`.
5. Configure the backend connection string with `dotnet user-secrets`.
6. Run the backend with `dotnet run` in `backend/`.
7. Confirm the app can log in as admin and donor.

---

## Documentation To Keep Updated

- `README.md`
- `frontend/README.md`
- `md files/AI_COLLABORATION.md`
- `md files/claude.md`
- `md files/PRD.md`
- `md files/Web_App_PRD.md`

---

## Verification Checklist

- [x] Backend builds cleanly
- [x] Frontend builds cleanly
- [x] Admin CRUD routes are present
- [x] Donor dashboard loads seeded or user-recorded contributions
- [x] Public impact dashboard includes portal contributions
- [x] User management routes exist
- [ ] CSP header hardening
- [ ] Lighthouse audit
- [ ] Blob storage implementation
