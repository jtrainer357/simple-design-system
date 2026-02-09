# Next Screen: Session Notes Editor

## Route

/home/patients/[id]/notes/new

## Priority

1 (Highest - Core clinical workflow)

## Prompt

Create a desktop web page for a mental health clinical note editor.

1. HEADER
   - Compact patient info bar: circular avatar on left, patient name (bold), pronouns in parentheses, DOB, MRN
   - Session metadata: date, time, duration, session type badge (e.g., "Individual Therapy")
   - "Back to Patient" link on far left with chevron icon

2. MAIN CONTENT (two-column layout)

   LEFT COLUMN (65% width):
   - Section label: "Session Notes" with document icon
   - Rich text editor area with:
     - Formatting toolbar: Bold, Italic, Bullet list, Numbered list, Heading
     - Large text area with placeholder "Begin documenting your session..."
     - Minimum height of 400px
   - Below editor:
     - "Quick Templates" row with pill buttons: "Progress Note", "Intake Assessment", "Treatment Plan Update"

   RIGHT COLUMN (35% width):
   - Card: "AI Suggestions" with sparkle icon in Deep Teal
     - 3-4 suggestion chips like "Add diagnosis code", "Document treatment goals", "Note medication changes"
     - Each chip has small lightning bolt icon
   - Card: "Previous Notes" accordion
     - Collapsed items showing date and note type
     - Expandable to show preview
   - Card: "Diagnosis Codes"
     - List of ICD-10 codes with descriptions
     - "+ Add Code" button at bottom

3. FOOTER (sticky at bottom)
   - Left side: "Last saved: Draft" timestamp in muted text
   - Right side:
     - "Save Draft" secondary button (outline style)
     - "Complete & Sign" primary button (Vitality Coral, pill-shaped)

---

DESIGN SYSTEM (Tebra Mental Health)

COLORS:

- Primary: Vitality Coral (#E67E4A) - CTAs, active states
- Accent: Deep Teal (#3B7A7A) - navigation, links, AI features
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
- Cards: rounded-lg, subtle border, soft shadow, backdrop-blur
- Inputs: rounded-md, teal focus ring
- Badges: rounded-full for status, rounded-md for codes

TONE:

- Professional healthcare but warm and approachable
- Clean, modern, calming
- Generous whitespace
- AI features highlighted with teal accent

---

## Dependencies

- Patient Detail view (exists)
- Patient data model (exists)

## Output Location

app/home/patients/[id]/notes/new/page.tsx

## Notes

- This is a critical clinical documentation screen
- Must support keyboard navigation for accessibility
- AI suggestions should feel helpful, not intrusive
- Consider auto-save functionality
- Rich text editor will need a library (consider TipTap or Lexical)
