# Project Haven — AI Prototyping Spec

## Product Overview

Project Haven is a secure, role-based web platform designed for a Native American youth safehouse nonprofit, beginning with the Hopi tribe in Arizona and intended for expansion across tribal nations. The product has two primary fronts: a visually-rich, culturally evocative public site for visitors and donors; and a secure, clean admin/staff portal for resident case management, donor management, and organizational reporting. The prototype covers the public home page (with signature scroll animation), a public impact dashboard, login/auth, admin dashboard, resident inventory (caseload management), process/session logs, donor & contribution manager, and the donor-facing dashboard. Excluded in this prototype: home visitation/case conferences, machine learning pipeline outputs, OAuth/MFA, analytics export module.

---

## Design & Visual Style

**Component Libraries**

- **Aceternity UI** for all public-facing pages (home, impact dashboard) to achieve a cinematic, premium, and motion-rich experience. Use built-in animated cards, hero, and section components.
- **shadcn/ui** for admin and donor portal for clarity, consistency, and rapid build. Use standard shadcn/ui Table, AlertDialog, Sheet, and Sonner toasts.

**Styling Framework**

- **Tailwind CSS v4** throughout, with a custom color token configuration per below. Use Tailwind for spacing, typography, grid, and responsive design.
- Include a `project-haven-theme.js` with tailwind `extend` for color tokens.

**Color System**

- **Primary:** `#1D6968` (deep teal)
- **Secondary:** `#A0422A` (burnt sienna/terracotta)
- **Accent:** `#DCAF6C` (warm sand gold)
- **Background (light):** `#F7F2E8` (warm parchment)
- **Background (dark):** `#101E1D` (deep forest near-black)
- **Surface (light):** `#FFFFFF`
- **Surface (dark):** `#162422`
- **Destructive:** `#DA4737`
- **Border (light):** `#D7D0C3`
- **Text (dark):** `#101E1D`
- **Text (light):** `#F0EBE0` (warm off-white)
- **Muted:** `#8FA89F`
- _No pure black._

**Theme**

- **Both light and dark modes** with a toggle.
- Implement the toggle via Zustand store, persistent in `localStorage` (`haven-theme`) and sync via browser cookie `haven_theme`.
- All surface and text colors derive from tokens (never hardcoded).

**Layout Style**

- **Public/Editorial:** Full-bleed, editorial layout with max-width 1280px, 96–128px vertical section padding, immersive imagery, and premium visual hierarchy.
- **Admin/Donor Portal:** Fixed 260px sidebar, 16–24px content padding, sticky topbar on mobile.
- **Mobile:** All layouts collapse responsively; public site uses single-column scroll (hero scroll animation deactivated).

**Typography & Spacing**

- **Display/Headlines:** [Yeseva One](https://fonts.google.com/specimen/Yeseva+One) (Google Fonts): all hero headlines, page titles, major impact numbers.

- **Body/UI:** [Geist](https://vercel.com/font) (npm package) for primary UI, forms, nav, data tables, and supporting copy.

- **Type Scale:**
  - Display XL: 3.5rem/700 (Yeseva One)
  - Display L: 2.5rem/700 (Yeseva One)
  - H1: 2.125rem/700 (Yeseva One)
  - H2: 1.5rem/600 (Geist)
  - H3: 1.125rem/600 (Geist)
  - Body L: 1.125rem/400 (Geist)
  - Body: 1rem/400 (Geist)
  - Label: 0.85rem/500 (Geist)
  - Caption: 0.75rem/400 (Geist)

- **Public Home & Impact:** Spacious, high vertical rhythm.

- **Admin:** Balanced—neither dense nor sparse; content focus.

**Cultural Motifs**

- _Use subtle Hopi/Navajo/Pacific Northwest geometric motif SVGs_ as section dividers, decorative backgrounds, or tiny border accents.
- Dividers are light, semi-transparent, and never overpower hero content.
- All motifs rendered as SVG illustrations.
- Absolutely do not use sacred or religious iconography.

**Icons**

- **Tabler Icons** (`@tabler/icons-react`), size 24px.
- Integrate consistent iconography for sidebar, CTA, and informational elements.

**Animation**

- **Framer Motion** everywhere—entrance effects, scroll-based animation (see scroll sequence below), subtle hover and card elevation.
- All Nivo charts fade and animate on enter, use "count up" effects for stat numbers.
- _Key accessibility note:_ For users with `prefers-reduced-motion`, animations are either faded transitions or static.

**Reference Sites**

- [Lighthouse Sanctuary](https://lighthousesanctuary.org/) for nonprofit mission tone, section hierarchy, and color warmth.
- [Linear](https://linear.app/) for admin interface clarity, navigation model, and data presentation.

---

## Tech Stack

- **Framework:** Vite + React 18
- **Language:** TypeScript (strict mode)
- **Database:** None (mock data only)
- **Backend:** .NET 10/C# REST API (all calls are **MSW**-mocked for this prototype; backend not included)
- **Auth:** Mock role-based via React Context (Admin, Staff, Donor, Visitor)
- **Hosting target:** Local SPA, also deployable to \[Vercel static hosting\]
- **Key Libraries:**
  - `framer-motion` (animation/scroll)
  - `@tabler/icons-react` (icons)
  - `@nivo/bar`, `@nivo/line`, `@nivo/pie` (charts)
  - `aceternity/ui` (public pages)
  - `shadcn/ui` (admin/donor portal)
  - `@rive-app/react-canvas` (hero animation)
  - `tailwindcss@4`
  - `zustand` (auth state, dark mode state)
  - `msw` (API mocking for all REST endpoints)
  - `react-router-dom@6`

---

## Pages & Navigation

### **Public Pages**

- **Home (/):** Split hero (image + type), mission intro, preview impact stats, see CTA.
- **Impact Dashboard (/impact):** Public KPIs, anonymized charts (Nivo), mission stories.
- **Login (/login):** UI for login with username/password, role-based mock auth.

_Top nav for public:_

- Left: Project Haven wordmark/logo
- Center: Home, Impact, About (disabled), Donate (scroll-to or link)
- Right: Login button, dark mode toggle

### **Authenticated Pages**

**Donor Portal**

- **Donor Dashboard (/donor):** Historic donations table; personalized impact summary with charts.
  - Nav: sidebar with logo, dashboard nav item, impact, donation history

**Admin Portal**

- **Dashboard (/admin):** KPI snapshot cards, recent activities, quicklinks.
- **Caseload Inventory (/admin/residents):** Paginated searchable/filterable resident table. Add/Edit via drawer form.
- **Resident Process Recordings (/admin/residents/:id/recordings):** Timeline view of resident's session history. Add session form.
- **Supporters & Contributions (/admin/donors):** Donor/supporter table, CRUD, contribution record linkage.

_Sidebar for admin/donor:_

- Logo at top
- Nav items: Dashboard, Residents, Donors, Impact (Donor)
- Role badge and logout button anchored bottom
- Collapses to icon-only version below 768px width

_Routing rules:_

- All admin paths (`/admin/*`) require Admin or Staff role, else redirect to /login.
- Donor portal paths (`/donor*`) require Donor or Admin, else /login.
- Home page/nav highlights login state (e.g., show “Dashboard” if authenticated).

---

## Core User Flows

### **Flow 1: Hero Scroll Animation Experience (Public Home)**

1. User lands on `/` and sees a split layout: left 60% is full-bleed Arizona/Hopi landscape photo, right 40% is a Yeseva One headline (“A Safe Place to Heal”), subtitle, and ‘See Our Impact’ CTA.
2. As user scrolls, Framer Motion `useScroll` triggers 4 phases:
3. Image expands from 60% to 100vw, text panel fades and slides left.
4. When full viewport, a new centered headline appears in bold over a darkened scrim.
5. “Cinematic hold”: photo holds, HopiDivider SVG animates in at bottom (line draw/cultural motif motion).
6. Image fades out, next section (“Our Story”) slides up as next entry.
7. On mobile, fallback to static split layout with a simple fade—no scroll-linked animation.

### **Flow 2: Login and Auth Redirect**

1. User clicks “Login” in nav.
2. Login page with minimal form, parchment background.
3. User enters credentials; on submit, mock checks role.
4. Role-based redirect routes:

- Admin/Staff → `/admin`
- Donor → `/donor`
- Visitor/invalid → shows inline error.

### **Flow 3: Resident Record Creation (Admin)**

1. Admin navigates to `/admin/residents`.
2. Resident table loads (paginated, filter/search controls above).
3. Clicks “Add Resident”—Drawer (Sheet) slides in from right.
4. Multi-step form (Step 1 Demographics, Step 2 Case, Step 3 Assignment).
5. Each step has inline validation; submit triggers success toast (bottom right).
6. Table reloads, new resident appears at top.

### **Flow 4: Donor Dashboard Impact**

1. Auth’d donor goes to `/donor`.
2. Sees donation history table, sortable.
3. Below: impact summary cards + Nivo charts (pie/bar), with color tokens.
4. User can toggle light/dark mode; UI updates instantly.

---

## Data Model & Backend

_All API calls are mocked in frontend using MSW with realistic seed data and in-memory persistence._

**Entities**

- **Resident** (`resident_id`, `name_placeholder`, `safehouse`, `tribe`, `case_category`, `risk_level`, `status`, `assigned_staff`, `admission_date`, `reintegration_status`)
- **ProcessRecording** (`recording_id`, `resident_id`, `session_date`, `staff_name`, `session_type`, `emotional_state`, `summary`, `interventions`, `follow_up`)
- **Supporter** (`supporter_id`, `display_name`, `supporter_type`, `status`, `email`, `acquisition_channel`, `first_donation_date`)
- **Donation** (`donation_id`, `supporter_id`, `donation_type`, `amount`, `donation_date`, `campaign_name`, `channel_source`)
- **PublicImpactSnapshot** (`snapshot_id`, `snapshot_date`, `headline`, `active_residents`, `total_donations_php`, `reintegration_count`, `safehouse_count`)
- **User** (`user_id`, `username`, `role: Admin | Staff | Donor | Visitor`)

## Key Components

### **HeroScrollSequence**

- Custom Aceternity + Framer Motion component
- **Behavior:**
  - Fixed background image layer (full-bleed Arizona/Hopi photo)
  - Text layer: right-side type, CTA
  - 4-phase scroll transitions using `useScroll` & `useTransform`:
    1. Image grows from 60% to 100% width, text fades/slides.
    2. New headline appears, dark semi-transparent overlay
    3. “Hold”: SVG HopiDivider animates (line path draw via Framer Motion `pathLength`)
    4. Image opacity drops, next section content animates up
  - Respect `prefers-reduced-motion` for accessibility (skip scroll, use simple fade)
  - _On mobile_: fallback to static split, no scroll effect

### **RiveHeroAnimation**

- One `.riv` asset, geometric motif animation
- Component wraps via `@rive-app/react-canvas`
- Auto-plays in loop on public hero or impact
- Graceful fallback: use SVG version if Rive fails

### **NivoChartTheme**

- Export shared theme object for all Nivo charts
- Applies Haven color tokens for fills/labels/axes
- Includes colorblind-safe categorical palette

### **ImpactStatCard**

- Adapted Aceternity animated card
- Displays animated count-up number (Yeseva One), label (Geist), gold accent bar

### **DataTable**

- shadcn/ui Table with:
  - Sticky thead
  - Zebra striping
  - Row hover highlight
  - Search/filter header
  - Bottom pagination controls

### **ResidentDrawer**

- shadcn/ui Sheet (slide-in)
- 3-step form wizard (Geist labels, display progress)
- Validates on change
- Auto focus on mount
- Closes on submit or Esc

### **DeleteConfirmModal**

- shadcn/ui AlertDialog
- Red warning icon, explicit destructive copy
- “Cancel” and red “Delete” button

### **ToastSystem**

- shadcn/ui Sonner
- Bottom-right position
- Success (teal), Error (destructive), Info (muted)
- Auto-dismiss after 4s

---

## AI Generation Notes

- **SKIP:** Email notifications (log to console), real payment processing, OAuth/MFA, home visitation/case conference pages, reports export (show disabled button), social analytics.
- **Seed data:** Realistic placeholder (no PII), cultural names, 12 months impact, 20+ residents, 10+ supporters.
- **Responsiveness:** Fully mobile; public site collapses to single-column, hero scroll disabled on <768px, admin sidebar collapses.
- **Performance:** All charts (Nivo) are lazy-loaded via React.lazy and Suspense. Animated skeletons for data loads.
- **Routing:** Use `react-router-dom` with SPA catch-all redirect; MSW service worker starts only in dev mode.
- **Dark mode:** Managed by Zustand, HTML class, persisted in `localStorage` and `haven_theme` cookie.
- **Accessibility:** All animated sequences have static/fade fallback for users preferring reduced motion.
- **Other:** No pure #000; all dark UIs use specified token colors.

---

**End of Spec**
