# Project Haven

A secure, full-stack case management web application for a nonprofit safehouse supporting abuse and trafficking survivors. Built as a BYU INTEX project.

---

## Live Deployment

| Service  | URL |
|---|---|
| Frontend | https://polite-rock-003bb5b1e.1.azurestaticapps.net |
| Backend API | https://intexw2026-crd9brarcfhyf9b8.francecentral-01.azurewebsites.net |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | ASP.NET Core (.NET 10) Web API |
| Database | Azure SQL Database (EF Core) |
| Hosting (frontend) | Azure Static Web Apps |
| Hosting (backend) | Azure App Service (France Central) |
| CI/CD | GitHub Actions |

---

## Local Setup

### Prerequisites
- Node.js 20+
- .NET 10 SDK

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`

### Backend
```bash
cd backend
dotnet run
```
Runs at `http://localhost:5262`

### Authentication
The backend supports cookie-based login through `POST /api/auth/login`, session lookup through `GET /api/auth/me`, and logout through `POST /api/auth/logout`.

To seed the first admin account into the database, set these backend environment variables before starting the app:

```bash
AdminSeed__Email=admin@example.com
AdminSeed__Password=change-this-password
AdminSeed__DisplayName=Project Haven Admin
```

If those values are present, the app will create or promote that user to `Admin` on startup.

### Seed the database from the CSV export
The backend includes a one-time CSV import command that creates matching SQL tables and loads the files from `lighthouse_csv_v7`.

```bash
cd backend
dotnet run -- --seed-csv ../lighthouse_csv_v7/lighthouse_csv_v7
```

This requires `ConnectionStrings:DefaultConnection` to point to a reachable SQL Server or Azure SQL Database.

### Environment Variables

**Frontend** — create `frontend/.env` (already in repo for local dev):
```
VITE_API_URL=http://localhost:5262
```

**Backend** — allowed CORS origins are set in `appsettings.Development.json`:
```json
{
  "AllowedOrigins": ["http://localhost:5173"]
}
```

---

## Deployment

### Frontend — Azure Static Web Apps
- Deployed automatically on push to `main` via `.github/workflows/azure-static-web-apps-polite-rock-003bb5b1e.yml`
- Build: `npm install && npm run build` → `frontend/dist`
- Config: `frontend/public/staticwebapp.config.json`

### Backend — Azure App Service
- Deployed automatically on push to `main` (changes to `backend/`) via `.github/workflows/deploy-backend.yml`
- Can also be triggered manually from the Actions tab
- Publish: `dotnet publish` → Azure App Service (INTEXW2026, France Central)

### Azure SQL Seed Workflow
- Manual seed workflow: `.github/workflows/seed-azure-db.yml`
- Run it from the GitHub Actions tab when you want to load the CSV data into Azure SQL
- It drops and recreates the CSV-backed tables, so use it only when you want a fresh seed
- Required secrets:
  - `AZURE_SQL_CONNECTION_STRING`
  - `ADMIN_SEED_EMAIL`
  - `ADMIN_SEED_PASSWORD`
  - `ADMIN_SEED_DISPLAY_NAME`

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_POLITE_ROCK_003BB5B1E` | Frontend deploy token |
| `AZURE_APP_SERVICE_NAME` | Backend App Service name (`INTEXW2026`) |
| `AZURE_PUBLISH_PROFILE` | Backend publish credentials |
| `AZURE_SQL_CONNECTION_STRING` | Azure SQL connection string for seeding |
| `ADMIN_SEED_EMAIL` | Admin login email to seed |
| `ADMIN_SEED_PASSWORD` | Admin login password to seed |
| `ADMIN_SEED_DISPLAY_NAME` | Admin display name to seed |

---

## Repo Structure

```
/
├── frontend/              # React + Vite app
├── backend/               # ASP.NET Core Web API
├── md files/              # Project docs (PRD, CLAUDE.md, setup tasks)
├── .github/workflows/     # CI/CD pipelines
└── README.md
```

---

## TODOs

- [ ] Database — add EF Core migrations and typed entity models for the main business tables
- [ ] Auth — expand beyond the current seeded admin/cookie login flow into full role management for Admin, Donor, and Visitor
- [ ] Blob storage — Azure Blob Storage placeholder
- [ ] Build out full app per PRD (`md files/Web_App_PRD.md`)
