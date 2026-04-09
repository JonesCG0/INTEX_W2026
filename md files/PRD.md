# Project Haven - Product Requirements Document

---

## Executive Summary

Project Haven is a digital platform for a Native American youth safehouse nonprofit. The product has two distinct surfaces:

- a public-facing experience for donors, supporters, and community members
- a secure operational portal for staff and donors

The platform balances cinematic public storytelling with practical, defensible operations. The implementation uses ASP.NET Identity cookie auth, Azure SQL, Azure Static Web Apps, Azure App Service, and an admin ML dashboard backed by notebook outputs and Azure ML job triggers.

---

## Goals and Success Metrics

- Increase donor engagement through registrations, contribution activity, and dashboard use
- Achieve strong staff adoption for weekly operational workflows
- Maintain WCAG AA accessibility and usable responsive layouts
- Deliver an implementation that is demo-ready and operationally coherent

---

## Core Audiences

- Native American youth and families interacting with safehouse programs
- Safehouse staff, counselors, and administrators
- Donors and grant partners
- Community and tribal stakeholders

---

## Technical Direction

- Frontend: React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, Nivo, Framer Motion
- Backend: ASP.NET Core Web API on .NET 10
- Authentication: ASP.NET Identity with cookie-based role access
- Data: Azure SQL plus Azure Blob/Azure ML outputs for ML workflow integration
- Hosting: Azure Static Web Apps for frontend, Azure App Service for backend
- ML: notebook-backed pipelines surfaced in the admin portal, with Blob-first output reading and repo fallback

Production auth direction:

- frontend on `https://jonescg0.net`
- API on `https://api.jonescg0.net`
- auth cookie scoped to `.jonescg0.net`

That same-site setup is required for reliable mobile login behavior.

---

## User Experience

### Public Site

- Warm, cinematic presentation with scroll-animated hero and cultural motifs
- Strong typography: Yeseva One for display headings, Geist for body and UI
- Youth-first mission framing in the Our Story section
- Public impact dashboard with accessible Nivo charts
- Privacy and consent surfaced clearly

### Donor Experience

- Email/password signup and login
- Donor dashboard with contribution history and personal impact framing
- Responsive cards, tables, and charts that remain readable on mobile

### Admin Experience

- Operational overview dashboard with real-time metrics, alerts, and activity feed
- CRUD workflows for residents, donors, contributions, recordings, visitations, conferences, and users
- Outreach performance view
- Analytics dashboard with responsive chart layouts
- ML pipelines dashboard with eight pipeline cards, output previews, and Azure ML run support

---

## Functional Requirements

### Public

- Home page with animated hero and Our Story section
- Impact dashboard
- Privacy policy
- Cookie consent
- Login
- Donor signup

### Donor

- Authenticated dashboard
- Contribution history
- Personal impact summaries

### Admin

- Resident management
- Donor and contribution management
- Recording and visitation management
- Case conference management
- Outreach performance
- User and role management
- Analytics and reporting
- ML dashboard for notebook-backed pipelines

### ML Dashboard

- Show eight pipeline entries
- Show expected output file for each pipeline
- Read output snapshots from Azure Blob when configured
- Fall back to repo CSV snapshots under `ml-pipelines/generated_outputs/`
- Support demo-mode and Azure ML-backed run submission

---

## Non-Functional Requirements

- Responsive desktop and mobile layouts
- Accessible forms, charts, dialogs, and tables (WCAG AA target)
- Aria-labels on all icon-only interactive elements; decorative icons marked aria-hidden
- Uniform visual design system: Yeseva One for headings, Geist for all body and UI text
- Strict Content Security Policy — no inline event handlers
- Secure cookie-based authentication and role checks
- HTTPS-only production deployment
- Secrets kept out of source control
- Frontend and backend builds must pass before release

---

## Security and Privacy

- Role-based access for Admin and Donor experiences
- Protected backend APIs
- Cookie auth configured for same-site production use across `*.jonescg0.net`
- Delete confirmation modals for all destructive admin actions
- No secrets committed to the repository
- CSP policy enforced — no unsafe-inline script execution

---

## Out of Scope

- Native mobile apps
- Social login providers
- Non-Azure hosting targets

---

## Appendix Note

Use the visual design spec and web application PRD alongside this document for the current implementation details.
