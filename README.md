# Project Haven

A secure, full-stack case management web application for a nonprofit safehouse supporting abuse and trafficking survivors. The current build includes the public home page, public impact dashboard, privacy policy, cookie-consent flow, donor self-registration, donor contribution recording, and a fully operational authenticated admin and donor portal.

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
| `/` | Public | Home page, auth-aware nav, impact stats |
| `/impact` | Public | Donor-facing impact dashboard, live anonymized metrics |
| `/privacy` | Public | Privacy policy and cookie-consent information |
| `/login` | Public | Login form |
| `/signup` | Public | Donor registration |
| `/donor` | Donor only | Donor dashboard, contribution history, and impact view |
| `/admin` | Admin only | Admin portal entry point, redirects to dashboard |
| `/admin/dashboard` | Admin only | Operational overview for residents, donors, recordings, and reports |
| `/admin/residents` | Admin only | Resident care management, enroll, edit, delete, track progress |
| `/admin/residents/:id/recordings` | Admin only | Clinical session timeline for a resident |
| `/admin/residents/:id/visitations` | Admin only | Visitation timeline for a resident |
| `/admin/donors` | Admin only | Donor stewardship, donor CRUD, contribution CRUD |
| `/admin/visitations` | Admin only | Visitation records overview |
| `/admin/users` | Admin only | User management, create/edit/delete/unlock/role changes |
| `/admin/analytics` | Admin only | Reporting and analytics charts |

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/login` | Public | Login with email and password |
| POST | `/logout` | Any | Clear session cookie |
| GET | `/me` | Public | Get current session user |
| POST | `/register` | Public | Create Donor account |

### Public Impact (`/api/public`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/impact` | Public | Read-only impact dashboard backed by Azure SQL |

### Health (`/api/health`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Readiness check for startup and database connectivity |
| GET | `/ready` | Public | Alias for readiness check |
| GET | `/live` | Public | Lightweight liveness check that returns 200 when the process is running |
| GET | `/full?details=true` | Public | Readiness check with startup checkpoints and diagnostics |

### Admin Portal (`/api/admin`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/portal` | Admin | Load dashboard overview |
| POST | `/portal/donors` | Admin | Create donor profile |
| PUT | `/portal/donors/{id}` | Admin | Update donor profile |
| DELETE | `/portal/donors/{id}` | Admin | Delete donor profile |
| POST | `/portal/donors/{id}/contributions` | Admin | Record a contribution for a donor |
| PUT | `/portal/contributions/{id}` | Admin | Update a contribution |
| DELETE | `/portal/contributions/{id}` | Admin | Delete a contribution |
| POST | `/portal/residents` | Admin | Enroll a new resident |
| PUT | `/portal/residents/{id}` | Admin | Update a resident record |
| DELETE | `/portal/residents/{id}` | Admin | Remove a resident record |
| GET | `/portal/residents/{id}/recordings` | Admin | List clinical session recordings for a resident |
| POST | `/portal/residents/{id}/recordings` | Admin | Add a clinical session recording |
| PUT | `/portal/recordings/{id}` | Admin | Update a clinical session recording |
| DELETE | `/portal/recordings/{id}` | Admin | Delete a clinical session recording |
| GET | `/portal/residents/{id}/visitations` | Admin | List visitation records for a resident |
| POST | `/portal/visitations` | Admin | Add a visitation record |
| PUT | `/portal/visitations/{id}` | Admin | Update a visitation record |
| DELETE | `/portal/visitations/{id}` | Admin | Delete a visitation record |

### Admin Users (`/api/admin`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users with roles |
| POST | `/users` | Admin | Create a user |
| PUT | `/users/{id}` | Admin | Update a user profile and role |
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
npm ci
npm run dev
```

Runs at `http://localhost:5173`.

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5262
```

### Backend

```bash
cd backend
dotnet run
```

Runs at `http://localhost:5262`.

Set the connection string via user-secrets:

```bash
cd backend
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_CONNECTION_STRING"
```

On startup the backend will:
1. Auto-apply EF Core migrations
2. Seed the admin account if `AdminSeed__*` env vars are set
3. Seed portal starter data, including donor profiles, sample contributions, residents, recordings, and visitations

### Admin Seed Account

```bash
dotnet user-secrets set "AdminSeed:Email" "admin@example.com"
dotnet user-secrets set "AdminSeed:Password" "YourPassword123!"
dotnet user-secrets set "AdminSeed:DisplayName" "Project Haven Admin"
```

On Azure, set these as App Service environment variables instead.

### Seeded Donor Account

The current seed process also creates a donor account for testing the donor portal:

```text
Email: donor@example.com
Password: ProjectHaven2026!
Role: Donor
```

That donor seed is linked to a portal profile and sample contributions so the donor dashboard has content immediately after seeding.

### Password Policy (IS414)

Passwords must be at least **12 characters** and include uppercase, lowercase, digit, and special character.

### Seed the database from CSV export

```bash
cd backend
dotnet run -- --seed-csv ../seed_data
```

Drops and recreates CSV-backed tables. Requires `ConnectionStrings:DefaultConnection` to be set.

### Backend allowed CORS origins (`appsettings.Development.json`)

```json
{
  "AllowedOrigins": ["http://localhost:5173"]
}
```

---

## Deployment

### Frontend - Azure Static Web Apps
- Auto-deploys on push to `main` via `.github/workflows/azure-static-web-apps-polite-rock-003bb5b1e.yml`
- Build: `npm ci && npm run build` -> `frontend/dist`
- SPA routing handled by `frontend/public/staticwebapp.config.json`
- `VITE_API_URL` is injected at build time from the GitHub secret
- `frontend/package-lock.json` is committed so CI uses a stable dependency tree

### Backend - Azure App Service
- Auto-deploys on push to `main` (changes to `backend/`) via `.github/workflows/deploy-backend.yml`
- EF Core migrations run automatically on startup
- Admin portal seed data is applied after migrations

### Azure SQL Seed Workflow
- Manual workflow: `.github/workflows/seed-azure-db.yml`
- Runs EF migrations then loads all CSV files from `seed_data/` into Azure SQL
- Drops and recreates CSV-backed tables, so use only for a full re-seed

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_POLITE_ROCK_003BB5B1E` | Frontend deploy token |
| `AZURE_APP_SERVICE_NAME` | Backend App Service name (`INTEXW2026`) |
| `AZURE_PUBLISH_PROFILE` | Backend publish credentials |
| `AZURE_SQL_CONNECTION_STRING` | Azure SQL connection string for CSV seed workflow |
| `VITE_API_URL` | Backend API base URL injected into the frontend build |

### Required Azure App Service Environment Variables

| Variable | Purpose |
|---|---|
| `ConnectionStrings__DefaultConnection` | Azure SQL connection string |
| `AdminSeed__Email` | Admin account email to seed on startup |
| `AdminSeed__Password` | Admin account password to seed on startup |
| `AdminSeed__DisplayName` | Admin display name to seed on startup |
| `AllowedOrigins__0` | Frontend URL for CORS (Static Web Apps URL) |

> **Important:** Do NOT set `ASPNETCORE_ENVIRONMENT=Development` in Azure. Development mode sets the auth cookie to `SameSite=Lax`, which breaks cross-origin login between the Static Web App and App Service. Leave it unset (defaults to `Production`).

### Health Checks
- The frontend health page was removed.
- Use the backend endpoints directly for probes:
  - `/api/health/live`
  - `/api/health/ready`
  - `/api/health/full?details=true`

---

## Repo Structure

```text
/
├── frontend/
│   ├── public/
│   │   └── staticwebapp.config.json
│   └── src/
│       ├── components/
│       ├── lib/
│       └── pages/
│           ├── Home.tsx
│           ├── Login.tsx
│           ├── SignUp.tsx
│           ├── Impact.tsx
│           ├── DonorDashboard.tsx
│           └── admin/
│               ├── Dashboard.tsx
│               ├── Residents.tsx
│               ├── Recordings.tsx
│               ├── Donors.tsx
│               ├── Visitations.tsx
│               ├── Users.tsx
│               └── Analytics.tsx
├── backend/
│   ├── Controllers/
│   ├── Data/
│   ├── Migrations/
│   ├── Models/
│   ├── Services/
│   └── Program.cs
├── seed_data/
├── md files/
├── .github/workflows/
└── README.md
```

---

## TODOs

- [x] Admin/staff portal with donors, residents, recordings, visitations, users, and report workflows
- [x] Donor dashboard, contribution history, and anonymized impact view
- [x] Privacy policy page
- [x] Cookie consent banner
- [ ] CSP headers hardening
- [ ] Lighthouse accessibility audit
- [ ] Azure Blob Storage for file uploads
