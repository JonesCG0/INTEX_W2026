# Project Haven Visual Design Spec

## Purpose

This spec describes the live visual system for Project Haven.

The current app uses one design language across the public site, donor portal, and admin portal, with the public pages feeling warmer and more editorial and the authenticated areas feeling clean and operational.

---

## Current Surfaces

- Public home page
- Public impact dashboard
- Privacy policy page
- Login and donor signup pages
- Donor dashboard
- Admin dashboard
- Admin donor, resident, recording, visitation, analytics, and user pages

---

## Color System

Use the Project Haven palette consistently:

- Primary: `#1D6968`
- Secondary: `#A0422A`
- Accent: `#DCAF6C`
- Background light: `#F7F2E8`
- Background dark: `#101E1D`
- Surface light: `#FFFFFF`
- Surface dark: `#162422`
- Destructive: `#DA4737`
- Border: `#D7D0C3`
- Muted: `#8FA89F`
- Text light: `#F0EBE0`

Guidance:

- Use teal for core navigation, links, and primary CTAs.
- Use sienna for secondary emphasis.
- Use gold for highlight moments, key numbers, and active states.
- Keep dark mode warm and readable, not pure black.

---

## Typography

- Display font: Yeseva One
- Body/UI font: Geist

Use Yeseva One for:

- hero headlines
- page titles
- major impact numbers

Use Geist for:

- body copy
- forms
- tables
- navigation
- admin UI

---

## Component Language

- Public pages use cinematic section breaks, large spacing, and warm imagery.
- Authenticated pages use shadcn/ui components for tables, sheets, dialogs, and forms.
- Tabler Icons should remain the main icon set.
- Framer Motion should be used for subtle page and component transitions.

---

## Layout Rules

- Public content should use generous whitespace and strong vertical rhythm.
- Admin content should use a fixed left sidebar and dense but readable content blocks.
- Mobile layouts must collapse cleanly to a single column.
- All pages should support light and dark themes.

---

## Accessibility

- Maintain WCAG AA contrast.
- Keep all controls keyboard accessible.
- Use clear labels, validation, and error states.
- Hide decorative SVG motifs from assistive technology.
- Respect `prefers-reduced-motion`.

---

## Current Direction

The existing implementation already follows this system:

- the public site is brand-forward and inviting
- the donor dashboard is simple and data-focused
- the admin portal is direct and efficient
- destructive actions always use confirmation dialogs
