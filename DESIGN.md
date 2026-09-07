---
version: 1.0-brutalism
name: AceProxy Design System — Brutalism Edition
description: Cross-border proxy-buying e-commerce platform serving Indonesia (primary), Thailand, Philippines, and Brazil. Brutalist visual identity: massive type, hard shadows, thick black borders, and high-contrast orange primary. Designed to stand out in a sea of soft-gradient Southeast Asian e-commerce.

colors:
  primary: "#F97316"
  primary-press: "#EA580C"
  primary-soft: "#FFF7ED"
  ocean: "#0f7b8c"
  ocean-soft: "#e0f4f7"
  ink: "#111111"
  ink-secondary: "#333333"
  ink-mute: "#666666"
  on-primary: "#ffffff"
  on-ocean: "#ffffff"
  canvas: "#FFFFFF"
  canvas-warm: "#FFF7ED"
  canvas-gray: "#F5F5F5"
  hairline: "#000000"
  hairline-input: "#000000"
  success: "#16A34A"
  success-soft: "#DCFCE7"
  warning: "#EAB308"
  warning-soft: "#FEFCE8"
  error: "#DC2626"
  error-soft: "#FEE2E2"
  price-red: "#DC2626"
  badge-yellow: "#F97316"
  id-flag: "#ce1126"
  th-flag: "#2d2a4a"
  ph-flag: "#0038a8"
  br-flag: "#009b3a"

typography:
  display:
    fontFamily: "'Archivo Black', 'Arial Black', Impact, Gadget, sans-serif"
    weight: 900
    uppercase: true
    tracking: -0.04em
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    weight: 400-700
  head-xl: 80px / 900 / 0.9 / -0.04em
  head-lg: 56px / 900 / 0.92 / -0.04em
  head-md: 36px / 900 / 0.95 / -0.03em
  head-sm: 24px / 800 / 1.1 / -0.02em
  body-lg: 18px / 400 / 1.5
  body-md: 16px / 400 / 1.5
  body-sm: 14px / 400 / 1.45
  btn-lg: 18px / 800 / 1.0 / -0.02em
  btn-sm: 14px / 800 / 1.0 / -0.01em
  badge: 11px / 800 / 1.0 / 0.06em

borders:
  default: 4px solid #000
  thin: 3px solid #000
  panel: 4px solid #000

shadows:
  card: 6px 6px 0 #000
  card-hover: 8px 8px 0 #000
  btn: 6px 6px 0 #000
  btn-hover: 4px 4px 0 #000
  btn-active: 2px 2px 0 #000
  dropdown: 4px 4px 0 #000
  modal: 8px 8px 0 #000

rounded:
  none: 0px
---

## Overview

AceProxy 2.0 adopts **Brutalism** — a bold, unapologetic visual language designed to cut through the noise of Southeast Asian e-commerce. Where Tokopedia, Shopee, and Bukalapak all use soft gradients, round corners, and pastel colors, AceProxy goes the opposite direction: hard black borders, massive typography, high-contrast orange, and zero-radius corners.

### Why Brutalism?

- **Differentiation**: In a market saturated with soft UI, Brutalism is instantly recognizable. Like Supreme and Off-White in fashion, it signals confidence and a counter-mainstream attitude.
- **Memory**: Customers remember the store that looks different. Brutalism creates a visual anchor — once seen, never confused with competitors.
- **Mobile-First**: Big type, big buttons, thick borders — every element is oversized and touch-friendly by default, perfect for Indonesia's 80%+ mobile traffic.
- **Trust Through Honesty**: Brutalism's raw, unadorned aesthetic communicates transparency. Nothing is hidden behind gradients or soft shadows.

### Key Characteristics

| Element | Brutalism Rule |
|---------|----------------|
| Borders | 4px solid #000 on ALL interactive elements |
| Shadows | Zero blur — hard offset (6px 6px 0 #000) |
| Corners | Square. No border-radius except utility tags |
| Typography | Archivo Black (display), Inter (body). Headlines ALWAYS uppercase with negative tracking |
| Color | Pure orange #F97316 primary, warm white #FFF7ED canvas |
| Animation | Press-down only — buttons translate (x,y) on click, shadow shrinks |
| Depth | Flat. Shadow is structural, not decorative |

### Dual-Track System

- **Track 1 — Consumer Marketplace** (mobile-first): Full Brutalism. All buttons/inputs/cards use thick borders, hard shadows, zero-radius.
- **Track 2 — Admin Console** (desktop): Softened Brutalism. Reduced borders (2px), lighter shadows (3px), minimal rounded corners for data density. Admin retains legacy Neo-Brutalism components for operational clarity.

## Colors

### Brand Primary
- **Terracotta Orange** (`#F97316`): All CTAs, price highlights, active states. A pure, loud orange — not muted, not earthy, not "brand-safe". This is the color of confidence.
- **Terracotta Press** (`#EA580C`): Button press state, one shade deeper.
- **Terracotta Soft** (`#FFF7ED`): Hero backgrounds, page canvas. A barely-there warm white.

### Semantic
- **Ink** (`#111111`): Headlines, body text. Near-black but not pure #000 for visual comfort.
- **Ink Secondary** (`#333333`): Descriptions, secondary text.
- **Ink Mute** (`#666666`): Placeholders, disabled states, helper text.
- **Ocean** (`#0f7b8c`): Trust signals, logistics, tracking. Used sparingly in Brutalism.
- **Success** (`#16A34A`), **Warning** (`#EAB308`), **Error** (`#DC2626`): Standard semantic palette.

## Typography

### Font Families

- **Display**: `Archivo Black` → `Arial Black` → `Impact` → `sans-serif`. Armand heavyweight font for headlines. Available free via Google Fonts. Falls back gracefully on all platforms.
- **Body**: `Inter` (400-700). The neutral workhorse that lets Brutalist headlines dominate.

### Hierarchy

| Token | Size | Weight | Case | Tracking | Use |
|-------|------|--------|------|----------|-----|
| display-xl | 80px | 900 | UPPER | -0.04em | Hero headline |
| display-lg | 56px | 900 | UPPER | -0.04em | Section titles |
| display-md | 36px | 900 | UPPER | -0.03em | Card group titles |
| heading-xl | 24px | 800 | UPPER | -0.02em | Sub-section headers |
| body-lg | 18px | 400 | — | 0 | Hero subtitle |
| body-md | 16px | 400 | — | 0 | Default text |
| body-sm | 14px | 400 | — | 0 | Secondary info |

### Principles
- **All headlines are uppercase with negative letter-spacing.** This is non-negotiable for Brutalism.
- **Archivo Black for display, Inter for body.** Never use display font for body text or vice versa.
- **Price numbers use bold weight (700) with tabular figures where possible.**

## Components — Brutalism Edition

### Buttons

**btn-brutal** (Primary CTA):
- Orange fill (#F97316), white text, 4px black border
- Shadow: 6px 6px 0 #000
- Hover: translate(2px, 2px), shadow → 4px 4px 0 #000
- Active: translate(4px, 4px), shadow → 2px 2px 0 #000
- Font: display family, 800 weight, uppercase, negative tracking

**btn-brutal-outline** (Secondary):
- White fill, black text, 4px black border
- Same shadow + animation as primary
- Hover: bg → canvas-gray (#F5F5F5)

**btn-brutal-sm** (Compact):
- Same as btn-brutal but 3px border, 3px shadow
- Reduced padding for inline use (nav, cards)

**btn-brutal-sm-outline** (Compact Secondary):
- Outline variant of btn-brutal-sm

**btn-brutal-dark** (Dark variant for black backgrounds):
- Black fill, white text, 4px black border
- Used in dark-footer or ink-background sections

### Cards

**card-brutal** (Product/Feature Card):
- White background, 4px black border, 6px shadow
- Hover: translate(-2px, -2px), shadow → 8px
- Zero border-radius. Content flows edge-to-edge with 4px internal borders as dividers.

**card-category** (Category Grid Item):
- Smaller version: 4px border, 4px shadow
- Hover: fill → orange, text → white, border → orange
- Centered icon + label layout

### Inputs

**input-brutal** (Search/Text):
- Full-width, 4px black border, 3px shadow
- White background, 16px Inter font
- Focus: border → orange, shadow enlarges slightly
- No border-radius, no rounded corners

### Tags & Badges

**tag-brutal**:
- 3px black border, square (no radius)
- Font: display family, 800 weight, uppercase, 11px
- Variants: primary (orange fill), dark (black fill)

### Navigation

**Header (Consumer)**:
- Sticky top, white background, 4px bottom black border
- Square logo block (orange · 3px border)
- Square action buttons (language, cart, admin, login)
- Mobile: hamburger menu with full-width square dropdown items

## Layout

### Grid (Consumer)
- Mobile: Single-column, 4px gutters
- Tablet (768px): 2-column
- Desktop (1024px): 3-4 column product grid
- Max container: 1280px with 16px padding

### Spacing
- Base unit: 8px
- Section padding: 56-80px vertical
- Card gaps: 16-20px
- Button padding: 16px 32px (large), 10px 20px (small)

## Animations

### Button Press (The ONLY animation)
```
Default:    translate(0, 0)    shadow: 6px 6px 0 #000
Hover:      translate(2px, 2px)    shadow: 4px 4px 0 #000  
Active:     translate(4px, 4px)    shadow: 2px 2px 0 #000
```
Duration: 100ms ease-out. No other transitions, no fade-ins, no scale transforms. Brutalism is direct.

### Card Hover
```
Default:    translate(0, 0)    shadow: 6px 6px 0 #000
Hover:      translate(-2px, -2px)    shadow: 8px 8px 0 #000
```
Card "lifts" toward user. Subtle but satisfying.

## Do's and Don'ts

### DO
- Use 4px black borders on EVERY interactive element
- Uppercase all headlines with negative letter-spacing
- Use press-down button animation (translate + shadow shrink)
- Keep product images square 1:1 with clean edges
- Use warm white (#FFF7ED) as page background
- Keep the orange (#F97316) as the ONLY primary color
- Zero border-radius on cards, buttons, inputs, and nav elements

### DON'T
- Never use rounded-full or pill shapes for interactive elements (Brutalism is square)
- Never add blur to shadows — hard offset only
- Never use gradients (solid colors only)
- Never mix Plus Jakarta Sans with Archivo Black — choose one display font
- Never fade or ease-in-out on page elements — only press-down animation
- Never use light pastel borders — 4px #000 or nothing
- Don't add decorative flourishes — Brutalism is minimal and direct

## File Map

| File | Scope | Style |
|------|-------|-------|
| `tailwind.config.js` | Design tokens | Brutalism colors/fonts/shadows |
| `globals.css` | Component CSS classes | btn-brutal, card-brutal, etc. |
| `pages/index.tsx` | Consumer homepage | Full Brutalism |
| `pages/landing.tsx` | Marketing landing | Full Brutalism |
| `pages/admin/*.tsx` | Admin console | Softened Brutalism (legacy components kept) |

## Iteration Guide

1. ALL new consumer-facing features must follow Brutalism rules (4px borders, hard shadows, square, press-down animation)
2. Admin pages may use legacy Neo-Brutalism components for data density
3. Never introduce rounded corners to consumer-facing UI
4. When in doubt: make it bigger, bolder, and more squared-off
5. Test on mobile first — Brutalism's oversized elements must be touch-friendly
