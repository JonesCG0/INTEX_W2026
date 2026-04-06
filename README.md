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
| Database | Azure SQL Database (planned — EF Core) |
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

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_POLITE_ROCK_003BB5B1E` | Frontend deploy token |
| `AZURE_APP_SERVICE_NAME` | Backend App Service name (`INTEXW2026`) |
| `AZURE_PUBLISH_PROFILE` | Backend publish credentials |

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

- [ ] Database — connect Azure SQL via EF Core
- [ ] Auth — ASP.NET Identity (Admin, Donor, Visitor roles)
- [ ] Blob storage — Azure Blob Storage placeholder
- [ ] Build out full app per PRD (`md files/Web_App_PRD.md`)
