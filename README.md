# Project Haven

A secure, full-stack case management web application for a nonprofit safehouse supporting abuse and trafficking survivors. The current build includes the public home page, public impact dashboard, privacy policy, cookie-consent flow, and a secure authenticated admin area.

---

## Live Deployment

| Service | URL |
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

## Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page — auth-aware nav, impact stats |
| `/impact` | Public | Donor-facing impact dashboard — live anonymized metrics |
| `/privacy` | Public | Privacy policy and cookie-consent information |
| `/login` | Public | Login form |
| `/signup` | Public | Registration (creates Donor account) |
| `/admin` | Admin only | Admin portal entry point — redirects to the authenticated staff dashboard |
| `/admin/dashboard` | Admin only | Admin / Staff dashboard — operational overview for residents, donors, recordings, visitation, and reports |
| `/admin/users` | Admin only | User management — change roles, delete, unlock |
| `/admin/query` | Admin only | SQL query interface (SELECT only) |

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/login` | Public | Login with email + password |
| POST | `/logout` | Any | Clear session cookie |
| GET | `/me` | Public | Get current session user |
| POST | `/register` | Public | Create Donor account |

### Public Impact (`/api/public`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/impact` | Public | Read-only impact dashboard backed by the connected SQL database |

### Admin (`/api/admin`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/portal` | Admin | Load the authenticated staff dashboard overview |
| PUT | `/portal/donors/{id}` | Admin | Update donor records in the portal |
| POST | `/portal/contributions` | Admin | Add a contribution record |
| POST | `/portal/residents` | Admin | Add a resident / caseload record |
| PUT | `/portal/residents/{id}` | Admin | Update a resident / caseload record |
| DELETE | `/portal/residents/{id}` | Admin | Delete a resident / caseload record |
| POST | `/portal/recordings` | Admin | Add a process recording |
| POST | `/portal/visitations` | Admin | Add a home visitation or case conference record |
| GET | `/users` | Admin | List all users with roles |
| PUT | `/users/{id}/role` | Admin | Change a user's role |
| DELETE | `/users/{id}` | Admin | Delete a user |
| POST | `/users/{id}/unlock` | Admin | Clear lockout on a user |
| GET | `/roles` | Admin | List available roles |
| POST | `/query` | Admin | Run a SELECT query (max 500 rows) |

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
```bash
dotnet user-secrets set "AdminSeed:Email" "admin@example.com"
dotnet user-secrets set "AdminSeed:Password" "YourPassword123!"
dotnet user-secrets set "AdminSeed:DisplayName" "Project Haven Admin"
```
On Azure, set these as App Service environment variables instead.

### Password Policy (IS414)
Passwords must be at least **12 characters** and include uppercase, lowercase, digit, and special character.

### Seed the database from CSV export
```bash
cd backend
dotnet run -- --seed-csv ../lighthouse_csv_v7/lighthouse_csv_v7
```
Drops and recreates CSV-backed tables. Requires `ConnectionStrings:DefaultConnection` to be set.

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
- Public routes include `/`, `/impact`, `/privacy`, `/login`, and `/signup`
- Authenticated admin routes include `/admin`, `/admin/dashboard`, `/admin/users`, and `/admin/query`

### Backend — Azure App Service
- Auto-deploys on push to `main` (changes to `backend/`) via `.github/workflows/deploy-backend.yml`
- EF Core migrations run automatically on startup
- The backend also seeds the admin portal tables and starter staff records after migrations complete

### Azure SQL Seed Workflow
- Manual workflow: `.github/workflows/seed-azure-db.yml`
- Runs EF migrations then loads all CSV files into Azure SQL
- Drops and recreates CSV-backed tables — use only for a fresh seed

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

> **Important:** Do NOT set `ASPNETCORE_ENVIRONMENT=Development` in Azure. Development mode sets the auth cookie to `SameSite=Lax`, which breaks cross-origin login between the Static Web App and App Service. Leave it unset (defaults to `Production`).

---

## Repo Structure

```
/
├── frontend/
│   └── src/
│       ├── components/        # Shared components (ProtectedRoute)
│       ├── pages/             # Route-level pages
│       │   ├── HomePage.tsx   # Auth-aware home with nav
│       │   ├── LoginPage.tsx
│       │   ├── SignUpPage.tsx
│       │   ├── AdminPage.tsx  # User management (Admin only)
│       │   └── QueryPage.tsx  # DB query interface (Admin only)
│       ├── styles/            # Shared CSS
│       └── api.ts             # All backend API calls + types
├── backend/
│   ├── Controllers/           # AuthController, AdminController, HealthController
│   ├── Data/                  # AppDbContext + EF migrations
│   ├── Models/
│   │   ├── AppUser.cs         # IdentityUser<int> with DisplayName
│   │   ├── Auth/              # DTOs: Login, Register, CurrentUser, AuthResponse
│   │   └── Admin/             # DTOs: UserSummary, ChangeRole, QueryRequest
│   │   └── AdminPortal/       # Portal entities + DTOs for donors, residents, recordings, visitations
│   ├── Services/              # AdminSeeder, AdminPortalStore, CsvDatabaseSeeder
│   ├── Controllers/           # AuthController, AdminController, AdminPortalController, HealthController
│   └── Program.cs             # Identity, CORS, cookie auth, auto-migrate
├── md files/                  # Project docs (PRD, collaboration notes, setup tasks, design specs)
├── .github/workflows/         # CI/CD pipelines
└── README.md
```

---

## TODOs

- [x] Admin/staff portal dashboard with persisted donor, resident, recording, visitation, and report workflows
- [ ] EF Core typed entity models for CSV-seeded business tables
- [ ] Donor dashboard — donation history, anonymized impact view
- [x] Privacy policy page
- [x] GDPR-style cookie consent banner
- [ ] CSP headers and additional privacy hardening
- [x] Static image hosting — drop images in `frontend/public/images/`, reference as `/images/filename.jpg`
- [ ] Lighthouse accessibility audit (target ≥90%)
