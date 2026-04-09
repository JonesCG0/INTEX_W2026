# Project Haven

A secure full-stack case management application for a nonprofit safehouse supporting abuse and trafficking survivors. The current build includes the public site, public impact reporting, donor self-service, the authenticated admin portal, and an admin ML dashboard backed by notebook pipelines.

---

## Live Deployment

| Service | URL |
|---|---|
| Frontend (primary) | https://jonescg0.net |
| Frontend (www) | https://www.jonescg0.net |
| Frontend (Azure Static Web Apps) | https://polite-rock-003bb5b1e.1.azurestaticapps.net |
| Backend API (primary custom domain) | https://api.jonescg0.net |
| Backend API (App Service hostname) | https://intexw2026-crd9brarcfhyf9b8.francecentral-01.azurewebsites.net |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | ASP.NET Core (.NET 10) Web API |
| Auth | ASP.NET Identity, cookie-based, roles: `Admin` / `Donor` |
| Database | Azure SQL Database with EF Core migrations |
| Hosting (frontend) | Azure Static Web Apps |
| Hosting (backend) | Azure App Service, France Central |
| CI/CD | GitHub Actions |

---

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page |
| `/impact` | Public | Public impact dashboard |
| `/privacy` | Public | Privacy policy |
| `/login` | Public | Email/password login |
| `/signup` | Public | Donor registration |
| `/donor` | Donor | Donor dashboard and contribution history |
| `/admin` | Admin | Operational overview dashboard |
| `/admin/residents` | Admin | Resident management |
| `/admin/donors` | Admin | Donor and contribution management |
| `/admin/visitations` | Admin | Visitation records |
| `/admin/conferences` | Admin | Case conferences |
| `/admin/recordings` | Admin | Process recordings |
| `/admin/outreach` | Admin | Outreach performance |
| `/admin/users` | Admin | User and role management |
| `/admin/analytics` | Admin | Reporting and analytics |
| `/admin/ml-pipelines` | Admin | Eight notebook-backed ML pipelines with output previews |

---

## API Surface

### Auth

| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Log in with email and password |
| `POST` | `/api/auth/logout` | Authenticated | Clear auth cookie |
| `GET` | `/api/auth/me` | Public | Return current session status |
| `POST` | `/api/auth/register` | Public | Create donor account |

### Public

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/public/impact` | Public | Public impact dashboard data |
| `GET` | `/api/health` | Public | Readiness check |
| `GET` | `/api/health/ready` | Public | Readiness alias |
| `GET` | `/api/health/live` | Public | Liveness check |
| `GET` | `/api/health/full?details=true` | Public | Full startup diagnostics |

### Admin

The admin API supports donor, contribution, resident, recording, visitation, conference, outreach, user, analytics, and ML dashboard workflows through `/api/admin/*` and `/api/ml/*`.

---

## Local Development

### Prerequisites

- Node.js 20+
- .NET 10 SDK

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5262
```

### Backend

```bash
cd backend
dotnet run
```

Set the connection string with user secrets:

```bash
cd backend
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_CONNECTION_STRING"
```

The backend auto-applies migrations and seeds starter portal data on startup when configuration is present.

---

## Production Auth Configuration

The production frontend should call the API through the custom API domain:

```env
VITE_API_URL=https://api.jonescg0.net
```

For reliable mobile login, the frontend and backend must stay on the same site boundary:

1. Frontend on `https://jonescg0.net`
2. API on `https://api.jonescg0.net`
3. Auth cookie scoped to `.jonescg0.net`

Backend production settings:

```json
"AuthCookie": {
  "Domain": ".jonescg0.net",
  "SameSite": "None"
}
```

This avoids third-party cookie behavior on mobile browsers.

Recommended App Service environment variables:

| Variable | Purpose |
|---|---|
| `ConnectionStrings__DefaultConnection` | Azure SQL connection string |
| `AllowedOrigins__0` | `https://jonescg0.net` |
| `AllowedOrigins__1` | `https://www.jonescg0.net` |
| `AllowedOrigins__2` | `https://api.jonescg0.net` |
| `AuthCookie__Domain` | `.jonescg0.net` |
| `AuthCookie__SameSite` | `None` |
| `AdminSeed__Email` | Seed admin email |
| `AdminSeed__Password` | Seed admin password |
| `AdminSeed__DisplayName` | Seed admin display name |

Important:

- Do not run Azure with `ASPNETCORE_ENVIRONMENT=Development`
- Development mode forces a different cookie policy and is not valid for production auth behavior

---

## ML Pipelines

The admin ML dashboard surfaces eight notebook-backed pipelines:

| Pipeline | Notebook | Output CSV |
|---|---|---|
| Donor lapse classification | `donor_lapse_classification.ipynb` | `donor_lapse_scores.csv` |
| Reintegration readiness classification | `reintegration_readiness_classifications.ipynb` | `resident_reintegration_queue.csv` |
| Safehouse performance monitoring | `safehouse_performance_monitoring.ipynb` | `safehouse_performance_scores.csv` |
| Social media donation conversion classifier | `social_media_classification_commented.ipynb` | `social_media_planning_scores.csv` |
| Donation allocation optimization | `donation_allocation_optimization.ipynb` | `donation_allocation_optimization_priority_recommendations.csv` |
| Education outcome prediction | `education_outcome_prediction.ipynb` | `education_outcome_prediction_scores.csv` |
| Health and wellbeing trajectory | `health_wellbeing_trajectory.ipynb` | `health_wellbeing_trajectory_metrics.csv` |
| Intervention effectiveness analysis | `intervention_effectiveness.ipynb` | `intervention_effectiveness_scores.csv` |

Output behavior:

- Azure Blob output is preferred when configured
- local repo CSVs under `ml-pipelines/generated_outputs/` remain the fallback
- the admin page can still preview repo snapshots if live Azure ML output is unavailable

Live Azure ML mode uses backend `AzureMl` configuration plus the command-job runner in `ml-pipelines/run_notebook_job.py`.

---

## Deployment Notes

### Frontend

- Azure Static Web Apps deploys from `.github/workflows/azure-static-web-apps-polite-rock-003bb5b1e.yml`
- `VITE_API_URL` is injected at build time from the GitHub Actions secret
- SPA routing is handled by `frontend/public/staticwebapp.config.json`

### Backend

- Azure App Service hosts the ASP.NET Core API
- EF Core migrations run on startup
- the backend supports Azure ML job submission and Blob-first output reads with repo fallback

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_POLITE_ROCK_003BB5B1E` | Frontend deployment token |
| `AZURE_APP_SERVICE_NAME` | Backend App Service name |
| `AZURE_PUBLISH_PROFILE` | Backend publish profile |
| `AZURE_SQL_CONNECTION_STRING` | Azure SQL seed workflow |
| `VITE_API_URL` | Frontend API base URL |

---

## Repo Structure

```text
/
|-- frontend/
|   |-- public/
|   |   `-- staticwebapp.config.json
|   `-- src/
|       |-- components/
|       |-- lib/
|       `-- pages/
|-- backend/
|   |-- Controllers/
|   |-- Data/
|   |-- Migrations/
|   |-- Models/
|   |-- Services/
|   `-- Program.cs
|-- ml-pipelines/
|   |-- generated_outputs/
|   |-- run_notebook_job.py
|   |-- AZURE_ML_SETUP.md
|   `-- *.ipynb
|-- seed_data/
|-- md files/
|-- .github/workflows/
`-- README.md
```

---

## Current Gaps

- End-to-end validation of live Azure ML runs in the deployed environment remains to be fully exercised
