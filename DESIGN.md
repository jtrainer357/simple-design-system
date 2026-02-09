# Tebra Mental Health Design System

## Visual Theme & Atmosphere

**Warm Clinical Professionalism** - The design balances clinical precision with approachable warmth. It's professional enough for healthcare but avoids sterile coldness. Think "spa meets medical office" - calming, trustworthy, and human-centered.

**Key Characteristics:**

- Soft, warm color palette with coral and teal accents
- Glass morphism for depth without heaviness
- Generous whitespace for breathing room
- Subtle animations that feel responsive, not flashy
- Typography that's readable and friendly

## Color Palette & Roles

### Primary Colors

| Name               | Value     | OKLCH                        | Role                                |
| ------------------ | --------- | ---------------------------- | ----------------------------------- |
| **Vitality Coral** | `#E67E4A` | `oklch(0.679 0.1311 36.04)`  | Primary CTAs, active states, energy |
| **Deep Teal**      | `#3B7A7A` | `oklch(0.4345 0.065 206.78)` | Navigation, links, healthcare trust |
| **Teal Dark**      | -         | `oklch(0.38 0.06 195)`       | Nav icons, hover states             |

### Neutral Foundation

| Name                   | Value     | OKLCH                        | Role                       |
| ---------------------- | --------- | ---------------------------- | -------------------------- |
| **Foreground**         | `#545454` | -                            | Body text, primary content |
| **Foreground Strong**  | `#000000` | `oklch(0 0 0)`               | Headings, emphasis         |
| **Muted**              | -         | `oklch(0.95 0 0)`            | Secondary text, disabled   |
| **Muted Foreground**   | -         | `oklch(0.4413 0.009 260.73)` | Placeholder, helper text   |
| **Border**             | -         | `oklch(0.8761 0 0)`          | Dividers, input borders    |
| **Card Border Subtle** | -         | `oklch(0.93 0.01 160)`       | Card outlines              |

### Semantic Colors

| Name            | Value | OKLCH                        | Role                        |
| --------------- | ----- | ---------------------------- | --------------------------- |
| **Success**     | -     | `oklch(0.6 0.15 145)`        | Confirmations, completed    |
| **Warning**     | -     | `oklch(0.65 0.12 55)`        | Alerts, needs attention     |
| **Destructive** | -     | `oklch(0.4985 0.1865 22.58)` | Errors, deletions, critical |

### Background Colors

| Name                | Value                         | Role                   |
| ------------------- | ----------------------------- | ---------------------- |
| **Page Background** | `#FBF9F8`                     | Warm off-white base    |
| **Card**            | `rgba(255,255,255,0.97)`      | Glass card fill        |
| **Card Hover**      | `oklch(0.96 0.01 85)`         | Interactive card hover |
| **Accent**          | `oklch(0.9473 0.0065 185.27)` | Subtle teal tint       |

### Chart Colors

| Name    | OKLCH                         | Use                   |
| ------- | ----------------------------- | --------------------- |
| Chart 1 | `oklch(0.679 0.1311 36.04)`   | Primary data (coral)  |
| Chart 2 | `oklch(0.4345 0.065 206.78)`  | Secondary data (teal) |
| Chart 3 | `oklch(0.8041 0.0754 208.76)` | Tertiary (light teal) |
| Chart 4 | `oklch(0.5789 0.1405 260.16)` | Purple accent         |
| Chart 5 | `oklch(0.5445 0.1358 308.04)` | Magenta accent        |

## Typography Rules

### Font Family

```css
font-family: "Akkurat LL", system-ui, sans-serif;
```

### Font Weights

| Weight  | Value | Use                               |
| ------- | ----- | --------------------------------- |
| Thin    | 100   | Decorative only                   |
| Light   | 300   | Large headings, hero text         |
| Regular | 400   | Body text, UI labels              |
| Bold    | 700   | Emphasis, buttons, small headings |
| Black   | 900   | Impact statements only            |

### Type Scale

| Name       | Class                 | Use                         |
| ---------- | --------------------- | --------------------------- |
| Hero       | `text-4xl font-light` | Page titles                 |
| Heading    | `text-2xl font-light` | Section headers             |
| Subheading | `text-lg font-medium` | Card titles                 |
| Body       | `text-base`           | Primary content             |
| Small      | `text-sm`             | Secondary content, metadata |
| Tiny       | `text-xs`             | Badges, timestamps          |

## Component Stylings

### Buttons

**Shape:** Pill-shaped (`rounded-full`)
**Transition:** 150ms all properties
**Active State:** `scale-[0.98]` on press

| Variant     | Background       | Text                          | Border             |
| ----------- | ---------------- | ----------------------------- | ------------------ |
| Default     | `bg-primary`     | `text-primary-foreground`     | none               |
| Outline     | `bg-transparent` | `text-teal-dark`              | `border-teal-dark` |
| Secondary   | `bg-secondary`   | `text-secondary-foreground`   | none               |
| Ghost       | `bg-transparent` | inherit                       | none               |
| Destructive | `bg-destructive` | `text-destructive-foreground` | none               |

### Cards

**Base:** `rounded-lg border border-card-border-subtle`
**Glass Effect:** `bg-white/90 backdrop-blur-sm`
**Shadow:** `shadow-sm` (0 2px 6px rgb(0 0 0 / 0.06))

| Variant     | Opacity       | Blur               |
| ----------- | ------------- | ------------------ |
| Default     | `bg-white/90` | `backdrop-blur-sm` |
| Transparent | `bg-white/50` | `backdrop-blur-xl` |
| Solid       | `bg-white`    | none               |

### Inputs

**Border:** `border border-input rounded-md`
**Focus:** `ring-2 ring-ring ring-offset-2`
**Padding:** `px-3 py-2`
**Height:** `h-10` (default), `h-9` (small)

### Badges

**Shape:** `rounded-full` or `rounded-md`
**Padding:** `px-2.5 py-0.5`
**Font:** `text-xs font-semibold`

| Variant   | Style                                          |
| --------- | ---------------------------------------------- |
| Default   | `bg-primary text-primary-foreground`           |
| Secondary | `bg-secondary text-secondary-foreground`       |
| Outline   | `border text-foreground`                       |
| Success   | `bg-success/10 text-success border-success/20` |
| Warning   | `bg-warning/10 text-warning border-warning/20` |

### Avatars

**Shape:** `rounded-full`
**Fallback BG:** `bg-avatar-fallback` (soft teal)
**Sizes:** `h-8 w-8` (sm), `h-10 w-10` (md), `h-12 w-12` (lg)

## Layout Principles

### Spacing Scale (4px base)

```
0: 0px
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
16: 64px
```

### Border Radius Scale

```
--radius-sm: 0.5rem (8px)
--radius-md: 0.75rem (12px)
--radius-lg: 1rem (16px)
--radius-xl: 1.525rem (24px)
rounded-full: 9999px
```

### Shadow Scale

```
--shadow-sm: 0 2px 6px -1px rgb(0 0 0 / 0.06)
--shadow-md: 0 4px 12px -2px rgb(0 0 0 / 0.08)
--shadow-lg: 0 8px 20px -4px rgb(0 0 0 / 0.12)
```

### Grid System

- 12-column base
- Gutters: 24px (desktop), 16px (mobile)
- Max content width: bounded by container

### Responsive Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Animation Guidelines

### Transition Defaults

```css
transition: all 150ms ease;
```

### Page Transitions (Framer Motion)

```tsx
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
transition={{ duration: 0.2 }}
```

### Hover States

- Cards: `hover:shadow-md` + subtle border highlight
- Buttons: `hover:bg-[variant]/90` + `hover:shadow-md`
- Links: `hover:text-primary` or underline

### Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

## Stitch Prompt Block

Copy this block into every Stitch prompt:

```
---
DESIGN SYSTEM (Tebra Mental Health)

COLORS:
- Primary: Vitality Coral (#E67E4A) - CTAs, active states
- Accent: Deep Teal (#3B7A7A) - navigation, links, healthcare trust
- Background: Warm off-white (#FBF9F8)
- Foreground: Soft charcoal (#545454)
- Cards: Glass morphism (white 90% opacity, backdrop-blur)

TYPOGRAPHY:
- Font: Akkurat LL (or system-ui fallback)
- Headings: Light weight (300)
- Body: Regular weight (400)
- Emphasis: Bold (700)

COMPONENTS:
- Buttons: Pill-shaped (rounded-full), 150ms transitions
- Cards: rounded-lg, subtle border, soft shadow
- Inputs: rounded-md, teal focus ring
- Avatars: rounded-full with teal fallback

TONE:
- Professional healthcare but warm and approachable
- Clean, modern, calming
- Generous whitespace
- Subtle animations (nothing flashy)
---
```

## Constraints & Banned Patterns

### Never Use

- Pure black `#000000` for text (use `--color-foreground` or `--color-foreground-strong`)
- Pure white `#FFFFFF` for backgrounds (use warm white `#FBF9F8`)
- Sharp corners on interactive elements (minimum `rounded-md`)
- Heavy shadows (max 0.12 opacity)
- Red for non-critical UI (healthcare context - red = emergency only)
- Neon or high-saturation colors

### Always Include

- Backdrop blur on floating cards
- Focus visible states for keyboard accessibility
- Reduced motion alternatives
- Semantic color usage (success for good, warning for attention, destructive for danger)
- Proper contrast ratios (WCAG AA minimum)

---

_Generated from Tebra Mental Health codebase analysis - 2026-02-09_
