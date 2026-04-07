# Project Haven – Web Application PRD

### TL;DR

Project Haven is a secure, full-stack web application designed for a Philippine nonprofit safehouse serving abuse and trafficking survivors. Built with a .NET 10/C# backend and a React/TypeScript frontend, utilizing Azure SQL Database and deployed on Microsoft Azure, it supports unauthenticated public visitors/donors as well as authenticated staff/admin users. Features include donor management, resident case management, process/counseling session logs, home visitation and conference tracking, and robust outcome reporting—all with strong privacy and compliance controls.

### Current Implementation Status

The current build already includes the public home page, donor-facing impact dashboard, privacy policy page, cookie-consent banner, secure login/admin routes, and the authenticated admin/staff portal. The staff portal now includes a dashboard, donor/contribution workflows, resident/caseload management, process recordings, visitations, and reports backed by EF Core persistence. Public impact data is read from the connected Azure SQL database rather than mocked.

---

## Goals

### Business Goals

- Centrally manage resident cases throughout intake, counseling, visitation, reintegration, and reporting.
- Drive donor engagement through a transparent, public-facing impact dashboard directly linking donations to organizational outcomes.
- Comply rigorously with data security and privacy standards, safeguarding sensitive information about victims and survivors.
- Streamline operations for minimal staff through an intuitive and efficient admin portal.
- Successfully deploy a publicly accessible, production-grade solution to Microsoft Azure.

### User Goals

- Admins and staff can efficiently create, view, update, and manage both resident and donor records from a unified portal.
- Donors can transparently see how their contributions drive specific, aggregate impact, with no private data exposure.
- Unauthenticated users can discover the mission, view impact stats, and access clear calls to action via a professional landing page.
- Counseling sessions and field visit records are consistently documented, structured, and easy to find.
- Administrators can generate actionable reports and analytics for internal and external accountability.

### Non-Goals

- No machine learning or AI-driven analytics/prediction features (handled separately in IS455).
- No social media tools for posting, scheduling, or campaign management.
- No inclusion of project management documentation/artifacts (personas, journey maps, burndown charts).

---

## User Stories

### Unauthenticated Visitor

- As a Visitor, I want to browse the homepage, so that I can learn about the organization’s mission and values.
- As a Visitor, I want to view an impact dashboard, so that I can see overall outcomes and organizational progress.
- As a Visitor, I want to access the privacy policy, so that I understand how my data is handled.
- As a Visitor, I want to initiate account login, so that I can access donor or admin features if authorized.

### Authenticated Admin/Staff

- As an Admin, I want to log in and access the dashboard, so that I can oversee current operations and key metrics.
- As an Admin, I want to create, view, update, and delete resident profiles, so that all case details are up to date in the caseload inventory.
- As an Admin, I want to log process recordings for counseling sessions, so that progress and interventions are tracked systematically.
- As an Admin, I want to log home visitation and case conference records, so that all contact with residents and their families is documented.
- As an Admin, I want to manage donor/supporter profiles and contributions, so that the organization can maintain accurate supporter records.
- As an Admin, I want to view reports and analytics, so that I can track outcomes, donor activity, and support annual reporting.

### Authenticated Donor

- As a Donor, I want to log in and view my donation history, so that I can track my contributions.
- As a Donor, I want to see aggregated, anonymized impact information about how my donations have been used, so that I feel engaged and informed.

---

## Functional Requirements

### PUBLIC PAGES (Priority: P0)

- **Home/Landing Page:** Mission statement, calls to action (Donate, Learn More, Login), primary navigation.
- **Impact/Donor-Facing Dashboard:** Interactive, visual display of anonymized and aggregated outcome and donation data.
- **Login Page:** Username/password login with client/server validation and clear error handling.
- **Privacy Policy:** GDPR-compliant policy linked in page footer; functional cookie consent notification.

### ADMIN PORTAL – DASHBOARD (Priority: P0)

- **Admin Dashboard:** High-level KPIs—active residents/safehouse, recent donations, upcoming case conferences, summarized progress, all at-a-glance.

### ADMIN PORTAL – DONORS & CONTRIBUTIONS (Priority: P0)

- **Supporter Management:** View/create/update supporter profiles; classify supporters by type (e.g., MonetaryDonor, Volunteer, Partner).
- **Contribution Tracking:** Record and view all donations (monetary, in-kind, time, skills, social media); line-level entry for in-kind gifts.
- **Allocation Views:** Show how donations support specific safehouses/program areas.

### ADMIN PORTAL – CASELOAD INVENTORY (Priority: P0)

- **Resident Management:** Full-profile CRUD; track demographics, case categories/subcategories, disabilities, family/socio-demographic data, admission and referral details, social worker assignment, reintegration status; confirmation dialogue for deletes.
- **Lists/Filters:** Paginated table, search and filter by case status, safehouse, category, or risk level.

### ADMIN PORTAL – PROCESS RECORDINGS (Priority: P0)

- **Counseling Logs:** Structured form for session notes—date, worker, type, duration, emotional state, summary, interventions, follow-up, flags; per-resident chronological session history view.

### ADMIN PORTAL – HOME VISITATION & CASE CONFERENCES (Priority: P1)

- **Visitation Logging:** Form for visit type, observations, family engagement, safety concerns, follow-up.
- **Conference Logging:** Per-resident history and future events for case conferences.

### ADMIN PORTAL – REPORTS & ANALYTICS (Priority: P1)

- **Dashboards:** Trends (donation, outcome, reintegration), safehouse comparisons, accomplishment report-alignments; filter/export features.

### SECURITY (Priority: P0)

- **HTTPS/TLS:** Enforced, with HTTP-to-HTTPS redirect.
- **Authentication:** Session-cookie login for the current MVP, with the long-term option to move to ASP.NET Identity if the team wants a fuller account system.
- **Role-based Access Control:** Admin (CUD), Donor (own data, read-only), Visitors (public data only).
- **API Protection:** All non-public endpoints require auth.
- **Delete Confirmation:** All destructive actions confirmed via modal.
- **Secrets Management:** Credentials in Azure env variables/secrets, never source control.
- **GDPR Cookie Consent:** Functional, not cosmetic.
- **CSP Headers:** Only minimum required sources allowed.

### ADDITIONAL SECURITY (Priority: P1)

- **OAuth Login/MFA/HSTS:** Optional—third-party login, multi-factor auth, HSTS header, user preference cookie, data sanitization.
- **Database Deployment:** Both operational and identity DBs reside in Azure SQL, not SQLite.

---

## User Experience

**Entry Point & First-Time User Experience**

- Visitors access the Home page via public URL; first-time users see a cookie consent banner that must be accepted or managed before proceeding.
- Navigation is visible and intuitive, with clear CTAs (“Donate”, “Learn More”, “Login”).
- Login is accessible from the main navigation and CTA buttons.

**Core Experience**

- **Step 1: Home/Impact Dashboard**
  - Minimal friction, large hero image, concise mission, instant access to impact data (charts, stats), no personal data visible.
  - Forms and charts auto-adjust to screen size (responsive).
- **Step 2: Login**
  - Users enter credentials; both client and server validation.
  - Error messages are specific (e.g., "invalid password").
  - Upon success: Admins redirected to dashboard, donors to their impact/donation history.
- **Step 3: Admin Dashboard**
  - Metric cards for residents, donations, events; at-a-glance graphs; all KPIs visible.
  - Sidebar navigation to Donors, Caseload, Recordings, Home Visits, Reports.
- **Step 4: Donors & Contributions**
  - Supporter list/table (search, filter), click-through for detail, create new supporter, add/view contributions.
  - Add in-kind donation: opens detailed line-item modal.
  - All lists paginated; success/error via toast notifications.
- **Step 5: Caseload Inventory**
  - Paginated resident table, filter by safehouse/status/category/risk.
  - Click through to edit/view; full-profile in modal or new page; confirmation on delete.
  - Add new resident: multi-step form with all required fields.
- **Step 6: Process Recordings**
  - Select resident, see session history (list/expand/collapse).
  - Add/process session: input all required fields, submit and validate.
- **Step 7: Home Visitation & Conferences**
  - Log new events; see past and scheduled events per resident; structured forms.
- **Step 8: Reports & Analytics**
  - Interactive charts, select by safehouse/date.
  - Export/download options; aligns with annual report structure.

**Advanced Features & Edge Cases**

- Unauthenticated users attempting admin access are redirected to login.
- All deletes require confirmation modals.
- Donor-only users are restricted from admin features (403 or redirect).
- Restricted/admin-only fields are hidden from donors.
- Field and form validation throughout; clear error messaging.

**UI/UX Highlights**

- Fully responsive for desktop/mobile.
- Pagination for large tables/lists.
- Unified color palette, typography, and logo branding.
- Lighthouse accessibility ≥ 90% on all pages.
- All pages titled, favicon set, and ARIA labels present.
- Loading skeletons and spinners for async operations.
- Inline form field validation; toast/snackbar for key actions.

---

## Narrative

As a social worker for Project Haven, Maria used to spend hours each week maintaining stacks of paper files, jotting down counseling summaries, and reconstructing resident progress from scattered notes. Juggling cases across two safehouses, she struggled to document every interaction and ensure that all residents—many with urgent and sensitive needs—were receiving the support and tracking necessary for safety and healing. Reporting for donors was no easier: gathering outcome stories and donation receipts from boxes of paperwork left gaps and delayed critical funding.

With Project Haven’s web application, Maria logs into the secure admin portal and, within minutes, updates a resident’s caseload profile, enters today’s counseling session recording (with interventions and follow-up), and marks reintegration milestones—all without sifting through paper or duplicating data. The dashboard shows real-time stats: current safehouse occupancy, new donations received, and upcoming field visits. If a donor asks about the impact of their gift, Maria can point them to the public impact dashboard, knowing aggregate outcomes are visible without exposing any survivor’s identity.

Thanks to Project Haven, the nonprofit spends more time caring for survivors and less on administrative overhead. Donors see exactly how their support drives change. For staff, the process is easier, safer, and built for the critical mission they serve.

---

## Success Metrics

- **User-Centric Metrics**
  - % of admins/staff who complete a full resident profile entry without external support (target: ≥90%)
  - Average time to log a process recording (target: <3 minutes)
  - Task completion rate for resident, session, and donation workflows (target: ≥95%)

- **Business Metrics**
  - All IS413/IS414 requirements fully demoed and validated
  - Application deployed to Azure, >99% uptime during grading
  - No credentials or sensitive keys exposed in any repository

- **Technical Metrics**
  - Lighthouse accessibility score ≥ 90% on all pages
  - All application routes are fully responsive on mobile and desktop
  - Average API CRUD response time <500ms
  - CSP and security headers present and verifiable via browser tools

- **Tracking Plan**
  - User login success/failure
  - Resident record created, updated, deleted
  - Process recording submitted
  - Donation recorded
  - Page view per route
  - Caseload filter/search usage
  - Reports/analytics dashboard access

---

## Technical Considerations

### Technical Needs

- RESTful API backend (controller-based, .NET 10/C#)
- Session-cookie authentication for the current MVP, with the long-term option to move to ASP.NET Identity later
- Admin, Donor, Visitor (unauthenticated) role definitions
- Entity Framework Core for ORM/migrations
- React/TypeScript frontend with Vite and React Router (protected routes)
- Charting library for dashboards (Recharts, Chart.js, or equivalent)

### Integration Points

- Azure SQL Databases for operational data and identity management
- Optional: OAuth (Google, Microsoft) for third-party login/MFA
- Optional: Azure Key Vault or environment variables for secure secrets

### Data Storage & Privacy

- PII stored only in Azure SQL, accessed exclusively by authenticated users according to role
- Restricted fields (e.g., notes_restricted) only visible to admins
- Public/impact dashboards aggregate data and never expose PII
- Strong GDPR-compliant privacy policy and functional cookie consent
- Segregated identity/operational data models to minimize risk

### Scalability & Performance

- Internal tool with limited concurrency (<50 users)
- All large list/table views must implement pagination
- Azure App Service provides autoscaling if usage increases

### Potential Challenges

- Protection of minor/vulnerable population data requires airtight access control
- CSP may require tuning to accommodate dynamic React rendering
- HSTS and some security headers may require specific Azure setup
- Cookie consent state must be usable (not cosmetic) and set via client cookie

---

## Milestones & Sequencing

### Project Estimate

- **Large:** 4–5 days (suited for intensive INTEX project week pace)

### Team Size & Composition

- **Small Team:** 1–2 people per phase; all features phased as if one highly motivated contributor working full time for one week.

### Suggested Phases

**Phase 1 – Foundation (Day 1)**

- Key Deliverables:
  - .NET 10 API skeleton
  - React/Vite frontend
  - Azure SQL Database schema
  - Public Home page & Login page
  - Session-cookie login with an initial seeded admin account
  - Initial deployment to Azure
- Dependencies: Azure subscription, GitHub repo setup

**Phase 2 – Core Admin Portal (Days 2–3)**

- Key Deliverables:
  - Caseload Inventory CRUD (residents and related tables)
  - Process Recording forms/history
  - Donors & Contributions management
  - RBAC for all portal features
  - Delete confirmation dialogs
- Dependencies: Completion of API/backend scaffolding

**Phase 3 – Secondary Features & Security Hardening (Day 4)**

- Key Deliverables:
  - Home visitation/case conference logging
  - Reports & Analytics dashboard with visualizations
  - HTTPS redirect, CSP header, GDPR cookie consent (fully functional)
  - Public Impact/Donor Dashboard
  - Azure secrets/environment vars set up for credentials
- Dependencies: Completed CRUD and portal features

**Phase 4 – Polish & Submission (Day 5)**

- Key Deliverables:
  - Accessibility compliance (Lighthouse ≥90%)
  - Responsive design audit
  - Branding polish (logo, titles, icons)
  - Final loading/error/validation states
  - Optional: OAuth, MFA, HSTS, dark mode, data sanitization
  - IS413/414 video walkthroughs and submission
- Dependencies: All core and secondary functionalities complete

---
