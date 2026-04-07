
# Project Haven — Product Requirements Document

---

## Executive Summary

Project Haven is a digital platform supporting a Native American youth safehouse nonprofit. The platform must balance cinematic, culturally resonant storytelling with professional, secure operations. It will feature a visually immersive public experience aimed at donors and community members and a streamlined admin portal enabling staff to fulfill core safehouse functions. Design and technology choices must express trustworthiness, inclusiveness, and deep respect for Indigenous cultures.

## Current Implementation Status

The current codebase has already implemented the public home page, donor-facing impact dashboard, privacy policy page, and cookie-consent flow, along with the secure login and admin shell. The remaining work in this PRD is now focused on expanding the secure internal workflows and tightening the public-facing polish.

---

## Goals & Success Metrics

* **Increase donor engagement** by 50% (donor account creations, donation submissions, dashboard logins) within the first six months.
* **Achieve high adoption** by staff and program directors (weekly active users >90% of eligible staff).
* **Maintain WCAG AA accessibility** and high usability for all roles.
* **Deliver full feature set** within a five-day INTEX sprint, ready for IS414/INTEX stakeholder demo.

---

## Key Audiences & Personas

* **Native American youth** (interested or participating in safehouse programs)
* **Safehouse staff** (counselors, admin, program directors)
* **Donors & grant partners** (philanthropic foundations, family offices, individual sponsors)
* **Broader community leaders** (tribal representatives, local nonprofits, social work partners)

---

## TECH STACK

* **Frontend:** React (Vite, TypeScript)
  * Aceternity UI (**public pages**), shadcn/ui (**admin/donor portal**)
  * Tailwind CSS v4
  * Nivo for data visualization
  * Framer Motion for animation and transitions
  * Tabler Icons for iconography
  * Rive for signature animated moments
  * Zustand for global state management
* **Backend:** (real-world) .NET/C#, Azure SQL, MS Graph SSO, Azure Storage/Blob
* **Authentication:** Azure AD B2C (for staff/admin); passwordless email magic link (for donors/community)
* **Cloud hosting:** Azure App Service
* **Testing:** Vitest, Storybook, Cypress (component/e2e smoke coverage)
* **Mock Service Worker (MSW):** Used for prototyping and AI-based demo environments

---

## USER EXPERIENCE

### Entry Point/Brand Presence

* Visuals steeped in Indigenous culture and local Southwest geography.
* **Colors:**
  * Primary: #1D6968 (deep teal)
  * Secondary: #A0422A (burnt sienna/terracotta)
  * Accent: #DCAF6C (warm sand gold)
  * Background: #F7F2E8 (warm parchment)
  * Dark mode support: #101E1D for backgrounds
* **Dark mode toggle** is present at the top right, persisted via localStorage and a secure browser cookie, and respects user and system color scheme preference.

---

### Home Page (Public/Web)

* Hero section is a **split layout**: 60% immersive Arizona/Hopi landscape photography, 40% bold Yeseva One headline.
* **Framer Motion powers a 4-phase scroll animation sequence:** As users scroll, the layout transitions from side-by-side split to a full-bleed cinematic moment. The headline and compositional elements fade, shift, or scale, culminating with an SVG Hopi-inspired path-draw divider animating in during the "hold" phase.
* All primary headlines and impact numbers use Yeseva One for strong cultural and visual resonance; supporting text uses Geist.
* Section break dividers use **SVG geometric patterns** inspired by Hopi, Pacific Northwest, Cherokee, and Iroquois traditions (not sacred references).
* Calls-to-action and major navigation transitions employ Aceternity UI's spotlight/gradient effects; all visuals adapt for dark mode.

---

### Impact/Donor Dashboard (Public)

* Visualized with **Nivo charts, themed in Project Haven’s branded sequence:** teal, sienna, gold, muted green, stone.
* All charts are colorblind-safe by default.
* Key metrics use bold Yeseva One numbers, with supporting context in Geist.
* Section transitions and dashboard highlights include Aceternity UI visual effects for a modern yet trustworthy feel.

---

### Admin Dashboard (Staff)

* Layout features a fixed 260px sidebar with the Project Haven logo space at the top, nav items using **Tabler Icons**, and the user's role badge in the sidebar footer.
* All components use **shadcn/ui** with Project Haven theme overrides for color and radius.
* Table/data density is clean but functional; all navigation, actions, avatars, and feedback use consistent iconography via Tabler.
* All admin/donor flows follow Geist typography for sharp modern legibility.

---

### Analytics & Reports

* All analytic charts use **Nivo** (ResponsiveBar, ResponsiveLine, ResponsivePie) with custom Project Haven color theming and full accessibility.
* Modals, forms, and report exports employ shadcn/ui for a robust, consistent UI.

---

## UI/UX Highlights

* **Typography:**
  * *Yeseva One (Google Fonts)* for hero headlines, section titles, and impact numbers on all public pages
  * *Geist (Vercel)* for all admin UI, body content, forms, tables, navigation, and supporting text
* **Component libraries:**
  * Aceternity UI for the public site’s cinematic effects, including spotlight, animated cards, gradient CTAs, hero animation sequences
  * shadcn/ui for admin portal components: all forms, tables, modals, and toasts
* **Icon system:** Tabler Icons (`@tabler/icons-react`) throughout, sized for context
* **Motion/Transition:**
  * Framer Motion powers all transitions: Tier 1 rich animations (hero scroll sequence, modals, card reveals) on the public site; Tier 2 moderate transitions (sidebar collapse, modals, table hovers) on the admin portal
* **Visual motifs:** SVG geometric patterns (never sacred or religious) as section dividers and card accents, responsive to color mode
* **Dark mode:** Full support and theme parity across both the public website and admin portal

---

## Narrative Tone

* **Public:** Hopeful, rooted, bold, inviting participation—never performative or stereotypical. Headlines empower youth and position donors as partners.
* **Admin:** Calm, clear, direct. Forms and data-exploration flows are unambiguous. Confirmations are reassuring but never verbose.

---

## Accessibility

* **WCAG AA** across both domains
* All charts and visualizations are colorblind-safe
* All visuals and transitions have `prefers-reduced-motion` fallback, with compliance tested across Light and Dark Mode variants
* SVG cultural motifs are always `aria-hidden`

---

## Security & Data Privacy

* **P0:** Azure-based SSO, role-based access, protected APIs (as previously described); persistent cookie for color mode and theme
* **P1:** End-to-end encryption, table-level Azure RBAC, all critical operations logged
* **P2:** (No mention of dark mode, as this is now a core feature)

---

## FUNCTIONAL REQUIREMENTS

### Home/Landing Page

* Split hero: 60% immersive landscape photo, 40% headline (Yeseva One), with a 4-phase Framer Motion scroll animation — from side-by-side split to cinematic full-bleed moment. Hopi-inspired SVG divider animates in during the hold phase.
* Visual interest via Aceternity UI spotlight and gradient effects
* SVG geometric patterns inspired by Hopi, Pacific Northwest, Cherokee, and Iroquois cultures, rendered as decorative section dividers and border accents (never sacred icons)
* Main CTA for donors and program info, social links, route to Impact Dashboard

### Impact Dashboard

* Nivo charts styled with Project Haven’s custom theme and colorblind-safe palette
* Key site metrics and stories, pulling from mock or live donor analytics
* Impact numbers use Yeseva One; all supporting text in Geist
* “Our Story” and testimonials laid out with Aceternity UI cards and subtle motion

### Donor & Staff Login

* Azure B2C: donor or staff flow triggers appropriate login; onboarding/role badge, SSO confirmation, and role-based navigation

### Admin Portal

* Dashboard: Organization snapshot, recent activity, and alerts; main nav via 260px fixed sidebar with Tabler Icons
* User Management: Search, invite, role assignment (admin vs director, etc.)
* Program & Participant Manager: Nested tables, filters (location/role), forms (shadcn/ui)
* Donor/Grant Manager: Award pipeline, renewal tracking, reporting
* Forms: Consistent, accessible shadcn/ui pattern, proper Geist labeling

### Analytics & Reports

* Nivo data visualization (ResponsiveBar, ResponsiveLine, ResponsivePie) with custom site theme, accessible legend for all charts
* Export feature (CSV/PDF) for reports

---

## Non-Functional Requirements

* **Performance:** All critical screens <1.5s TTI under demo load
* **Accessibility:** Lighthouse ≥90, full keyboard/screen-reader
* **Security:** As previously specified
* **Theming/Branding:** All color and layout requirements reflect the finalized design system (see above)

---

## Out of Scope

* Mobile native apps
* Social login
* Non-Azure cloud environments
* Custom animations outside Framer Motion/Rive/Aceternity UI ecosystem

---

## Appendices

\[See full Visual Design System Spec for implementation details on color, fonts, Framer Motion hero sequences, and data viz theming.\]

---
