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
| Auth | ASP.NET Identity (cookie-based, roles: Admin / Donor) |
| Database | Azure SQL Database (EF Core with migrations) |
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

Set the connection string via user-secrets (keeps it off disk):
```bash
cd backend
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_CONNECTION_STRING"
```

On startup the backend will:
1. Auto-apply EF Core migrations
2. Seed the admin account if `AdminSeed__*` env vars are set

### Admin Seed Account
To create the first admin on startup, set these environment variables:
```bash
AdminSeed__Email=admin@example.com
AdminSeed__Password=YourPassword123!
AdminSeed__DisplayName=Project Haven Admin
```

Locally use `dotnet user-secrets`:
```bash
dotnet user-secrets set "AdminSeed:Email" "admin@example.com"
dotnet user-secrets set "AdminSeed:Password" "YourPassword123!"
dotnet user-secrets set "AdminSeed:DisplayName" "Project Haven Admin"
```

On Azure, set these as App Service environment variables.

### Password Policy (IS414)
Passwords must be at least **12 characters** and include uppercase, lowercase, digit, and special character.

### Seed the database from CSV export
```bash
cd backend
dotnet run -- --seed-csv ../lighthouse_csv_v7/lighthouse_csv_v7
```
This drops and recreates the CSV-backed tables. Requires `ConnectionStrings:DefaultConnection` to be set.

### Environment Variables

**Frontend** — create `frontend/.env`:
```
VITE_API_URL=http://localhost:5262
```

**Backend** — allowed CORS origins in `appsettings.Development.json`:
```json
{
  "AllowedOrigins": ["http://localhost:5173"]
}
```

---

## Deployment

### Frontend — Azure Static Web Apps
- Auto-deploys on push to `main` via `.github/workflows/azure-static-web-apps-polite-rock-003bb5b1e.yml`
- Build: `npm install && npm run build` → `frontend/dist`

### Backend — Azure App Service
- Auto-deploys on push to `main` (changes to `backend/`) via `.github/workflows/deploy-backend.yml`
- Can also be triggered manually from the Actions tab
- EF Core migrations run automatically on startup

### Azure SQL Seed Workflow
- Manual workflow: `.github/workflows/seed-azure-db.yml`
- Runs EF migrations then loads CSV data into Azure SQL
- Run from the GitHub Actions tab — drops and recreates CSV-backed tables

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_POLITE_ROCK_003BB5B1E` | Frontend deploy token |
| `AZURE_APP_SERVICE_NAME` | Backend App Service name (`INTEXW2026`) |
| `AZURE_PUBLISH_PROFILE` | Backend publish credentials |
| `AZURE_SQL_CONNECTION_STRING` | Azure SQL connection string for CSV seed workflow |

### Required Azure App Service Environment Variables

| Variable | Purpose |
|---|---|
| `ConnectionStrings__DefaultConnection` | Azure SQL connection string |
| `AdminSeed__Email` | Admin account email to seed on startup |
| `AdminSeed__Password` | Admin account password to seed on startup |
| `AdminSeed__DisplayName` | Admin display name to seed on startup |
| `AllowedOrigins__0` | Frontend URL for CORS (Static Web Apps URL) |

---

## Auth Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with email + password |
| POST | `/api/auth/logout` | Any | Clear session cookie |
| GET | `/api/auth/me` | Public | Get current session user |

---

## Repo Structure

```
/
├── frontend/              # React + Vite app
│   └── src/
│       ├── pages/         # Route-level components (HomePage, LoginPage)
│       ├── styles/        # Page-level CSS
│       └── api.ts         # All backend API calls
├── backend/               # ASP.NET Core Web API
│   ├── Controllers/       # AuthController, HealthController
│   ├── Data/              # AppDbContext + EF migrations
│   ├── Models/            # AppUser (IdentityUser<int>)
│   ├── Services/          # AdminSeeder, CsvDatabaseSeeder
│   └── Program.cs         # App setup: Identity, CORS, cookie auth
├── md files/              # Project docs (PRD, CLAUDE.md, setup tasks)
├── .github/workflows/     # CI/CD pipelines
└── README.md
```

---

## TODOs

- [ ] Remove debug exception details from `AuthController.Login` once login is confirmed working
- [ ] Build out full admin portal per PRD (`md files/Web_App_PRD.md`)
- [ ] EF Core typed entity models for the CSV-seeded business tables
- [ ] Donor role — protected routes and donor-facing views
- [ ] Azure Blob Storage for file uploads
- [ ] CSP headers, GDPR cookie consent banner, privacy policy page
