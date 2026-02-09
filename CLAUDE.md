# CLAUDE.md — Tebra Mental Health MVP (MHMVP)

> **Last Updated:** February 9, 2026 — Sprint 0 kickoff
> **Phase:** Post-hackathon → Production MVP
> **Repository:** github.com/jtrainer357/mental-health-mvp
> **Owner:** Jay Trainer (UX Strategy & Prototype Lead)

---

## CONTEXT ISOLATION RULE

This project is **completely self-contained**.

- ✅ Use all files, docs, and history within this project
- ✅ Reference PROGRESS_TRACKER.md, PROJECT_SYNC.md, and all project logs
- ❌ NEVER pull context from other Claude projects or conversations
- ❌ NEVER assume knowledge not provided in project files
- If context is missing, **ask**.

---

## WHAT THIS IS

**Tebra Mental Health MVP** — a practice management platform for solo/small mental health practices (1–3 providers) that replaces legacy EHRs (SimplePractice, TherapyNotes) with an AI-native system.

**Core innovation: Substrate Intelligence.** AI runs continuously in the background analyzing patient data and surfaces prioritized clinical decisions contextually. This is NOT a chatbot — it's infrastructure that thinks ahead.

**The pitch:** "Competitors show you data. We show you decisions."

---

## CURRENT STATE (February 9, 2026)

### ✅ Working End-to-End

- Home page with AI-surfaced priority action cards
- Patient roster with search + Patient 360 detail panel
- Schedule (week view, basic appointment display)
- Communications page (unified inbox, channel-agnostic display)
- Billing page (read-only metrics dashboard)
- Marketing page (read-only reputation dashboard)
- Import wizard (CSV upload + basic parsing)
- Voice commands (Web Speech API, "Tebra" wake word)
- SOAP note generation with animations
- Outcome measure charts (PHQ-9, GAD-7, PCL-5)
- AI Action Orchestration Modal (demo golden path)
- Zustand state management
- 5 seed patients with full clinical data
- Mobile responsive at 375px / 768px / 1280px
- 0 TypeScript errors, build passes, 23/23 routes functional

### ⚠️ Wave 1 Code — Built But Not Wired

- Schedule views (day/week/month) → `src/components/` — needs route fix
- Patient CRUD (add, archive, status) → `src/components/patients/` — needs page wiring
- Clinical docs (session timer, sign & lock) → `src/components/` — needs session workflow wiring
- Substrate engine (triggers, actions) → `src/lib/substrate/` — needs API route fix
- Auth (NextAuth, MFA) → `src/lib/auth/` — needs API route consolidation
- Security (rate limit, CSRF, sanitize) → `src/lib/` — needs middleware integration
- AI provider abstraction (Claude, Gemini, fallback chain) — built, not integrated
- Accessibility components (SkipLink, LiveRegion, FocusTrap) — built, not integrated
- Database schema hardening (soft delete, indexes, audit fields) — migrations created

### 🔴 Not Started

- Production auth (login/signup/password reset UI)
- Stripe integration for billing
- Twilio/SendGrid integration for communications
- HIPAA compliance verification (BAAs, encryption audit, pen testing)
- Settings page
- Real substrate intelligence (event-driven, not demo-seeded)

### 🚨 CRITICAL: Dual Directory Structure

The repo has **two** app directories. This MUST be resolved in Sprint 0.

| Location                                                  | Status                                            |
| --------------------------------------------------------- | ------------------------------------------------- |
| `app/` (root)                                             | ✅ **This is what Next.js uses for routing**      |
| `src/app/`                                                | ⚠️ Contains Wave 1 routes that Next.js CANNOT see |
| `src/components/`, `src/lib/`, `src/hooks/`, `src/types/` | ✅ Importable via `@/src/...`                     |

**Fix:** Move `src/app/api/*` routes into root `app/api/`. Do NOT move `src/components/`, `src/lib/`, etc.

---

## TECH STACK (MANDATORY)

| Layer               | Technology               | Notes                                     |
| ------------------- | ------------------------ | ----------------------------------------- |
| **Framework**       | Next.js 14+ (App Router) | File-based routing, server components     |
| **Language**        | TypeScript strict        | Zero `any` types                          |
| **Styling**         | Tailwind CSS + shadcn/ui | Tebra Design System tokens                |
| **Backend**         | Supabase                 | Auth, PostgreSQL, RLS, Realtime           |
| **AI — Speech**     | Deepgram                 | Speech-to-text, medical vocabulary        |
| **AI — Generation** | Gemini 2.0 Flash         | SOAP notes, data import, 2M token context |
| **AI — Clinical**   | Claude Sonnet            | Substrate intelligence analysis           |
| **AI — TTS**        | OpenAI TTS-1             | Voice responses                           |
| **Voice Detection** | Web Speech API           | Wake word "Tebra"                         |
| **Icons**           | hugeicons-react          | Primary icon library                      |
| **Animation**       | Framer Motion            | Page transitions, micro-interactions      |
| **State**           | Zustand + React Query    | Client state + server state               |
| **Charts**          | Recharts                 | Outcome measure visualizations            |
| **Fonts**           | Akkurat LL               | Tebra proprietary typeface                |

---

## FIVE GOVERNING PRINCIPLES

Every line of code must pass through these gates:

### 1. Design Before Plumbing

UX is locked BEFORE backend wires. No building schemas for undesigned screens. Every sprint begins with a design checkpoint.

### 2. Substrate-First

If AI can handle it silently → don't build UI. If AI can surface it contextually → don't build a page. Use the substrate classification framework:

```
Can AI handle this entirely in the background?
  YES → [SILENT] — No UI, background worker
  NO ↓
Can AI detect and surface this contextually?
  YES → [SURFACED] — Priority action card or alert
  NO ↓
Does this belong inside an existing canvas?
  YES → [CANVAS] — Tab/section within Patient 360, Home, etc.
  NO ↓
Is this invisible backend infrastructure?
  YES → [INFRA] — Database, API, security
  NO ↓
Build it → [EXPLICIT] — Dedicated screen/workflow
```

### 3. Patient-as-Central-Object

If it can live in Patient 360, don't create a page. Clinical work, billing, messaging, documents, outcome measures — all orbit around the patient record. **Page count stays at 9.**

### 4. HIPAA Is Not a Phase

Every sprint bakes in compliance: RLS on new tables, audit logging on new routes, encryption verification, input sanitization. Security is never bolted on at the end.

### 5. Deployable Increments

Each sprint produces something a real user could touch. No half-built features.

---

## SUBSTRATE CLASSIFICATION REFERENCE

### [SILENT] — ~30% of features

**AI handles it. User never knows.**
Examples: Auto-generate invoice after Sign & Lock, auto-select CPT code, send appointment reminders, session timeout.
Pattern: Background function triggered by DB event or cron. Logs for audit trail.

### [SURFACED] — ~25% of features

**AI detects and surfaces as priority action card. Human reviews and approves.**
Examples: "PHQ-9 spike → safety protocol," "Medication refill due in 5 days," "Unsigned notes > 24 hours."
Pattern: Substrate engine → `substrate_actions` record → API → Home cards + Patient 360 alerts → user completes/dismisses/snoozes.

### [CANVAS] — ~20% of features

**Lives within an existing page context.**
Examples: Treatment plan edits within Patient 360, billing details within Patient 360 Billing tab, outcome measures inline.
Pattern: New tab/section/inline component. Props from parent context. No new route needed.

### [INFRA] — ~15% of features

**Backend invisible to user.**
Examples: RLS policies, encryption, audit logging, BAAs, webhook infra, CI/CD, caching.
Pattern: Database migration, API middleware, background service. No frontend component.

### [EXPLICIT] — ~10% of features

**Needs its own screen because it's a fundamentally different user context.**
Examples: Login/signup, Settings, Schedule, Communications, session recording drill-in.
Pattern: New page route with own layout, data fetching, state. Still follows Dynamic Canvas (left nav always visible).

---

## DESIGN SYSTEM RULES (NON-NEGOTIABLE)

### Color Palettes — CSS Variables ONLY

| Palette              | Token Prefix | Usage                                         | Example          |
| -------------------- | ------------ | --------------------------------------------- | ---------------- |
| **Growth** (Teal)    | `growth-`    | Primary brand, AI features, nav active states | `bg-growth-2`    |
| **Vitality** (Coral) | `vitality-`  | Primary action buttons, CTAs, destructive     | `bg-vitality-1`  |
| **Backbone**         | `backbone-`  | Warm neutral backgrounds, cards               | `bg-backbone-1`  |
| **Synapse**          | `synapse-`   | Grayscale, text hierarchy, borders            | `text-synapse-6` |

### 🚫 ABSOLUTE PROHIBITIONS

1. **NO PURPLE ANYWHERE** — Growth Teal is the ONLY AI color
2. **NO HARDCODED HEX VALUES** — Always use CSS variables / Tailwind tokens
3. **NO WIDGETS WITHOUT WidgetContainer** — Every widget uses the standard shell
4. **NO `console.log`** — Use structured logger
5. **NO `any` TYPES** — TypeScript strict, always

### Required Patterns

```tsx
// ✅ CORRECT — WidgetContainer
<WidgetContainer title="Today's Schedule">
  {/* content */}
</WidgetContainer>

// ✅ CORRECT — CSS variables
className="bg-growth-2 text-synapse-6"

// ❌ WRONG — hardcoded hex
style={{ color: '#DC7B5D' }}

// ❌ WRONG — purple
className="bg-purple-500"
```

---

## RESPONSIVE DESIGN (MANDATORY)

### Mobile-First Breakpoints

| Breakpoint | Prefix | Min Width | Target                      |
| ---------- | ------ | --------- | --------------------------- |
| Mobile     | (none) | 0px       | Default — design here first |
| sm         | `sm:`  | 640px     | Phone landscape             |
| md         | `md:`  | 768px     | Tablet portrait             |
| lg         | `lg:`  | 1024px    | Tablet landscape            |
| xl         | `xl:`  | 1280px    | Laptop/desktop              |
| 2xl        | `2xl:` | 1536px    | Large desktop               |

### Touch Targets

- ALL interactive elements: **44px minimum** (`h-11`)
- ALL nav items: `min-h-[48px]`
- Spacing between interactive elements: **8px minimum**

### Navigation by Viewport

- **Mobile (0–1023px):** Bottom tab bar + hamburger menu
- **Desktop (1024px+):** Left sidebar (`lg:w-64 xl:w-72`)

### Grid Strategy

```tsx
// ✅ Mobile-first
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
className = "flex flex-col sm:flex-row";
className = "w-full sm:w-auto";

// ❌ Desktop-first (NEVER)
className = "grid grid-cols-4 lg:grid-cols-2 sm:grid-cols-1";
```

### Testing Requirements

- **MUST** test at 375px (iPhone SE)
- **MUST** test at 768px (iPad Mini)
- **MUST** test at 1280px (Laptop)

---

## FILE STRUCTURE (CURRENT)

```
/hackathon-final
├── app/                          ← Next.js routing root (ACTIVE)
│   ├── page.tsx                  ← Home page
│   ├── home/                     ← Home route
│   ├── patients/                 ← Patient 360 + roster
│   ├── schedule/                 ← Calendar
│   ├── communications/           ← Unified messaging
│   ├── billing/                  ← Read-only billing
│   ├── marketing/                ← Read-only marketing
│   ├── import/                   ← Data import wizard
│   ├── api/                      ← API routes
│   │   ├── import/
│   │   ├── tts/
│   │   └── marketing-analyze/
│   ├── layout.tsx
│   └── globals.css
│
├── src/                          ← Wave 1 code (needs wiring)
│   ├── app/api/                  ⚠️ DEAD — needs move to root app/api/
│   ├── components/               ← 40+ Wave 1 components (compilable)
│   │   ├── patients/
│   │   ├── clinical/
│   │   ├── ui/
│   │   └── ...
│   ├── lib/                      ← Core libraries
│   │   ├── substrate/            ← Substrate engine
│   │   ├── auth/                 ← NextAuth config
│   │   ├── ai/                   ← AI provider abstraction
│   │   └── ...
│   ├── hooks/                    ← React hooks (auto-save, etc.)
│   └── types/                    ← TypeScript types (clinical, triggers)
│
├── components/                   ← Pre-Wave 1 components
│   ├── ui/                       ← Design system primitives
│   ├── widgets/                  ← Dashboard widgets
│   ├── clinical/                 ← Clinical components
│   ├── layout/                   ← Navigation, sidebar
│   └── import/                   ← Import wizard components
│
├── lib/                          ← Pre-Wave 1 libraries
│   ├── design-system.ts
│   ├── supabase/
│   ├── ai/
│   └── messaging/
│
├── public/assets/backup/         ← Fallback images
├── CLAUDE.md                     ← THIS FILE
├── PROGRESS_TRACKER.md
├── PROJECT_SYNC.md
├── package.json
└── next.config.ts
```

---

## CORE NAVIGATION (9 Pages — Do Not Add More)

| Page           | Route             | Purpose                                              |
| -------------- | ----------------- | ---------------------------------------------------- |
| Home           | `/home`           | AI-surfaced priority action cards + today's schedule |
| Patients       | `/patients`       | Patient roster + Patient 360 detail panel            |
| Schedule       | `/schedule`       | Week/day/month calendar view                         |
| Communications | `/communications` | Unified inbox (SMS, email, voice)                    |
| Billing        | `/billing`        | Read-only → production invoice management            |
| Marketing      | `/marketing`      | Read-only reputation dashboard                       |
| Import         | `/import`         | Data import wizard                                   |
| Settings       | `/settings`       | Practice config (NOT YET BUILT)                      |
| Session        | `/session/[id]`   | Full-screen session recording drill-in               |

**Dynamic Canvas rule:** The page count does NOT grow with the feature count. New features go into existing canvases (especially Patient 360).

---

## CLINICAL DOMAIN

### Outcome Measures (MVP)

| Measure | What It Measures | Score Range |
| ------- | ---------------- | ----------- |
| PHQ-9   | Depression       | 0–27        |
| GAD-7   | Anxiety          | 0–21        |
| PCL-5   | Trauma/PTSD      | 0–80        |

### CPT Codes (MVP)

| Code      | Description                  | Duration                |
| --------- | ---------------------------- | ----------------------- |
| 90834     | Individual Psychotherapy     | 30 min                  |
| 90837     | Individual Psychotherapy     | 45 min                  |
| **90836** | **Individual Psychotherapy** | **50–59 min (PRIMARY)** |

### Voice Commands

| Command                               | Action                                    |
| ------------------------------------- | ----------------------------------------- |
| "Tebra, show me [Patient]"            | Opens Patient 360                         |
| "Tebra, start session with [Patient]" | Begins recording                          |
| "That ends our session"               | Stops recording, triggers SOAP generation |

---

## PRODUCTION QUALITY RULES

### Code Quality

- TypeScript strict mode — **zero `any` types**
- All new functions have JSDoc comments
- All new API routes have Zod input validation
- All new API routes have structured logging with module context
- All new API routes have try/catch error handling with meaningful responses
- All database queries use parameterized queries (no string interpolation)
- No `console.log` — use structured logger

### Security (HIPAA)

- Every new table with PHI gets RLS policy **before** any data is written
- Every new API route touching PHI gets audit logging
- Input sanitization on all user inputs
- CSRF tokens on all state-mutating requests
- Session authentication verified on every protected route

### Testing

- Every new feature gets at least 1 unit test + 1 integration test
- Critical paths get E2E tests
- All tests must pass before merge

### Git Hygiene

- Commit messages: `feat|fix|refactor|test|docs(scope): description`
- Commit after every working change
- `npm run build` must pass before push
- Pull before starting work

---

## AGENT SWARM PATTERNS

### Agent Roles (Standard Configuration)

| Agent     | Specialization   | Owns                                       |
| --------- | ---------------- | ------------------------------------------ |
| **Alpha** | Frontend & UX    | Pages, components, responsive design       |
| **Beta**  | Backend & Data   | API routes, database, Supabase, migrations |
| **Gamma** | AI & Integration | Substrate engine, AI providers, voice      |
| **Delta** | QA & Security    | Testing, audits, RLS, accessibility        |

### Execution Rules

- All agents may execute: `git add -A && git commit -m "..." && git push`
- `npm run build` must pass after every commit
- Agents work in parallel on separate domains
- No agent modifies another agent's files without explicit instruction

### Pre-Approved Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (MUST PASS)
npm run lint         # Lint check
npx tsc --noEmit     # TypeScript check
npm install [pkg]    # Add dependency
```

---

## SPRINT ROADMAP (Feb 10 – Apr 18, 2026)

| Sprint | Dates        | Theme                                                            |
| ------ | ------------ | ---------------------------------------------------------------- |
| **S0** | Feb 10–14    | Stabilization: directory fix, wave 1 wiring, Patient 360 UX lock |
| **S1** | Feb 15–21    | Auth & Onboarding                                                |
| **S2** | Feb 22–28    | Patient Management Production                                    |
| **S3** | Mar 1–7      | Scheduling Production                                            |
| **S4** | Mar 8–14     | Clinical Documentation (Core)                                    |
| **S5** | Mar 15–21    | Clinical Documentation (Extended)                                |
| **S6** | Mar 22–28    | Billing MVP (Self-Pay + Stripe)                                  |
| **S7** | Mar 29–Apr 4 | Communications MVP (Twilio + SendGrid)                           |
| **S8** | Apr 5–11     | Security, Compliance & Infrastructure                            |
| **S9** | Apr 12–18    | Substrate Production + Home + Polish + Beta Deploy               |

---

## PERFORMANCE TARGETS

| Metric                    | Target       |
| ------------------------- | ------------ |
| Page Load (TTI)           | < 2 seconds  |
| AI Response               | < 500ms      |
| SOAP Note Generation      | < 60 seconds |
| Data Import (60 patients) | < 2 minutes  |
| Context Switch            | < 100ms      |

---

## KEY PROJECT FILES

| File                                      | Purpose                                               |
| ----------------------------------------- | ----------------------------------------------------- |
| `CLAUDE.md`                               | **This file** — single source of truth for all agents |
| `PROGRESS_TRACKER.md`                     | Cumulative development history and decisions          |
| `PROJECT_SYNC.md`                         | Cross-agent coordination and handoff state            |
| `MHMVP_PRD_v2_3_CLEAN.md`                 | Complete product requirements                         |
| `MHMVP_PRODUCTION_EXECUTION_PLAN.md`      | Sprint-by-sprint execution bible                      |
| `MHMVP_Production_Launch_Requirements.md` | Exhaustive production feature catalog                 |
| `STABILIZATION_PLAN.md`                   | Sprint 0 tactical plan                                |

---

## CHECKLIST — Before ANY Code Change

### Architecture

- [ ] Uses Patient-as-Central-Object? (Does it belong in Patient 360?)
- [ ] Substrate classification applied? (SILENT / SURFACED / CANVAS / INFRA / EXPLICIT)
- [ ] HITL confirmation on all AI actions?
- [ ] Database queries tenant-scoped via RLS?
- [ ] New table with PHI? → RLS policy FIRST
- [ ] New API route? → Zod validation + structured logging + error handling

### Design

- [ ] Uses correct color tokens? (Growth, Vitality, Backbone, Synapse)
- [ ] **NO PURPLE?**
- [ ] **NO HARDCODED HEX?**
- [ ] Uses WidgetContainer for widgets?
- [ ] Uses CSS variables only?
- [ ] 44px minimum touch targets?

### Responsive

- [ ] Mobile-first CSS? (base = mobile, add `md:` / `lg:` / `xl:`)
- [ ] Tested at 375px / 768px / 1280px?
- [ ] No horizontal scroll at any breakpoint?
- [ ] Touch targets 44px minimum?

### Quality

- [ ] TypeScript strict — zero `any`?
- [ ] `npm run build` passes?
- [ ] Committed with semantic message?
- [ ] Unit test added?

---

_"Competitors show you data. We show you decisions."_

_Build substrate-first. Design before plumbing. Ship deployable increments. Keep the page count at 9._
