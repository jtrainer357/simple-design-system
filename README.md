# Tebra Mental Health MVP

AI-powered practice management platform for solo/small mental health practices (1-3 providers). Replaces legacy EHRs with substrate-first AI intelligence that surfaces prioritized clinical decisions contextually.

## Overview

Mental Health MVP (MHMVP) is designed to replace traditional EHRs like SimplePractice and TherapyNotes with an AI-native system. Core innovation: **Substrate Intelligence** - AI runs continuously in the background analyzing patient data and surfaces prioritized clinical decisions. This is infrastructure that thinks ahead.

**"Competitors show you data. We show you decisions."**

## Tech Stack

| Layer               | Technology                          | Purpose                                    |
| ------------------- | ----------------------------------- | ------------------------------------------ |
| **Framework**       | Next.js 16 (App Router)             | File-based routing, server components      |
| **Language**        | TypeScript (strict)                 | Zero `any` types enforced                  |
| **UI**              | React 19, Tailwind CSS 4, shadcn/ui | Component library with Radix UI primitives |
| **Backend**         | Supabase                            | Auth, PostgreSQL, RLS, Realtime            |
| **State**           | Zustand + React Query               | Client state + server state                |
| **AI - Clinical**   | Claude Sonnet                       | Substrate intelligence analysis            |
| **AI - Generation** | Gemini 2.0 Flash                    | SOAP notes, data import                    |
| **AI - Speech**     | Deepgram                            | Speech-to-text with medical vocabulary     |
| **AI - TTS**        | OpenAI TTS-1                        | Voice responses                            |
| **Animation**       | Framer Motion                       | Page transitions, micro-interactions       |
| **Charts**          | Recharts                            | Outcome measure visualizations             |
| **Forms**           | React Hook Form + Zod               | Form state + validation                    |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase account (for backend services)

### Installation

```bash
# Clone the repository
git clone https://github.com/jtrainer357/mental-health-mvp.git
cd mental-health-mvp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables (see below)
# Then start the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following required variables:

```bash
# Supabase Configuration (Required)
# Get these from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers (Optional - for full AI features)
ANTHROPIC_API_KEY=your-claude-key
GOOGLE_AI_API_KEY=your-gemini-key
DEEPGRAM_API_KEY=your-deepgram-key
OPENAI_API_KEY=your-openai-key
```

## Available Scripts

| Command                 | Description                             |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Start development server with Turbopack |
| `npm run build`         | Build for production                    |
| `npm run start`         | Start production server                 |
| `npm run lint`          | Run ESLint                              |
| `npm run lint:fix`      | Run ESLint with auto-fix                |
| `npm run format`        | Format code with Prettier               |
| `npm run format:check`  | Check code formatting                   |
| `npm run typecheck`     | Run TypeScript type checking            |
| `npm run test`          | Run tests in watch mode                 |
| `npm run test:run`      | Run tests once                          |
| `npm run test:coverage` | Run tests with coverage report          |

## Project Structure

```
/mental-health-mvp
├── app/                          # Next.js App Router (active routes)
│   ├── home/                     # Main dashboard
│   ├── patients/                 # Patient 360 + roster
│   ├── schedule/                 # Calendar views
│   ├── communications/           # Unified messaging
│   ├── billing/                  # Billing dashboard
│   ├── marketing/                # Reputation dashboard
│   ├── import/                   # Data import wizard
│   └── api/                      # API routes
├── src/                          # Source code
│   ├── components/               # React components
│   ├── lib/                      # Core libraries
│   │   ├── ai/                   # AI provider abstraction
│   │   ├── auth/                 # Authentication
│   │   ├── data/                 # Synthetic/demo data
│   │   ├── queries/              # Data fetching
│   │   ├── substrate/            # Substrate engine
│   │   └── security/             # Security utilities
│   ├── hooks/                    # React hooks
│   └── types/                    # TypeScript types
├── design-system/                # UI component library
│   ├── components/ui/            # Core UI components
│   └── styles/                   # Global styles and tokens
└── public/                       # Static assets
```

## Core Features

- **Patient 360** - Comprehensive patient view with clinical, billing, and communication data
- **AI Priority Actions** - Substrate-surfaced clinical decisions requiring human approval
- **SOAP Note Generation** - AI-assisted clinical documentation
- **Outcome Measures** - PHQ-9, GAD-7, PCL-5 tracking with visualizations
- **Voice Commands** - "Tebra" wake word with natural language interaction
- **Unified Communications** - SMS, email, and voice in one inbox
- **Smart Scheduling** - AI-assisted appointment optimization

## Design System

The application uses the Tebra Design System with four color palettes:

- **Growth (Teal)** - Primary brand, AI features, navigation
- **Vitality (Coral)** - Action buttons, CTAs
- **Backbone** - Warm neutral backgrounds
- **Synapse** - Grayscale, text hierarchy

All colors use CSS variables - no hardcoded hex values.

## Development Guidelines

- TypeScript strict mode enforced (zero `any` types)
- Mobile-first responsive design (375px, 768px, 1280px breakpoints)
- 44px minimum touch targets for accessibility
- Structured logging (no `console.log`)
- RLS policies on all PHI tables (HIPAA compliance)

## License

Proprietary - Tebra. All rights reserved.
