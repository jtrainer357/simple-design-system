# Design System Extractor

Extract and synthesize a semantic design system from Stitch-generated screens into `DESIGN.md`.

## Purpose

Analyze Stitch screens and create a unified design language document that ensures visual consistency across all generated screens for the Tebra Mental Health platform.

## When to Use

- After generating a new Stitch screen to extract/validate design patterns
- When starting a new project to establish the design baseline
- When design drift is detected between generated screens

## Prerequisites

- Stitch MCP tools available (`mcp_stitch:get_screen`, etc.)
- At least one Stitch screen generated

## Workflow

### Step 1: Retrieve Screen Data

```
# Using Stitch MCP
mcp_stitch:get_screen(project_id, screen_id)

# Or fetch HTML directly if URL known
curl -o queue/screen.html "https://storage.googleapis.com/stitch-output/..."
```

### Step 2: Extract Design Elements

Parse the screen HTML/metadata to identify:

1. **Color Palette**
   - Extract all hex/rgb/oklch values
   - Group by functional role (background, text, accent, semantic)
   - Map to existing Tebra tokens where applicable

2. **Typography**
   - Font families used
   - Size scale (px to rem mapping)
   - Weight distribution
   - Line heights

3. **Component Patterns**
   - Button styles and states
   - Card patterns (radius, shadow, opacity)
   - Input field treatments
   - Navigation patterns

4. **Spacing & Layout**
   - Padding/margin patterns
   - Grid structure
   - Container widths

5. **Effects**
   - Shadows
   - Blur treatments
   - Transitions

### Step 3: Map to Project Tokens

Reference the existing design system in `design-system/styles/globals.css`:

| Stitch Output        | Tebra Token | CSS Variable         |
| -------------------- | ----------- | -------------------- |
| Coral/orange accents | Primary     | `--color-primary`    |
| Deep teal accents    | Teal        | `--color-teal`       |
| Warm off-white BG    | Background  | `--color-background` |
| Glass cards          | Card        | `--color-card`       |

### Step 4: Generate DESIGN.md

Output structured documentation with this format:

```markdown
# Tebra Mental Health Design System

## Visual Theme & Atmosphere

[Describe the overall aesthetic: warm, professional, healthcare-focused]

## Color Palette & Roles

### Primary Colors

- **Vitality Coral** (#E67E4A / oklch(0.679 0.1311 36.04)) - CTAs, active states
- **Deep Teal** (#3B7A7A / oklch(0.4345 0.065 206.78)) - Navigation, links

### Neutral Foundation

- **Foreground** (#545454) - Body text
- **Muted** (oklch 0.95 0 0) - Disabled, secondary text
- **Border** (oklch 0.8761 0 0) - Dividers, input borders

### Semantic Colors

- **Success** (oklch 0.6 0.15 145) - Confirmations
- **Warning** (oklch 0.65 0.12 55) - Alerts
- **Destructive** (oklch 0.4985 0.1865 22.58) - Errors, deletions

## Typography Rules

- **Font Family**: Akkurat LL, system-ui fallback
- **Weights**: Light (300) for headings, Regular (400) for body, Bold (700) for emphasis
- **Scale**: 2xl headings, base body, sm secondary

## Component Stylings

### Buttons

- Pill-shaped (rounded-full)
- 150ms hover transitions
- Active scale-down (0.98)
- Primary: Coral fill, white text
- Outline: Teal border, transparent fill

### Cards

- Glass morphism: bg-white/90 backdrop-blur-sm
- Subtle border: oklch(0.93 0.01 160)
- Border radius: rounded-lg (1rem)
- Soft shadows: 0 2px 6px rgb(0 0 0 / 0.06)

### Inputs

- Rounded-md corners
- Focus ring: teal (--color-ring)
- Border: muted gray

## Layout Principles

- Desktop-first responsive
- Max container width: bounded, centered
- Grid: 12-column base
- Spacing scale: 4px base unit

## Animation Guidelines

- Prefer Framer Motion
- Reduced motion support via prefers-reduced-motion
- Transitions: 150ms ease for interactions
- Page transitions: slide + fade
```

## Project-Specific Rules

### Enforced Constraints

- **NO pure black (#000000)** - Use `--color-foreground-strong` or `--color-foreground`
- **NO pure white backgrounds** - Use warm white (#FBF9F8) or transparent
- **NO sharp corners on interactive elements** - Minimum rounded-md
- **NO shadows darker than 0.12 opacity**

### Required Patterns

- Cards MUST have backdrop-blur effect
- Buttons MUST be pill-shaped (rounded-full)
- Healthcare data MUST use semantic colors appropriately
- Patient identifiers MUST be visually distinct (teal badges)

### Responsive Rules

- Desktop breakpoint: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px
- Desktop-first approach (base styles are desktop)

## Validation Checklist

Before finalizing DESIGN.md, verify:

- [ ] All extracted colors mapped to existing tokens or documented as new
- [ ] Typography matches Akkurat LL system
- [ ] Component patterns align with shadcn/ui + Radix foundation
- [ ] No banned colors/patterns present
- [ ] Healthcare-appropriate color associations (avoid red for non-errors)
