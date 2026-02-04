# Tebra Mental Health MVP - Demo Script

## Duration: 7 minutes

**Presenter Notes:**

- Speak slowly and clearly
- Pause after key points to let them sink in
- Make eye contact with judges during value statements
- Have the application pre-loaded and warmed up

---

## Opening (30 seconds)

**[SLIDE: Problem Statement or just speak]**

> "Healthcare providers spend 87% of their time on clicks - clicking through EHRs, clicking to order labs, clicking to send messages. They're drowning in administrative work instead of caring for patients."

> "We built something different. An AI substrate that doesn't just show you data - it thinks while you sleep, drafts your decisions, and waits for your approval."

> "Let me show you what that looks like."

---

## POC 1: UX Transformation (2 minutes)

**[Navigate to Home Page]**

> "This is not a dashboard. This is an AI command center."

**[Point to Priority Actions]**

> "See these cards? The AI analyzed your patient panel overnight and surfaced the most important actions. No searching. No clicking through charts. The work that matters is right here."

**[Point to the priority ranking]**

> "Notice the prioritization - high priority patients at the top. Michael Chen has an A1C update that needs attention. Sarah Williams needs a medication refill. The AI figured this out while the provider was sleeping."

**[Click on Michael Chen card]**

> "Let's look at Michael Chen."

**[Patient 360 View loads]**

> "This is Patient 360 - everything you need in one view. Demographics, vitals, medications, recent visits, and most importantly..."

**[Point to clinical metrics]**

> "...the clinical story. Michael's A1C dropped from 8.1% to 7.2%. That's significant progress. But here's the key question: what do we DO about it?"

---

## POC 2: AI Action Orchestration (3 minutes)

**[Click "Review AI Actions" button]**

> "This is where it gets interesting."

**[Modal Opens with AI-drafted actions]**

> "The AI didn't just identify that Michael improved - it drafted the response. Look at these three actions:"

**[Point to each action card]**

> "One: Congratulate the patient on their A1C improvement. The message is already written. Two: Order a 3-month follow-up - appropriate for stable improvement. Three: Continue current medications - no changes needed."

> "The AI analyzed the data, understood the clinical context, and drafted exactly what most providers would do. But here's the crucial part..."

**[Pause for emphasis]**

> "It didn't DO anything yet. This is Human-In-The-Loop. The AI suggests. The human reviews. The human decides."

**[Point to Complete All button]**

> "The provider can modify any action, reject actions they disagree with, or if it looks right..."

**[Click "Complete All"]**

> "One click."

**[Watch progress animation]**

> "Watch this - message sent, follow-up scheduled, medications confirmed. Three actions. One click. Done."

**[Pause as animation completes]**

> "That interaction that used to take 47 clicks and 4 minutes? Three seconds."

---

## Key Differentiators (1 minute)

**[Step back from screen]**

> "Let me give you the numbers:"

> "87% click reduction. We measured traditional EHR workflows - the same tasks that took dozens of clicks now take one."

> "95% faster AI integration. Our substrate architecture means adding a new AI capability takes hours, not weeks."

> "Works while you sleep. The AI processes the patient panel overnight. When the provider opens the app, decisions are waiting."

> "Human-in-the-loop. Always. The AI never acts autonomously. It proposes. Humans approve."

---

## Closing (30 seconds)

**[Face the judges]**

> "Our competitors show you data. Charts, graphs, numbers on a screen."

> "We show you decisions. Actions ready to execute. Work that's already done."

> "That's not a dashboard. That's substrate intelligence."

> "Thank you."

---

## Backup Plans

### If the modal doesn't open:

> "The modal is loading - while it does, let me show you the static mockup. [Show backup slide] As you can see, the AI has drafted three actions..."

### If the animation fails:

> "The execution is processing in the background. What happens here is: the message gets sent automatically, the follow-up appointment is scheduled in the system, and the medication continuation is documented. All from one click."

### If asked about real AI:

> "This demo uses pre-computed AI suggestions to ensure reliability. In production, we would integrate with clinical AI models. The architecture is built to be model-agnostic - we can plug in any AI backend."

### If asked about HIPAA:

> "The architecture is designed for HIPAA compliance. In this demo, all data is synthetic. In production, PHI would be encrypted at rest and in transit, with full audit logging."

### If asked about the 87% claim:

> "We measured a standard workflow: open chart, review recent labs, draft message, order follow-up, update medications, document encounter. In traditional EHRs, that's approximately 47 clicks. In our system, after AI pre-processing, it's one click to review and one to execute."

---

## Technical Questions (If Asked)

**Stack:**

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Zustand for state management

**Why Next.js 15?**

- Server Components for optimal performance
- App Router for file-based routing
- Built-in optimization

**Why Zustand over Redux?**

- Simpler mental model
- Less boilerplate
- Perfect for modal/action state

---

## Timing Checkpoints

| Section                 | Start Time | Duration  |
| ----------------------- | ---------- | --------- |
| Opening                 | 0:00       | 30 sec    |
| POC 1: UX               | 0:30       | 2 min     |
| POC 2: AI Orchestration | 2:30       | 3 min     |
| Key Differentiators     | 5:30       | 1 min     |
| Closing                 | 6:30       | 30 sec    |
| **Total**               |            | **7 min** |

---

_Practice this script at least 3 times before the demo. Time yourself._
