---
version: alpha
name: AceProxy Design System
description: Cross-border proxy-buying e-commerce platform serving Indonesia (primary), Thailand, Philippines, and Brazil. Dual-track visual identity: a warm, high-trust consumer marketplace for the buying experience, and a clean, data-dense operations console for warehouse, logistics, and finance teams. Built on a terracotta-earth primary with teal-ocean accents, Inter for UI body, and a pill-forward component vocabulary.

colors:
  primary: "#d45d3a"
  primary-press: "#b8492a"
  primary-soft: "#fce8e2"
  ocean: "#0f7b8c"
  ocean-soft: "#e0f4f7"
  ink: "#1a1a2e"
  ink-secondary: "#3d3d5c"
  ink-mute: "#6b6b80"
  on-primary: "#ffffff"
  on-ocean: "#ffffff"
  canvas: "#ffffff"
  canvas-warm: "#fefaf7"
  canvas-gray: "#f5f5f8"
  hairline: "#e8e8ef"
  hairline-input: "#c4c4d0"
  success: "#1ea366"
  success-soft: "#e6f7ee"
  warning: "#e8a020"
  warning-soft: "#fef7e6"
  error: "#d14343"
  error-soft: "#fde8e8"
  price-red: "#e53935"
  badge-yellow: "#f5a623"
  id-flag: "#ce1126"
  th-flag: "#2d2a4a"
  ph-flag: "#0038a8"
  br-flag: "#009b3a"

typography:
  display-xl:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.96px
  display-lg:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.72px
  display-md:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.56px
  heading-xl:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.24px
  heading-lg:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.1px
  heading-md:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  heading-sm:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body-lg:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-md:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  body-tabular:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 450
    lineHeight: 1.5
    letterSpacing: 0
    fontFeature: tnum
  button-lg:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0
  button-md:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0
  button-sm:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0.24px
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 450
    lineHeight: 1.4
    letterSpacing: 0.12px
  micro:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: 0
  price-xxl:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.56px
    fontFeature: tnum
  price-lg:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.22px
    fontFeature: tnum
  price-md:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
    fontFeature: tnum
  badge:
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', system-ui, -apple-system, sans-serif"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: 0.44px

rounded:
  none: 0px
  xs: 3px
  sm: 6px
  md: 10px
  lg: 16px
  xl: 24px
  pill: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 48px
  massive: 64px

components:
  button-primary-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.pill}"
    padding: 12px 28px
  button-primary-pill-pressed:
    backgroundColor: "{colors.primary-press}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.pill}"
    padding: 12px 28px
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.pill}"
    padding: 11px 27px
    border: 1.5px solid "{colors.primary}"
  button-ocean-pill:
    backgroundColor: "{colors.ocean}"
    textColor: "{colors.on-ocean}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 20px
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 20px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 10px 14px
    border: 1px solid "{colors.hairline-input}"
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 10px 14px
    border: 1.5px solid "{colors.primary}"
  card-product:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 0px
    border: 1px solid "{colors.hairline}"
  card-product-hover:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    border: 1px solid "{colors.primary-soft}"
    shadow: "0 4px 20px rgba(212, 93, 58, 0.08)"
  card-feature:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
    border: 1px solid "{colors.hairline}"
  card-trust:
    backgroundColor: "{colors.ocean-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 16px
  card-pricing-compare:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  nav-bar-main:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: 12px 24px
  nav-bar-admin:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    padding: 0px 20px
  pill-tag-primary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  pill-tag-ocean:
    backgroundColor: "{colors.ocean-soft}"
    textColor: "{colors.ocean}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  pill-tag-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  pill-tag-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  pill-tag-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  pill-tag-country:
    backgroundColor: "{colors.canvas-gray}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-save:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: 2px 10px
  bottom-nav-mobile:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-mute}"
    padding: 8px 0px 20px 0px
  bottom-nav-mobile-active:
    textColor: "{colors.primary}"
  toast-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  toast-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  timeline-dot-active:
    backgroundColor: "{colors.primary}"
    border: 2px solid "{colors.canvas}"
  timeline-dot-completed:
    backgroundColor: "{colors.success}"
  timeline-dot-pending:
    backgroundColor: "{colors.hairline}"
  table-row-default:
    backgroundColor: "{colors.canvas}"
    typography: "{typography.body-sm}"
    border-bottom: 1px solid "{colors.hairline}"
  table-row-hover:
    backgroundColor: "{colors.canvas-gray}"
  table-header:
    backgroundColor: "{colors.canvas-gray}"
    textColor: "{colors.ink-mute}"
    typography: "{typography.caption}"
  dashboard-kpi-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 20px
    border: 1px solid "{colors.hairline}"
  dashboard-kpi-highlight:
    backgroundColor: "{colors.primary-soft}"
    border: 1px solid "{colors.primary}"
  search-bar:
    backgroundColor: "{colors.canvas-gray}"
    textColor: "{colors.ink-mute}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 10px 20px
---

## Overview

AceProxy operates two visual tracks connected by a single color system and component vocabulary.

**Track 1 — Consumer Marketplace** (mobile-first): The buying experience — product discovery, proxy-purchasing, cart, checkout, order tracking. Warm and trustworthy. The terracotta primary (`{colors.primary}` — `#d45d3a`) anchors the brand, signaling the warmth of Southeast Asian markets and the reliability of a service that handles your purchases. Teal-ocean accents (`{colors.ocean}` — `#0f7b8c`) appear in trust-signal components: logistics timelines, tracking statuses, shipping information. The canvas is predominantly `{colors.canvas-warm}` (`#fefaf7`), a barely-warm off-white that feels like market daylight.

**Track 2 — Admin Console** (desktop): The operations layer — dashboard, warehouse, logistics, finance, vendor management. Clean, dense, data-first. The canvas flips to `{colors.canvas}` (`#ffffff`) with `{colors.canvas-gray}` section backgrounds. The left nav adopts `{colors.ink}` (`#1a1a2e`) as its background, producing a familiar dark-app-shell pattern. The terracotta primary is reserved for actionable highlights; teal-ocean handles status indicators and chart accents.

The two tracks share the pill-button vocabulary, the Inter/Plus Jakarta Sans typographic split, and the same spacing scale — but diverge in canvas density and atmospheric warmth.

**Key Characteristics:**
- Dual-track: warm consumer marketplace (terracotta on warm-white) → clean admin console (dark-nav + data-dense white).
- Terracotta-earth primary (`#d45d3a`) as the brand signature — friendly, warm, Southeast Asian.
- Teal-ocean (`#0f7b8c`) as the trust/status/secondary accent — logistics, tracking, reliability.
- Every price rendered in `{typography.price-xxl}` through `{typography.price-md}` with `tnum` (tabular figures) — money is the core content.
- Pill-shaped everything: buttons, tags, badges, search bars. No squared-off corners in interactive elements.
- Trust-signal components: "Save XX% vs Shopee" comparison bars, logistics timeline with colored dots, warehouse photo previews.
- Mobile-first for consumer track; 1024px+ for admin console.

### Country Adaptation

The design system remains constant across countries, but four elements adapt per locale via `countries/{id,th,ph,br}/config.ts`:
1. **Currency symbol and formatting** (IDR, THB, PHP, BRL)
2. **Country flag accent color** (`{colors.id-flag}`, `{colors.th-flag}`, etc.) — used in country selector pills and shipping badges
3. **Localized price comparison** (e.g., "Save 67% vs Shopee ID")
4. **Festival/seasonal theming** — promotional banner colors adapt to local holidays (Eid, Songkran, Christmas, Carnival)

## Colors

### Brand & Accent
- **Terracotta Primary** (`{colors.primary}` — `#d45d3a`): The brand's CTA color. Filled-pill buttons, price highlights, active navigation indicators, timeline active dots.
- **Terracotta Press** (`{colors.primary-press}` — `#b8492a`): Pressed/hover state of primary buttons.
- **Terracotta Soft** (`{colors.primary-soft}` — `#fce8e2`): Card hover borders, featured KPI highlight cards, subtle decorative backgrounds.
- **Ocean Teal** (`{colors.ocean}` — `#0f7b8c`): Trust/shipping/logistics accent. Tracking status indicators, ocean-pill buttons, trust-signal card backgrounds in light tint.
- **Ocean Soft** (`{colors.ocean-soft}` — `#e0f4f7`): Trust-signal card fills, logistics information panels.

### Semantic Colors
- **Success** (`{colors.success}` — `#1ea366`): Order completed, delivery confirmed, payment successful. Toast backgrounds, timeline completed dots, status pills.
- **Warning** (`{colors.warning}` — `#e8a020`): Pending actions, shipping delays, consolidation reminders. Pricing comparison cards use `{colors.warning-soft}`.
- **Error** (`{colors.error}` — `#d14343`): Failed payments, QC rejections, out-of-stock indicators. Used sparingly — never for price-related elements.
- **Price Red** (`{colors.price-red}` — `#e53935`): Final/discounted prices ONLY. The "Save XX%" badges use this color on a white or transparent background.
- **Badge Yellow** (`{colors.badge-yellow}` — `#f5a623`): "New", "Hot", "Best Deal" promotional badges.

### Surface
- **Canvas** (`{colors.canvas}` — `#ffffff`): Default page background for admin console and product detail pages.
- **Canvas Warm** (`{colors.canvas-warm}` — `#fefaf7`): Consumer marketplace default background — imperceptibly warm, like sun-bleached market linen.
- **Canvas Gray** (`{colors.canvas-gray}` — `#f5f5f8`): Section backgrounds, search bars, disabled states, table headers.
- **Hairline** (`{colors.hairline}` — `#e8e8ef`): Card borders, table dividers, subtle separators.
- **Hairline Input** (`{colors.hairline-input}` — `#c4c4d0`): Form input borders — slightly more visible than standard hairlines.

### Text
- **Ink** (`{colors.ink}` — `#1a1a2e`): Default body text. Deep navy-black, not pure #000 — slightly warm for readability.
- **Ink Secondary** (`{colors.ink-secondary}` — `#3d3d5c`): Secondary body, card descriptions, nav labels.
- **Ink Mute** (`{colors.ink-mute}` — `#6b6b80`): Helper text, placeholders, captions, bottom-nav inactive labels.

### Country Accent Colors
Used in country-selector pills, shipping origin badges, and localized promotional elements.
- **🇮🇩 Indonesia** (`{colors.id-flag}` — `#ce1126`): Red from the Indonesian flag.
- **🇹🇭 Thailand** (`{colors.th-flag}` — `#2d2a4a`): Deep navy from the Thai flag.
- **🇵🇭 Philippines** (`{colors.ph-flag}` — `#0038a8`): Blue from the Philippine flag.
- **🇧🇷 Brazil** (`{colors.br-flag}` — `#009b3a`): Green from the Brazilian flag.

## Typography

### Font Family

The display and heading tier is **Plus Jakarta Sans** — an open-source geometric sans with a warm, humanist character. Available via Google Fonts. Its rounded terminals echo the pill-shape vocabulary. When unavailable, fall back to Noto Sans, then system-ui.

The body tier is **Inter** — open-source via Google Fonts, the canonical UI workhorse. Its variable font (`Inter Variable`) enables sub-weight precision (400 body, 450 tabular, 600 strong). The `tnum` OpenType feature is enabled on all price renders for monospaced numerals.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 48px | 700 | 1.1 | -0.96px | Hero headline (consumer marketplace) |
| `{typography.display-lg}` | 36px | 700 | 1.15 | -0.72px | Landing page section titles |
| `{typography.display-md}` | 28px | 700 | 1.2 | -0.56px | Dashboard page titles (admin) |
| `{typography.heading-xl}` | 24px | 600 | 1.25 | -0.24px | Product card titles, admin section headers |
| `{typography.heading-lg}` | 20px | 600 | 1.3 | -0.1px | Card titles, dialog headers |
| `{typography.heading-md}` | 18px | 600 | 1.35 | 0 | Sub-section titles |
| `{typography.heading-sm}` | 16px | 600 | 1.4 | 0 | List group headers, form section labels |
| `{typography.body-lg}` | 17px | 400 | 1.55 | 0 | Product descriptions, marketing lead copy |
| `{typography.body-md}` | 15px | 400 | 1.5 | 0 | Default body, form labels, button labels |
| `{typography.body-sm}` | 13px | 400 | 1.45 | 0 | Secondary info, table cells, card footnotes |
| `{typography.body-tabular}` | 15px | 450 | 1.5 | 0 | Any cell containing numbers (uses `tnum`) |
| `{typography.price-xxl}` | 28px | 700 | 1.2 | -0.56px | Product detail page main price |
| `{typography.price-lg}` | 22px | 700 | 1.25 | -0.22px | Card prices, cart line-item prices |
| `{typography.price-md}` | 18px | 600 | 1.3 | 0 | Order summary prices, comparison prices |
| `{typography.button-lg}` | 16px | 600 | 1.0 | 0 | Primary CTA buttons |
| `{typography.button-md}` | 14px | 600 | 1.0 | 0 | Secondary buttons, nav buttons |
| `{typography.button-sm}` | 12px | 600 | 1.0 | 0.24px | Compact buttons, icon-button pairs |
| `{typography.caption}` | 12px | 450 | 1.4 | 0.12px | Helper text, footnotes, timestamps |
| `{typography.micro}` | 11px | 400 | 1.35 | 0 | Legal fine print, minimum quantity labels |
| `{typography.badge}` | 11px | 700 | 1.0 | 0.44px | ALL pill-tag and badge labels |

### Principles

- **Plus Jakarta Sans for display + headings, Inter for body.** Never cross the streams. Plus Jakarta Sans's warmth carries the brand personality; Inter's neutrality handles dense information.
- **Price tokens always use `tnum`.** Monospaced numerals ensure price columns align perfectly in carts, order summaries, and comparison tables.
- **Bold-weight headings (600–700) signal confidence.** As a trust-dependent service, AceProxy uses heavier heading weights than typical e-commerce — customers should feel the platform's solidity.
- **Badge labels are ALL tracked.** `{typography.badge}` at 0.44px letter-spacing creates the compact, authoritative pill-tag voice.

### Font Substitutes

Plus Jakarta Sans → **DM Sans** (similar geometric warmth) → **Noto Sans** (Google's universal sans). Inter Variable → **Inter** (static version) → **system-ui**. Both are open-source and available via Google Fonts CDN or self-hosting.

## Layout

### Spacing System

Base unit: 8px. Sub-tokens at 2px and 4px for fine adjustments.

| Token | Value | Consumer Use | Admin Use |
|---|---|---|---|
| `{spacing.xxs}` | 2px | Icon-to-text gaps | Table cell padding fine |
| `{spacing.xs}` | 4px | Badge internal padding | KPI card internal gaps |
| `{spacing.sm}` | 8px | Card content gaps | Form row gaps |
| `{spacing.md}` | 12px | Product grid gutter | Table cell padding |
| `{spacing.lg}` | 16px | Section padding (mobile) | Panel internal padding |
| `{spacing.xl}` | 24px | Card padding, section gaps | Dashboard widget gaps |
| `{spacing.xxl}` | 32px | Page-level section breaks | Content area padding |
| `{spacing.huge}` | 48px | Major section dividers | Dashboard section separators |
| `{spacing.massive}` | 64px | Hero bottom padding | Page top padding (admin) |

### Grid & Container

**Consumer Track (Mobile-First)**:
- Base: fluid single-column up to 520px content width
- Tablet (768px+): 2-column product grid
- Desktop (1024px+): 3–4 column product grid, max-width 1200px with generous side margins
- Category pages: 4-column grid on desktop

**Admin Track (Desktop-First)**:
- Fixed left navigation: 240px
- Content area: fluid, minimum 1024px, target 1440px
- Dashboard: 3-column KPI row → 2-column chart + table
- Data tables: full-width with horizontal scroll at < 1200px
- Modals: centered, max-width 520px (simple) / 720px (complex forms)

### Whitespace Philosophy

The consumer track uses generous vertical spacing (32–48px between product cards, 16–24px within cards) to create a relaxed browsing rhythm. The admin track tightens to 12–24px between elements to maximize data density without feeling cramped.

## Elevation & Depth

The system is intentionally flat — AceProxy is a trust-dependent service, and heavy drop shadows suggest visual trickery. Depth comes from subtle 1px borders, background color shifts, and the soft shadow reserved exclusively for product card hover states.

| Level | Treatment | Use |
|---|---|---|
| 0 | Flat, no shadow | All default surfaces |
| 1 | `0 1px 0 0 {colors.hairline}` | Card borders, table rows |
| 2 | `0 2px 8px rgba(26,26,46,0.06)` | Dropdowns, tooltips |
| 3 | `0 4px 20px rgba(212,93,58,0.08)` | Product card hover ONLY |
| 4 | `0 8px 32px rgba(26,26,46,0.12)` | Modals, bottom sheets |

### Decorative Depth

The consumer track uses `{colors.canvas-warm}` as a background with `{colors.canvas}` cards — the same technique as a market stall with goods laid out on white cloth over warm earth. The admin console uses `{colors.canvas}` cards on `{colors.canvas-gray}` sections for a clean, dashboard-like depth.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Admin table cells, chart containers |
| `{rounded.xs}` | 3px | Table header corners, compact admin elements |
| `{rounded.sm}` | 6px | Form inputs, small admin cards |
| `{rounded.md}` | 10px | Trust cards, pricing comparison cards, toasts |
| `{rounded.lg}` | 16px | Product cards, feature cards, KPI cards |
| `{rounded.xl}` | 24px | Hero image containers, featured product banners |
| `{rounded.pill}` | 9999px | ALL buttons, ALL tags, search bars, country pills |

### Pill Mandate

Every interactive element that accepts clicks uses `{rounded.pill}`. This includes buttons, tags, search bars, country selectors, and filter chips. The only non-pill interactive elements are form inputs (`{rounded.sm}`) and product cards (`{rounded.lg}` with image content). This creates an unmistakable visual signature: if it's clickable and not an image, it's a pill.

### Product Image Geometry

Product images use 1:1 aspect ratio (square) inside `{rounded.lg}` containers. The image fills the card top, with a subtle `object-fit: cover`. No decorative frames, no drop shadows on images — the product speaks for itself. On product detail pages, images expand to 3:4 portrait with swipe gallery, still `{rounded.xl}`.

## Components

### Buttons

**`button-primary-pill`** — the dominant CTA. Terracotta fill, white text, generous padding.
- `{button-primary-pill}`: 12px 28px, full terracotta, white text.
- `{button-primary-pill-pressed}`: Darkens to `{colors.primary-press}`.

**`button-outline`** — secondary actions, "View Details", "Contact Support".
- Transparent background, 1.5px terracotta border, terracotta text. Same pill geometry.

**`button-ocean-pill`** — shipping/trust actions. "Track Package", "View Logistics", "Shipping Info".
- Teal ocean fill, white text. Slightly more compact (8px 20px). Signals information, not purchase.

**`button-ghost`** — tertiary actions. "Cancel", "Back", filter toggles.
- Transparent, ink-secondary text. No border. Hover shows `{colors.canvas-gray}` background.

**`button-danger`** — destructive actions. "Remove", "Delete", "Cancel Order".
- Error red fill, white text. Compact (8px 20px). Always paired with a confirmation step.

### Cards

**`card-product`** — the core marketplace unit.
- White canvas, `{rounded.lg}` 16px, 1px hairline border. Image fills top (1:1), content below: brand line → product name → price row → country pill OR save badge.
- **Hover** (`card-product-hover`): Border color shifts to `{colors.primary-soft}`, a soft terracotta shadow appears (Level 3). Subtle, warm invitation — never aggressive.

**`card-feature`** — admin dashboard feature cards.
- White canvas, `{rounded.lg}`, 24px padding, 1px hairline border. Used for order cards, shipment cards, vendor cards.

**`card-trust`** — trust signal cards on product and checkout pages.
- `{colors.ocean-soft}` background, `{rounded.md}` 10px, compact 16px padding. Contains one trust signal: "Source-direct purchase · Warehouse photo · Damage guarantee".

**`card-pricing-compare`** — "Save XX% vs Shopee" comparison bars.
- `{colors.warning-soft}` background, `{rounded.md}`, 12px 16px padding. Price in `{typography.price-md}` on the left, save percentage in `{badge-save}` on the right.

**`dashboard-kpi-card`** — admin KPI display cards.
- White canvas, `{rounded.lg}`, 20px padding, 1px hairline border. Label in `{typography.caption}` above, value in `{typography.price-lg}`, delta indicator in `{pill-tag-success}` or `{pill-tag-error}`.
- **Highlighted** (`dashboard-kpi-highlight`): `{colors.primary-soft}` background with terracotta border — used for the most critical KPI.

### Inputs & Forms

**`text-input`** — standard form field.
- White, `{rounded.sm}` 6px, 10px 14px padding, 1px `{colors.hairline-input}` border, `{typography.body-md}`.
- **Focused** (`text-input-focused`): Border shifts to 1.5px `{colors.primary}`.

**`search-bar`** — pill-shaped search field.
- `{colors.canvas-gray}` background, full pill (9999px), 10px 20px padding, `{typography.body-md}`, placeholder in `{colors.ink-mute}`. Magnifying glass icon on left.

### Navigation

**`nav-bar-main`** — consumer marketplace top bar.
- White canvas, 12px 24px padding. Logo left, search center, notification bell + cart icon right.

**`nav-bar-admin`** — admin console left sidebar.
- `{colors.ink}` background, full-height, 240px fixed width. Logo at top, navigation sections below with active state in terracotta. Collapses to 64px icon-only on <1200px.

**`bottom-nav-mobile`** — consumer mobile bottom tab bar.
- White canvas, 5 icons in a row: Home, Discover, Cart, Orders, Profile. Active icon in `{colors.primary}`, inactive in `{colors.ink-mute}`. 8px top + 20px bottom padding (safe-area aware).

### Tags, Pills, and Badges

All use `{rounded.pill}` and `{typography.badge}` (11px / 700 / tracked).

| Component | Background | Text | Use |
|---|---|---|---|
| `pill-tag-primary` | `{colors.primary-soft}` | `{colors.primary}` | "Proxy Purchase", "Verified" |
| `pill-tag-ocean` | `{colors.ocean-soft}` | `{colors.ocean}` | "Free Shipping", "Tracked" |
| `pill-tag-success` | `{colors.success-soft}` | `{colors.success}` | "In Stock", "QC Passed", "Delivered" |
| `pill-tag-warning` | `{colors.warning-soft}` | `{colors.warning}` | "Consolidating", "Pending" |
| `pill-tag-error` | `{colors.error-soft}` | `{colors.error}` | "QC Failed", "Returned", "Out of Stock" |
| `pill-tag-country` | `{colors.canvas-gray}` | `{colors.ink-secondary}` | 🇮🇩 Indonesia, 🇹🇭 Thailand, etc. |
| `badge-save` | `{colors.error}` | `{colors.on-primary}` | "-67% vs Shopee" |

### Admin-Specific Components

**`table-header`** / **`table-row-default`** / **`table-row-hover`**: Dense, data-first table system for orders, shipments, users.
- Headers: `{colors.canvas-gray}` background, `{typography.caption}`, muted text.
- Rows: white, `{typography.body-sm}` or `{typography.body-tabular}` for numeric columns.
- Hover: `{colors.canvas-gray}` background for row highlighting.

**`timeline-dot-active`** / **`timeline-dot-completed`** / **`timeline-dot-pending`**: Logistics tracking timeline.
- Active (current node): terracotta fill, white canvas border ring.
- Completed: green fill.
- Pending: hairline gray outline.

**Toast Notifications**: Slide-in from top (mobile) or top-right (desktop). Success (green) or error (red).
- `{toast-success}` / `{toast-error}`: `{rounded.md}`, 12px 16px padding, white text on colored background.

### Signature Components

**Price Stack** — the most important component in the consumer track. On product cards:
1. Strikethrough original price in `{colors.ink-mute}` / `{typography.body-sm}` (e.g., "~~Rp 450,000~~")
2. Current price in `{typography.price-lg}` / `{colors.ink}` (e.g., "Rp 180,000")
3. Optional: coupon price below in `{typography.body-sm}` / `{colors.price-red}` with a dashed underline
4. "Save XX%" badge in `{badge-save}` floating at the top-right of the card

**Comparison Bar** — "vs Shopee/Tokopedia" comparison. `{card-pricing-compare}` with local platform price on the left, AceProxy price on the right, save percentage in the center. This component IS the primary conversion driver.

**Logistics Timeline** — order tracking view. Vertical line with colored dots, each node showing status text, timestamp, and location. Active node pulses subtly.

**Consolidation Status** — shown during the "gathering at Shenzhen warehouse" phase. A horizontal progress bar with weight indicator: "3 of 5 items arrived · 1.2kg · ¥58 shipping so far · Add ¥12 more to unlock ¥9/kg rate".

## Do's and Don'ts

### Do
- Use `{colors.primary}` (terracotta) for the single most important action per screen — "Buy Now", "Checkout", "Pay".
- Use `{colors.ocean}` for all shipping, tracking, and logistics elements — build the mental association: ocean = movement.
- Render ALL prices in `{typography.price-*}` tokens with `tnum` enabled.
- Keep the consumer track warm (`{colors.canvas-warm}` background); keep the admin track data-dense and clean.
- Use `{rounded.pill}` for every interactive element except product images and form inputs.
- Show the comparison bar ("Save XX% vs local platform") on every product detail page — it's the core trust builder.
- Keep product images square (1:1) with clean cropping — let the product do the work.

### Don't
- Don't use terracotta as a background fill for large areas — it's a CTA and accent color, not a canvas.
- Don't add heavy drop shadows — max Level 3 on product cards, Level 4 on modals only.
- Don't use `{colors.price-red}` for anything except final/discounted prices — reserve its meaning.
- Don't cross Plus Jakarta Sans into body text, or Inter into display — maintain the typographic split.
- Don't use squared corners (`{rounded.none}` or `{rounded.xs}`) on buttons or tags — the pill mandate is non-negotiable.
- Don't show loading spinners without skeleton placeholders — the marketplace must always feel alive.
- Don't stack multiple filled-pill buttons in the same view — one primary action per screen.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Single-column consumer; bottom tab nav; product images 1:1 full-width; admin sidebar collapses to hamburger |
| Tablet | 768–1023px | 2-column product grid; admin sidebar icons only (64px) |
| Desktop | 1024–1440px | 3–4 column product grid; full admin sidebar (240px); data tables at full width |
| Wide | ≥ 1440px | 4–5 column product grid; admin content max 1440px with generous margins |

### Touch Targets

All interactive elements maintain ≥ 44×44px touch targets on mobile. Pill buttons achieve this through vertical padding (12px) × line-height (16px for button-lg = 44px total). Bottom nav items use 48px minimum height with safe-area awareness.

### Mobile-Specific Behaviors

- Product cards: 1 per row → 2 per row → 3–4 per row. Images remain square (1:1).
- Bottom nav replaces top nav on consumer track (iOS/Android native feel).
- Search bar expands to full-width with back button on focus.
- Cart: slide-up bottom sheet on mobile, side panel on desktop.
- Admin: left nav collapses → bottom sheet nav on mobile.

### Image Behavior

Product images use `srcset` with WebP format at 2x and 3x density. Load lazy below the fold. Gallery on product detail supports swipe (mobile) and arrow navigation (desktop). No decorative overlays on product images — the brand's transparency value extends to photography.

## Iteration Guide

1. Focus on ONE component at a time. Reference tokens directly (e.g., `{colors.primary}`, `{card-product}-hover`, `{rounded.pill}`).
2. Test every component in both tracks — consumer marketplace AND admin console — before shipping.
3. When adding a new country adaptation, update only `countries/{code}/config.ts` — never modify global design tokens.
4. For new badge/pill variants: always use `{typography.badge}` + `{rounded.pill}`. Vary only background and text color.
5. The pill mandate is absolute. If a new interactive element doesn't use `{rounded.pill}`, it needs a documented exception.
6. Price renders must always use `tnum`. If a number represents money and doesn't have `tnum`, it's a bug.
7. Keep the consumer track warm (`canvas-warm`), admin track clean (`canvas` / `canvas-gray`). Never mix the two canvas atmospheres in the same view.
