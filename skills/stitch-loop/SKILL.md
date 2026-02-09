# Autonomous Build Loop

Iterative, autonomous screen generation using a baton-passing pattern for the Tebra Mental Health platform.

## Purpose

Enable continuous screen generation where each iteration reads a task from `next-prompt.md`, generates via Stitch, integrates into the project, and writes the next task.

## When to Use

- When generating multiple screens in sequence
- For autonomous overnight builds
- When iterating through a defined sitemap

## Prerequisites

- Stitch MCP server configured and available
- `SITE.md` with sitemap defined
- `DESIGN.md` with design system established
- `next-prompt.md` with current baton

## Baton File Format

`next-prompt.md` structure:

```markdown
# Next Screen: [Screen Name]

## Route

/home/[route-path]

## Priority

[1-5, where 1 is highest]

## Prompt

[Full enhanced prompt with design system block]

## Dependencies

- [screens that should exist first]

## Output Location

app/home/[path]/page.tsx

## Notes

[Any special considerations]
```

## Loop Workflow

### Step 1: Read Current Baton

```bash
cat next-prompt.md
```

Extract:

- Screen name
- Target route
- Enhanced prompt
- Output location

### Step 2: Consult Context Files

Read `SITE.md` for:

- Project ID
- Sitemap status (which screens are done)
- Overall roadmap

Read `DESIGN.md` for:

- Current design system block
- Component patterns

### Step 3: Generate Screen

```
# Via Stitch MCP
mcp_stitch:generate_screen_from_text({
  project_id: "[from SITE.md]",
  prompt: "[from next-prompt.md with design system block]",
  name: "[screen name]"
})
```

### Step 4: Download Artifacts

```bash
# Download HTML
curl -o queue/[screen-name].html "[stitch-html-url]"

# Download screenshot
curl -o queue/[screen-name].png "[stitch-screenshot-url]"
```

### Step 5: Integrate into Project

For Next.js App Router:

1. **Create route directory** (if needed):

   ```bash
   mkdir -p app/home/[route-path]
   ```

2. **Create page.tsx**:
   Use the react-components skill to convert Stitch HTML to production React.

3. **Wire navigation**:
   - Update `design-system/components/ui/left-nav.tsx` if adding main nav item
   - Add route to any relevant link components

4. **Add to layout** (if needed):
   - Ensure route is covered by appropriate layout.tsx

### Step 6: Update SITE.md

Mark completed screen in sitemap:

```markdown
## Sitemap

- [x] Home Dashboard (/home)
- [x] Patient List (/home/patients)
- [x] Patient Detail (/home/patients/[id]) <-- JUST COMPLETED
- [ ] Schedule (/home/schedule)
```

Update completion timestamp:

```markdown
## Build Log

| Screen         | Completed  | Notes                   |
| -------------- | ---------- | ----------------------- |
| Patient Detail | 2026-02-09 | Generated from baton #3 |
```

### Step 7: Write Next Baton

Determine next screen from SITE.md roadmap:

1. Find first uncompleted screen with satisfied dependencies
2. Use enhance-prompt skill to build full prompt
3. Write to `next-prompt.md`

## Tebra Screen Roadmap

Priority order for autonomous generation:

| Priority | Screen             | Route                           | Dependencies   |
| -------- | ------------------ | ------------------------------- | -------------- |
| 1        | Patient Detail 360 | /home/patients/[id]             | Patient List   |
| 2        | Session Notes      | /home/patients/[id]/notes/[nid] | Patient Detail |
| 3        | New Appointment    | /home/schedule/new              | Schedule       |
| 4        | Billing Detail     | /home/billing/[id]              | Billing        |
| 5        | Message Thread     | /home/communications/[id]       | Communications |
| 6        | Provider Settings  | /home/settings                  | None           |
| 7        | Reports Dashboard  | /home/reports                   | None           |

## Integration Patterns

### Adding a New Page Route

```typescript
// app/home/[new-route]/page.tsx
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { NewScreenComponent } from "./_components/new-screen-component";

export default function NewPage() {
  return (
    <PageTransition>
      <NewScreenComponent />
    </PageTransition>
  );
}
```

### Adding to Navigation

In `left-nav.tsx`, add to nav items array:

```typescript
{
  icon: IconComponent,
  label: "New Screen",
  href: "/home/new-route",
}
```

### Updating Layout if Needed

Check if new route needs different layout (sidebar, no sidebar, etc.):

- Standard pages: Use existing `app/home/layout.tsx`
- Full-width pages: May need custom layout
- Modal routes: Consider parallel routes

## Error Handling

If generation fails:

1. Log error to `queue/errors.log`
2. Mark screen as FAILED in SITE.md
3. Write same baton back to next-prompt.md with RETRY flag
4. After 3 retries, skip and move to next screen

## Loop Termination

Stop the loop when:

- All screens in SITE.md are completed
- `next-prompt.md` contains `STOP` flag
- Critical error encountered (auth, quota, etc.)

## Verification Checklist

After each screen integration:

- [ ] Page loads without errors
- [ ] Navigation works to/from new page
- [ ] Design matches DESIGN.md patterns
- [ ] TypeScript compiles without errors
- [ ] Responsive behavior acceptable
- [ ] SITE.md updated
- [ ] Next baton written
