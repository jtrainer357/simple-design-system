# Tebra Mental Health MVP

## 1. Vision

An AI-native practice management platform designed specifically for mental health practitioners. The platform streamlines clinical workflows through intelligent automation, reducing administrative burden by 87% through AI-surfaced priority actions and human-in-the-loop orchestration. Built with a warm, professional aesthetic that balances clinical precision with approachable design.

**Target Users:** Therapists, psychiatrists, counselors, and mental health practice administrators.

**Key Differentiator:** AI "substrate intelligence" that works while you sleep, preparing actions for human approval rather than replacing human judgment.

## 2. Stitch Project ID

`3062879178499529135`

**Project URL:** `https://stitch.withgoogle.com/project/3062879178499529135`

## 3. Device Target

- **Primary:** Desktop (1280px+)
- **Secondary:** Tablet (768px - 1279px)
- **Tertiary:** Mobile (< 768px)

**Approach:** Desktop-first responsive design. Mobile experience is functional but optimized for quick actions rather than full workflow.

**Breakpoints:**

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 4. Sitemap

### Core Application (Completed)

- [x] Home Dashboard `/home` - AI command center with priority actions
- [x] Patient List `/home/patients` - Patient roster with search and filters
- [x] Patient Detail 360 `/home/patients/[id]` - Comprehensive patient view (partial)
- [x] Schedule `/home/schedule` - Calendar with appointments
- [x] Communications `/home/communications` - Unified messaging center
- [x] Billing `/home/billing` - Revenue metrics and claims
- [x] Marketing `/home/marketing` - Referral analytics

### Screens to Generate

- [ ] Session Notes Editor `/home/patients/[id]/notes/new` - Clinical documentation
- [ ] New Appointment Modal `/home/schedule/new` - Appointment creation wizard
- [ ] Billing Detail `/home/billing/[id]` - Individual claim/payment detail
- [ ] Message Thread `/home/communications/[id]` - Conversation view
- [ ] Provider Settings `/home/settings` - Account and practice settings
- [ ] Reports Dashboard `/home/reports` - Analytics and reporting
- [ ] Intake Form Builder `/home/settings/forms` - Custom form creation
- [ ] Patient Portal Preview `/home/patients/[id]/portal` - What patients see

## 5. Roadmap

### Phase 1: Clinical Documentation (Priority)

1. **Session Notes Editor** - Rich text clinical note with AI suggestions
2. **Note Templates** - Reusable documentation templates

### Phase 2: Scheduling Enhancement

3. **New Appointment Wizard** - Multi-step appointment creation
4. **Recurring Appointment Setup** - Series scheduling

### Phase 3: Communication

5. **Message Thread View** - Full conversation with patient
6. **Broadcast Composer** - Group message to patient cohorts

### Phase 4: Practice Management

7. **Provider Settings** - Full settings panel
8. **Reports Dashboard** - Practice analytics
9. **Billing Detail** - Claim management

### Phase 5: Growth

10. **Intake Form Builder** - Custom intake forms
11. **Patient Portal Preview** - Portal configuration

## 6. Creative Freedom

### Micro-Interactions to Explore

- **Card hover states** - Subtle lift with shadow increase
- **Button press feedback** - Scale down (0.98) with color shift
- **List item selection** - Smooth border highlight animation
- **Toast notifications** - Slide in from bottom-right with spring physics
- **Page transitions** - Fade + subtle Y translation
- **Loading states** - Skeleton screens with shimmer effect
- **Success animations** - Checkmark draw animation

### Visual Polish Ideas

- **Animated gradient background** - Slow-moving soft blobs (already implemented)
- **Glass morphism cards** - Backdrop blur with transparency
- **Teal accent trails** - Subtle color echoes on navigation
- **Avatar status indicators** - Pulsing online/busy dots
- **Time-based greetings** - "Good morning, Dr. Smith"

### Healthcare-Specific Touches

- **Urgency indicators** - Color-coded priority badges (never red unless critical)
- **PHI indicators** - Subtle lock icons on sensitive data
- **Session type icons** - Visual differentiation for therapy types
- **Mood tracking visualization** - Soft, non-clinical presentation

## 7. Build Log

| Screen | Generated | Integrated | Notes                     |
| ------ | --------- | ---------- | ------------------------- |
| -      | -         | -          | No Stitch generations yet |

## 8. MCP Setup Instructions

To connect Stitch MCP, add to your Claude Code settings:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@anthropic/stitch-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Or via Claude Desktop config (`~/.config/claude/claude_desktop_config.json`).

---

_Last Updated: 2026-02-09_
