# Hackathon Final

AI-powered healthcare practice management system - Hackathon submission

## Overview

This project is an AI-enhanced healthcare practice management application designed to streamline clinical workflows and improve patient care through intelligent automation.

## Features

- **Patient Management** - Comprehensive patient records and care coordination
- **Smart Scheduling** - AI-assisted appointment scheduling and optimization
- **Communications Hub** - Unified messaging and notification system
- **Billing Integration** - Streamlined billing and payment processing
- **Analytics Dashboard** - Real-time insights and reporting

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4, Radix UI
- **Design System**: Custom component library with shadcn/ui foundations
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod validation

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── home/              # Main application pages
│   │   ├── patients/      # Patient management
│   │   ├── schedule/      # Appointment scheduling
│   │   ├── communications/# Messaging center
│   │   └── billing/       # Billing dashboard
│   └── design-system/     # Component documentation
├── design-system/         # Reusable UI components
│   ├── components/ui/     # Core UI components
│   └── styles/            # Global styles and tokens
└── public/                # Static assets
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

## License

Hackathon project - All rights reserved.
