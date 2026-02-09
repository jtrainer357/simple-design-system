# Stitch-to-Production Converter

Convert Stitch-generated HTML into modular, production-grade React components for the Tebra Mental Health platform.

## Purpose

Transform monolithic Stitch HTML output into properly structured React components that integrate seamlessly with the existing codebase architecture.

## When to Use

- After downloading Stitch-generated HTML
- When integrating a new screen into the app
- When refactoring imported Stitch components

## Prerequisites

- Stitch HTML downloaded to `queue/` directory
- Understanding of target route/page structure
- Access to existing design system components

## Conversion Process

### Step 1: Fetch Screen HTML

```bash
# Download HTML from Stitch
curl -o queue/screen-name.html "https://storage.googleapis.com/stitch-output/[project]/[screen]/index.html"
```

### Step 2: Extract Tailwind Config

Stitch HTML includes a `<script>` tag with tailwind config. Extract and compare to existing:

```javascript
// Stitch typically outputs something like:
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* extracted colors */
      },
      fontFamily: {
        /* fonts */
      },
    },
  },
};
```

Map Stitch colors to existing Tebra tokens:

| Stitch Color | Tebra Variable       | Use             |
| ------------ | -------------------- | --------------- |
| `#E67E4A`    | `--color-primary`    | Primary actions |
| `#3B7A7A`    | `--color-teal`       | Accents, nav    |
| `#545454`    | `--color-foreground` | Body text       |
| `#FBF9F8`    | Page background      | Warm white      |

### Step 3: Identify Component Boundaries

Break the HTML into logical components based on:

1. **Repeated patterns** (cards, list items)
2. **Semantic sections** (header, sidebar, main)
3. **Interaction zones** (forms, modals, menus)
4. **Data-driven areas** (lists, tables, charts)

### Step 4: Create Component Files

Follow Tebra file structure:

```
app/home/[route]/
  _components/
    [section-name].tsx       # Main section component
    [list-item].tsx          # Repeated item component
    [form-name].tsx          # Form components
  page.tsx                    # Route page
```

### Step 5: Apply Conversion Rules

#### Replace HTML Elements with Radix/shadcn Components

```tsx
// BEFORE (Stitch HTML)
<button class="rounded-full bg-orange-500 px-4 py-2 text-white">Save</button>;

// AFTER (Tebra component)
import { Button } from "@/design-system/components/ui/button";
<Button variant="default">Save</Button>;
```

#### Component Mapping Table

| Stitch Output | Tebra Component  | Import                                        |
| ------------- | ---------------- | --------------------------------------------- |
| `<button>`    | `<Button>`       | `@/design-system/components/ui/button`        |
| `<input>`     | `<Input>`        | `@/design-system/components/ui/input`         |
| `<select>`    | `<Select>`       | `@/design-system/components/ui/select`        |
| `<dialog>`    | `<Dialog>`       | `@/design-system/components/ui/dialog`        |
| Card div      | `<Card>`         | `@/design-system/components/ui/card`          |
| Dropdown      | `<DropdownMenu>` | `@/design-system/components/ui/dropdown-menu` |
| Tabs          | `<Tabs>`         | `@/design-system/components/ui/tabs`          |
| Avatar        | `<Avatar>`       | `@/design-system/components/ui/avatar`        |
| Badge         | `<Badge>`        | `@/design-system/components/ui/badge`         |
| Tooltip       | `<Tooltip>`      | `@/design-system/components/ui/tooltip`       |

#### Replace Icons with Lucide

```tsx
// BEFORE (Stitch inline SVG or heroicon)
<svg>...</svg>;

// AFTER (Lucide)
import { Calendar, User, Settings } from "lucide-react";
<Calendar className="h-5 w-5" />;
```

Common icon mappings:

- Calendar/schedule: `Calendar`
- User/patient: `User`, `Users`
- Settings: `Settings`, `Cog`
- Search: `Search`
- Add/new: `Plus`, `PlusCircle`
- Edit: `Pencil`, `Edit`
- Delete: `Trash2`
- Close: `X`
- Check: `Check`, `CheckCircle`
- Alert: `AlertCircle`, `AlertTriangle`
- Info: `Info`
- Chat/message: `MessageSquare`
- Phone: `Phone`
- Email: `Mail`

#### Replace Inline Colors with CSS Variables

```tsx
// BEFORE
<div className="bg-[#E67E4A] text-white">

// AFTER
<div className="bg-primary text-primary-foreground">
```

### Step 6: Extract Static Data

Move hardcoded content to data files:

```typescript
// src/lib/data/[feature]-data.ts
export const patientListData = [
  {
    id: "1",
    name: "Sarah Johnson",
    // ...
  },
];
```

### Step 7: Add TypeScript Interfaces

```typescript
// Component props
interface PatientCardProps {
  patient: Patient;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

// Data types in src/lib/types/
export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  // ...
}
```

### Step 8: Wire Event Handlers

Move inline handlers to proper functions:

```tsx
// BEFORE
<button onclick="handleClick()">

// AFTER
const handlePatientSelect = useCallback((patientId: string) => {
  router.push(`/home/patients/${patientId}`);
}, [router]);
```

For complex state, use Zustand:

```typescript
// src/lib/stores/[feature]-store.ts
import { create } from "zustand";

interface FeatureState {
  selectedId: string | null;
  setSelected: (id: string) => void;
}

export const useFeatureStore = create<FeatureState>((set) => ({
  selectedId: null,
  setSelected: (id) => set({ selectedId: id }),
}));
```

### Step 9: Add Animation with Framer Motion

```tsx
import { motion } from "framer-motion";

// Wrap page content
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  {/* content */}
</motion.div>;

// Or use existing PageTransition component
import { PageTransition } from "@/design-system/components/ui/page-transition";
```

### Step 10: Validate Build

```bash
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm run build      # Full build
```

## File Naming Conventions

| Type                | Convention        | Example                      |
| ------------------- | ----------------- | ---------------------------- |
| Page                | `page.tsx`        | `app/home/patients/page.tsx` |
| Layout              | `layout.tsx`      | `app/home/layout.tsx`        |
| Component (section) | `kebab-case.tsx`  | `patient-header.tsx`         |
| Component (UI)      | `kebab-case.tsx`  | `patient-card.tsx`           |
| Hook                | `use[Name].ts`    | `usePatientData.ts`          |
| Store               | `[name]-store.ts` | `patient-store.ts`           |
| Types               | `[name].ts`       | `patient.ts`                 |
| Data                | `[name]-data.ts`  | `patient-data.ts`            |

## Output Quality Checklist

- [ ] All Stitch HTML elements replaced with Tebra components
- [ ] All inline colors replaced with CSS variables
- [ ] All icons replaced with Lucide
- [ ] TypeScript interfaces for all props
- [ ] Event handlers extracted to functions/hooks
- [ ] Static data moved to data files
- [ ] Framer Motion animations applied
- [ ] Build passes without errors
- [ ] ESLint passes (warnings acceptable)
- [ ] Component follows existing code patterns

## Example Conversion

### Input (Stitch HTML excerpt)

```html
<div class="rounded-lg bg-white p-4 shadow-md">
  <div class="flex items-center gap-3">
    <img src="avatar.png" class="h-10 w-10 rounded-full" />
    <div>
      <h3 class="font-semibold text-gray-900">Sarah Johnson</h3>
      <p class="text-sm text-gray-500">Last visit: Jan 15</p>
    </div>
  </div>
  <button class="mt-4 rounded-full bg-[#E67E4A] px-4 py-2 text-white">View Details</button>
</div>
```

### Output (Tebra Component)

```tsx
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/design-system/components/ui/avatar";
import { Button } from "@/design-system/components/ui/button";

interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    avatarUrl?: string;
    lastVisit: string;
  };
  onViewDetails: (id: string) => void;
}

export function PatientCard({ patient, onViewDetails }: PatientCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={patient.avatarUrl} alt={patient.name} />
          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-foreground-strong font-semibold">{patient.name}</h3>
          <p className="text-muted-foreground text-sm">Last visit: {patient.lastVisit}</p>
        </div>
      </div>
      <Button className="mt-4" onClick={() => onViewDetails(patient.id)}>
        View Details
      </Button>
    </Card>
  );
}
```
