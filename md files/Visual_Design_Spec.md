# Project Haven — Visual Design System Spec

---

## Overview & Design Philosophy

This specification defines the visual system for Project Haven, a platform supporting a Native American youth safehouse nonprofit. The system embodies a dual design identity: a cinematic, culturally resonant public site for donors and community members, and a clean, grounded admin portal for staff operations. Every decision documented herein intentionally addresses the needs of both audiences with appropriate tone, clarity, and trustworthiness.

## Current Implementation Note

The live frontend now uses this visual direction for the public home page, donor-facing impact dashboard, privacy policy page, and authenticated admin/staff portal. Use the tokens, typography, and spacing below as the source of truth when extending those surfaces.

---

## Color System

Project Haven’s palette blends Desert Mesa and Sacred Earth influences—connecting Arizona/Hopi landscape inspiration with a modern, inclusive nonprofit presence.

**Core Color Tokens**

| Token | Hex Value | Usage | Dark Mode Equivalent |
| --- | --- | --- | --- |
| \--color-primary | #1D6968 | Main brand/CTA elements | #227D7B |
| \--color-secondary | #A0422A | Supporting actions, highlights | #C2522B |
| \--color-accent | #DCAF6C | Buttons, active/elevated accents | #E8C87A |
| \--color-bg-light | #F7F2E8 | Public site background |  |
| \--color-bg-dark | #101E1D | Dark mode bg (public) |  |
| \--surface-default | #FFFFFF | Cards, table rows | #162422 |
| \--surface-elevated | #FBF8F2 | Raised cards, modals | #1E2E2C |
| \--muted | #8FA89F | Muted text, subtle UI | #BECFC7 |
| \--destructive | #DA4737 | Delete, errors | #FF6459 |
| \--border | #D7D0C3 | Dividers, card borders | #272C29 |

**Guidance:**

* Use --color-primary for main navigation, links, and CTAs. Secondary for highlights and important supporting buttons.
* \--color-accent is reserved for moments of celebration or focus (e.g., impact numbers, active stats).
* Surfaces and backgrounds must always provide sufficient contrast (minimum 4.5:1 for text).
* In dark mode, all surface tokens swap and text uses #F0EBE0 for clarity.
* Motif SVGs use --muted or --border for subtle integration.

**Sample CSS Custom Properties:**

```
--color-primary: #1D6968;
--color-secondary: #A0422A;
--color-accent: #DCAF6C;
--color-bg-light: #F7F2E8;
--color-bg-dark: #101E1D;
--surface-default: #FFFFFF;
--surface-elevated: #FBF8F2;
--surface-dark: #162422;
--surface-dark-elevated: #1E2E2C;
--muted: #8FA89F;
--destructive: #DA4737;
--border: #D7D0C3;
--text-dark: #101E1D;
--text-light: #F0EBE0;

```

---

## Typography

A powerful, dual-font system evokes both cultural depth and modern clarity.

### Display Font: **Yeseva One** (Google Fonts)

* **Usage:** Hero headlines, section titles, impact numbers on the public site, and typographic logo/wordmark treatments.
* **Character:** Curved yet architectural serifs, handcrafted flavor, striking letterforms with a grounded presence; test readability on short headers at large sizes.
* **Never use Yeseva One for:** Admin UIs, body copy, small labels, navigation, or dense data.

### Body/UI Font: **Geist** (Vercel)

* **Usage:** All admin UI, table data, forms, navigation, small headlines, captions, and any utility/functional text. Use for public site body and supporting text as well.
* **Character:** Ultra-modern sans with generous curves, excellent screen readability, and neutral personality.

**Type Scale**

| Role | Font | Size (rem) | Line Height | Weight (typ) | Letter Spacing |
| --- | --- | --- | --- | --- | --- |
| Display XL | Yeseva One | 3.5 | 1.05 | 700 | 0 |
| Display Large | Yeseva One | 2.5 | 1.1 | 700 | 0 |
| Heading 1 | Yeseva One | 2.125 | 1.1 | 700 | 0 |
| Heading 2 | Geist | 1.5 | 1.15 | 600 | \-0.01em |
| Heading 3 | Geist | 1.125 | 1.18 | 600 | \-0.01em |
| Body Large | Geist | 1.125 | 1.6 | 400 | 0 |
| Body Default | Geist | 1 | 1.7 | 400 | 0 |
| Body Small | Geist | 0.875 | 1.5 | 400 | 0.01em |
| Label | Geist | 0.85 | 1.3 | 500 | 0.01em |
| Caption | Geist | 0.75 | 1.2 | 400 | 0.01em |

---

## Component Libraries & Tooling

* **Public-Facing (Home, Impact):** [Aceternity UI](https://aceternity.com/)
  * Dynamic spotlight effects, animated cards/statistics, and interactive CTA treatments.
* **Admin & Donor Portal:** [shadcn/ui](https://ui.shadcn.com/)
  * Reliable, easy-to-theme headless components for forms, tables, sidebars, and modals.
* **Styling:** Tailwind CSS v4 everywhere (utility-first, JIT, custom config for color tokens & fonts).
* **Icons:** [Tabler Icons](https://tabler.io/icons) — consistent 24px default, use 16px and 20px for dense UI. All icons use `currentColor`.
* **SVG Motifs:** Custom SVGs (react components) for tribal/divider motifs; always aria-hidden and not representing sacred symbols.
* **Motion:** Framer Motion for animated transitions across both domains.
* **Signature Animation:** Rive (npm package) only for one or two hero-impact moments (not for general iconography).
* 

**Key Packages:**

* `@aceternity/ui`
* `@acme/shadcn-ui`
* `tailwindcss@4`
* `@tabler/icons-react`
* `framer-motion`
* `@rive-app/react-canvas`

---

## Spacing & Layout System

**Spacing Scale (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128

* **Public pages:**
  * Section vertical padding: 96–128px
  * Gutter/margin: 48px on desktop
  * Layout: Wide, full-bleed max 1280px
  * Plenty of whitespace, editorial visual rhythm
* **Admin portal:**
  * Sidebar: 260px fixed (with responsive collapse)
  * Content area: 16–24px padding
  * Table/data density balanced for readability

**Grid:**

* **Desktop:** 12 column (with 32px gutters)
* **Mobile:** 4 column (use spacing scale for gutters/margins; content max-width 96%)

---

## Public Site — Visual Language

* **Hero Section:** Split layout: left or right side occupies 60% with full-bleed photography (Arizona/Hopi natural vistas), other side displays a bold Yeseva One headline and short subcopy.
* **Hero Animation:** As user scrolls, Framer Motion transitions image to a full-bleed background, typographic elements gracefully fade, scale, and reposition; a geometric cultural motif SVG animates in as a bottom divider.
* **Cultural Motifs:** SVG-based geometric patterns (not sacred, but inspired by Hopi, Pacific NW, Cherokee, and Iroquois) appear as:
  * Hero bottom wave/divider
  * Section transitions (e.g., break between stories/impact/CTA)
  * Footer top band
  * Card border overlays with hints of color (use --muted or --border only)
* **Interactive Effects:** Use Aceternity spotlight and animated cards for stats, gradient shimmer backgrounds for CTA blocks.
* **Light & Dark Mode:** All visuals and motifs adapt; dark backgrounds remain rich, not pure black.

---

## Admin & Donor Portal — Visual Language

* **Navigation:** Fixed sidebar (260px), Project Haven logo/wordmark at the top, nav items as list with Tabler Icons (icon-left, label right), active highlight in --color-primary.
* **Sidebar footer:** User avatar (optional), user role badge (bg --muted, text --color-primary), settings/logout.
* **Content Area:**
  * Card surfaces (light: #FFFFFF, dark: #162422), 24px padding, 8px border-radius.
  * Forms: labels above inputs, Geist font, 6px radius for inputs, error states in --destructive.
  * Tables: Geist font, alternating row backgrounds (--surface-default and #FAF6EE), sticky headers, hover highlights, pagination controls (bottom right).
* **Feedback:** Toasts on all create/update/delete; modal confirmation for deletes (with explicit warning in red).
* **Motion:** Moderate—sidebar smooth collapse, modal slide-ins (Framer Motion), skeleton loaders, table row hover fade.

---

## Dark Mode System

* **Public:** #101E1D (deep forest) for backgrounds, #162422 for cards/surfaces.
* **Admin:** #0D1716 (slightly deeper dark) main bg, surface tokens as above.
* **Tokens:**
  * \--surface-dark: #162422
  * \--surface-dark-elevated: #1E2E2C
  * \--text-dark: #F0EBE0 (warm off-white), --muted: #8FA89F
* **Contrast:** All combos meet WCAG AA for body and headings (4.5:1+ for body text, 3:1+ for display).
* **Toggle:** Position top-right on all layouts; uses localStorage/cookie (must persist securely and respect prefers-color-scheme).
* **Icons:** Tabler always uses `currentColor` for auto adaptation.

---

## Animation & Motion Guidelines

* **Framer Motion everywhere.**
* **Tier 1 (Public site / Home + Impact):**
  * Hero scroll-triggered transitions (spring easing, 700–900ms major)
  * Text and image reposition/fade/scale
  * SVG motif draw and entrance animation on scroll (section dividers, etc.)
  * Impact numbers: count-up with dynamic accent shimmer
  * Aceternity spotlight and animated cards (Framer Motion powered)
  * Rive: 1 signature animated motif (either at hero or impact dashboard)
* **Tier 2 (Admin/Donor):**
  * Sidebar collapse/expand (300ms ease-out)
  * Modal and toast slide-ins, skeleton shimmer (pulse), table row hovers (200–350ms)
* **Reduced Motion:** All major/intermediate animations have a fallback (prefers-reduced-motion disables or minimizes transitions).

---

## Hero Scroll Animation Sequence — Dev Handoff

This section documents the exact scroll animation sequence for the public site hero, intended as a precise dev handoff for Framer Motion implementation. The hero begins as a split-layout composition and dissolves into a full-bleed cinematic moment as the user scrolls, then gracefully hands off to the next section. The entire sequence is orchestrated using Framer Motion's `useScroll` and `useTransform` hooks, with scroll progress (0 to 1) driving every value.

### Phase 0 — Initial State (scroll progress: 0)

Left column (60% width): Full-bleed photography of Arizona/Hopi landscape, slightly zoomed in (scale 1.05), with a soft warm overlay gradient at 20% opacity using **--color-bg-dark**. Right column (40% width): Yeseva One headline at Display XL, two lines max, left-aligned. Below it: a Body Large subtitle in Geist, and a primary CTA button. Both columns are vertically centered. A geometric SVG motif (Hopi-inspired step pattern) sits at the very bottom of the viewport, partially visible, at 0% opacity.

### Phase 1 — Entry (scroll progress: 0 → 0.2)

The image column begins expanding its width from 60% toward 100% using a spring easing (stiffness: 80, damping: 20). The text block begins fading out (opacity 1 → 0) and translating left (translateX: 0 → -40px). The CTA button fades out faster than the headline (CTA opacity leads by 0.05 scroll units). The warm image overlay gradually increases to 35% opacity to maintain text contrast during transition.

### Phase 2 — Expansion (scroll progress: 0.2 → 0.5)

Image reaches full-bleed (100vw × 100vh). The image scale animates from 1.05 → 1.0 (subtle Ken Burns release). A new centered text block fades in over the full-bleed image: a single Yeseva One Display XL line in **--text-light**, centered horizontally and vertically, with a subtle upward translate (translateY: 20px → 0). A dark gradient scrim (linear, bottom 40% of image, **--color-bg-dark** at 60% opacity) ensures legibility. The image overlay transitions from warm tint to the dark scrim.

### Phase 3 — Hold (scroll progress: 0.5 → 0.7)

Full cinematic moment. Image is full-bleed, centered headline is fully visible, scrim is at full opacity. The Hopi-inspired SVG divider at the bottom animates in: SVG path draw animation (stroke-dashoffset from 100% → 0%, duration 600ms, ease-out), opacity 0 → 1. This is the "poster frame" moment — the visual that should feel like a still from a film.

### Phase 4 — Handoff (scroll progress: 0.7 → 1.0)

The full-bleed image begins scaling up very slightly (scale 1.0 → 1.03) and fading out (opacity 1 → 0). The centered headline translates upward and fades (translateY: 0 → -30px, opacity 1 → 0). The SVG divider at the bottom remains visible and becomes the visual bridge to the next section. The next section (Our Story / Mission) begins rising from below using a translateY (60px → 0) and opacity (0 → 1) entrance, timed to start at scroll progress 0.8.

### Implementation Notes

* Use Framer Motion's `useScroll` with a ref attached to a scroll container div wrapping the hero.
* Use `useTransform` to map scroll progress ranges to each animated value (width, scale, translateX/Y, opacity, scrim opacity, SVG stroke offset).
* The image element should be `position: fixed` during the scroll sequence and return to `position: relative` after Phase 4 completes (use a sentinel element + IntersectionObserver to trigger this switch).
* SVG divider draw animation: animate stroke-dasharray and stroke-dashoffset; synchronize duration (600ms) with an ease-out timing when the mapped scroll range reaches the Phase 3 threshold.
* All spring/easing values are suggestions — tune in browser for feel (example spring: stiffness 80, damping 20).
* Provide a **prefers-reduced-motion** fallback: skip Phases 1–3 entirely, show the Phase 0 split layout statically, and use a simple opacity fade to transition to the next section.

## Data Visualization — Nivo

* **Charts:** Use Nivo’s ResponsiveBar, ResponsiveLine, ResponsivePie, ResponsiveBump for all dashboard widgets.
* **Theme:**
  * Custom Nivo theme (fonts, borders, and fills use Project Haven color tokens)
  * Color sequence:
    1. #1D6968 (primary teal)
    2. #A0422A (sienna/terracotta)
    3. #DCAF6C (gold)
    4. #4A7C70 (muted green)
    5. #C4B49A (stone)
  * Colorblind tested for clarity; never use color alone (pair with icon or label)
* **Guidelines:**
  * No gradients in fills (flat color only)
  * Always add ARIA roles/labels, descriptive chart titles for screen readers
  * Tooltips styled like card surfaces, never exceed 300px
  * Always display legend on multi-series charts

---

## Accessibility Standards

* **Baseline:** WCAG AA compliance, Lighthouse ≥90%
* **Focused requirements:**
  * Keyboard navigation for all flows; logical tab order
  * Visible focus rings: 2px solid --color-accent, 2px offset shadow
  * Every interactive element has ARIA role/label as appropriate
  * All images: descriptive alt text
  * All forms: proper label association, validation/error feedback
  * Modals: focus trap and restore, ESC to close
  * Data tables: proper scope, summary, and structured headers
  * Minimum body size: 14px; all text passes contrast
  * SVG cultural motifs: always `aria-hidden='true'`
  * Icons: if used alone, must have ARIA or visible label

---

## Logo & Brand Mark Placeholder

* **Logo space reserved (not yet designed).**
* **Placeholder style:**
  * Rounded rectangle container:
    * 160×40px in admin sidebar
    * 200×48px in public nav
  * Border: 1px solid --border (light mode), or --surface-dark-elevated (dark mode)
  * Text: “Project Haven” set in Yeseva One, Display Large or Display XL as space allows
  * Color: Light text/dark surface in dark mode, dark text/light surface in light mode
* **Hero wordmark:** Use Yeseva One, Display XL as typographic stand-in until formal SVG/logo asset is delivered.

---
