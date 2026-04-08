# Project Haven Product Requirements

Project Haven is a secure, full-stack web application for a nonprofit safehouse supporting survivors of abuse and trafficking.

---

## Current Implementation Status

The current build includes:

- public home, impact, privacy, login, and donor signup pages
- donor contribution recording
- donor dashboard
- admin dashboard
- admin CRUD for donors, contributions, residents, recordings, visitations, and users
- public impact data backed by Azure SQL
- cookie consent and role-based auth

---

## Goals

- Increase donor engagement through transparent impact reporting.
- Support staff workflows for residents and case documentation.
- Keep sensitive data protected and role-gated.
- Provide a deployable Azure-based app for the INTEX sprint.

---

## Functional Requirements

### Public Pages

- Home page
- Impact dashboard
- Login page
- Donor signup page
- Privacy policy

### Donor Features

- View donor dashboard
- Record a donation when signed in
- See contribution history and aggregated impact

### Admin Features

- CRUD donors and contributions
- CRUD residents
- CRUD recordings
- CRUD visitations
- Create, edit, delete, unlock, and role-manage users
- View reports and analytics

---

## Security Requirements

- HTTPS only in deployed environments
- Cookie-based authentication
- Role-based authorization
- Confirm destructive actions before delete
- Keep secrets in environment variables
- Keep public impact data anonymized

---

## Success Metrics

- Admins can complete portal CRUD without manual database edits.
- Donors can log in and record gifts successfully.
- Public impact numbers reflect both public and portal contributions.
- The app deploys cleanly to Azure.
