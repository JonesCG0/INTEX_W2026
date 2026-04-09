# Project Haven - AI Prototyping Spec

## Product Overview

Project Haven is a secure, role-based web platform for a Native American youth safehouse nonprofit. The product has two surfaces:

- a visually rich public site for donors and community members
- a secure admin and donor portal for operational use

The current prototype and implementation include:

- public home page
- public impact dashboard
- privacy, login, and donor signup
- donor dashboard
- admin dashboard and CRUD workflows
- admin ML pipelines dashboard with eight notebook-backed slots

Current deployment direction:

- frontend: Azure Static Web Apps
- backend: Azure App Service
- production auth: same-site `jonescg0.net` + `api.jonescg0.net`

Excluded from the current prototype:

- OAuth / social login
- MFA
- advanced export/report packaging

---

## Design and Visual Style

### Component Libraries

- Aceternity UI for public-facing pages
- shadcn/ui for admin and donor portal flows

### Styling

- Tailwind CSS
- Project Haven custom color tokens
- Responsive layouts across desktop and mobile

### Color System

- Primary: `#1D6968`
- Secondary: `#A0422A`
- Accent: `#DCAF6C`
- Background light: `#F7F2E8`
- Background dark: `#101E1D`

### Typography

- Yeseva One for hero/display moments
- Geist for UI, forms, tables, and body copy

### Motion

- Framer Motion for page transitions and public-site animation
- Nivo chart animation with reduced-motion fallback

### Cultural Motifs

- Use geometric SVG motifs inspired by regional visual language
- Do not use sacred or religious iconography

---

## Technical Stack

- Frontend: React + TypeScript + Vite
- Backend: ASP.NET Core Web API on .NET 10
- Auth: ASP.NET Identity with cookie auth
- Database: Azure SQL
- ML: Azure ML command jobs plus Blob-backed output previews with repo fallback
- Charts: Nivo
- Routing: React Router

---

## Pages and Navigation

### Public

- `/`
- `/impact`
- `/privacy`
- `/login`
- `/signup`

### Donor

- `/donor`

### Admin

- `/admin`
- `/admin/residents`
- `/admin/donors`
- `/admin/visitations`
- `/admin/users`
- `/admin/analytics`
- `/admin/ml-pipelines`

---

## Functional Expectations

### Public Site

- cinematic but readable home page
- impact reporting with responsive charts
- accessible navigation and consent flows

### Donor Portal

- email/password auth
- personal dashboard
- contribution history

### Admin Portal

- residents, donors, contributions, recordings, visitations, users
- analytics and operational charts
- ML dashboard with eight pipeline cards and output preview support

### ML Dashboard

- show expected input/output context per pipeline
- prefer Azure Blob-backed outputs when configured
- fall back to local repo CSVs under `ml-pipelines/generated_outputs/`
- support Azure ML job submission when backend config is present

---

## Non-Functional Requirements

- responsive UI
- WCAG-conscious interaction patterns
- secure role-based access
- production-safe cookie auth configuration
- deployable frontend and backend builds

---

## Notes for Prototype Work

- Keep public and admin design systems distinct but coherent
- Preserve the local CSV fallback for ML previews unless explicitly removed
- Do not reintroduce social login placeholders
- Do not point production frontend traffic back to the raw `azurewebsites.net` backend host
