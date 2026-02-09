# Stitch Prompt Engineer

Transform rough UI ideas into polished, Stitch-optimized prompts for the Tebra Mental Health platform.

## Purpose

Take rough UI descriptions and enhance them into structured prompts that produce high-quality, consistent Stitch generations matching the Tebra design system.

## When to Use

- Before any `mcp_stitch:generate_screen_from_text` call
- When user provides a vague screen description
- When iterating on a Stitch output that missed the mark

## Reference

[Stitch Effective Prompting Guide](https://stitch.withgoogle.com/docs/learn/prompting/)

## Prompt Enhancement Process

### Step 1: Assess Input Completeness

Check for these elements in the rough idea:

- [ ] Platform specified (web/mobile/tablet)
- [ ] Page type identified (dashboard, form, list, detail, etc.)
- [ ] Content structure described
- [ ] Visual style mentioned
- [ ] Color scheme indicated
- [ ] Key components listed

### Step 2: Load Design System Block

If `DESIGN.md` exists, inject the design system as a prompt block:

```
---
DESIGN SYSTEM (Tebra Mental Health)
- Primary: Vitality Coral (#E67E4A) for CTAs and active states
- Accent: Deep Teal (#3B7A7A) for navigation and links
- Background: Warm off-white (#FBF9F8) with subtle animated gradients
- Cards: Glass morphism with backdrop-blur, rounded-lg corners
- Buttons: Pill-shaped (rounded-full), 150ms hover transitions
- Typography: Akkurat LL font family, light weight headings
- Tone: Professional healthcare, warm and approachable
---
```

### Step 3: Enhance Vague Terms

Replace generic descriptions with specific UI vocabulary:

| Vague Term              | Enhanced Version                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| "menu at the top"       | "horizontal navigation bar with logo on left, menu items center, user avatar right"        |
| "list of patients"      | "scrollable patient roster with cards showing avatar, name, last visit date, status badge" |
| "form to add something" | "multi-step form wizard with progress indicator, floating labels, inline validation"       |
| "some stats"            | "KPI dashboard with metric cards showing value, trend arrow, sparkline chart"              |
| "calendar"              | "week view calendar grid with time slots, event cards, drag-to-create interaction"         |
| "settings page"         | "tabbed settings panel with sections for profile, preferences, notifications, security"    |

### Step 4: Structure the Prompt

Use numbered sections for complex pages:

```
Create a [page type] for [platform] with the following structure:

1. HEADER
   - [specific header components]

2. MAIN CONTENT
   - [section 1 description]
   - [section 2 description]

3. SIDEBAR (if applicable)
   - [sidebar components]

4. FOOTER/ACTIONS
   - [footer elements or action buttons]

DESIGN REQUIREMENTS:
- [color specifications with hex codes]
- [typography rules]
- [component patterns]

CONTEXT:
- [user type]
- [use case]
- [tone/mood]
```

### Step 5: Format Colors Correctly

Always specify colors as: `Descriptive Name (#hex) for functional role`

Examples:

- "Vitality Coral (#E67E4A) for primary action buttons"
- "Deep Teal (#3B7A7A) for navigation icons and links"
- "Warm White (#FBF9F8) for page background"
- "Success Green (#4CAF50) for completion indicators"

## Tebra-Specific Templates

### Patient List Screen

```
Create a desktop web page for a mental health practice patient roster.

1. HEADER
   - Search bar with placeholder "Search patients..."
   - Filter chips: All, Active, New This Week, Needs Follow-up
   - "Add Patient" button (pill-shaped, Vitality Coral)

2. PATIENT LIST
   - Scrollable list of patient cards
   - Each card shows: avatar, full name, pronouns, last session date, status badge
   - Cards have glass morphism effect (white with 90% opacity, subtle backdrop blur)
   - Hover state shows teal border highlight

3. SIDEBAR (right)
   - Quick stats: total patients, sessions this week, upcoming appointments
   - Stat cards use Deep Teal (#3B7A7A) icons

DESIGN:
- Background: Warm off-white (#FBF9F8)
- Typography: Akkurat LL, light weight for headings
- Border radius: rounded-lg for cards, rounded-full for buttons
- Shadows: soft, 6% opacity black
```

### Clinical Note Screen

```
Create a desktop clinical documentation interface for mental health providers.

1. PATIENT HEADER
   - Compact patient info bar: avatar, name, DOB, pronouns, MRN
   - Session type badge, date/time

2. NOTE EDITOR
   - Rich text area with formatting toolbar
   - Template quick-insert buttons
   - AI suggestion sidebar showing "Smart suggestions" with teal accent

3. SIDEBAR
   - Previous notes accordion (collapsible)
   - Diagnosis codes list
   - Treatment plan summary

4. FOOTER
   - "Save Draft" secondary button
   - "Complete & Sign" primary button (Vitality Coral)

DESIGN:
- Glass card containers with backdrop-blur
- Teal accents for AI-related features
- High contrast for clinical text readability
```

### Scheduling Screen

```
Create a desktop calendar interface for mental health appointment scheduling.

1. HEADER
   - Date navigation (< Today >)
   - View toggle: Day | Week | Month
   - "New Appointment" button (Vitality Coral)

2. CALENDAR GRID
   - Week view with 7 columns
   - Hour rows from 8am to 6pm
   - Appointment blocks color-coded by type:
     - Individual therapy: Soft teal
     - Group session: Soft coral
     - Assessment: Soft purple

3. SIDEBAR
   - Mini month calendar
   - Provider filter checkboxes
   - Room availability

DESIGN:
- Clean grid lines with subtle borders
- Event cards with rounded corners, subtle shadow
- Time markers in muted gray
```

## Prompt Quality Checklist

Before sending to Stitch:

- [ ] Design system block included
- [ ] Colors specified with hex codes
- [ ] Component patterns explicit (pill buttons, glass cards)
- [ ] Typography mentioned (Akkurat LL)
- [ ] Platform and viewport specified
- [ ] Content structure numbered and clear
- [ ] Healthcare context established
- [ ] Warm, professional tone indicated
