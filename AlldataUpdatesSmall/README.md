# 🎯 MHMVP HACKATHON DEMO DATA PACKAGE

**System Date:** Friday, February 6, 2026 (Demo Day)  
**Practice:** Dr. Jennifer Martinez, PsyD - Mount Lebanon, PA  
**Dataset:** 23 Curated Patients | 89 Appointments | 66 Messages | 98 Invoices | 5 Priority Actions

---

## 📦 What's Included

| File                        | Records | Purpose                                          |
| --------------------------- | ------- | ------------------------------------------------ |
| `demo_patients.csv`         | 23      | Patient roster (7 story patients + 16 support)   |
| `demo_appointments.csv`     | 89      | Full appointment history + upcoming schedule     |
| `demo_medications.csv`      | 23      | Active prescriptions with refill dates           |
| `demo_outcome_measures.csv` | 73      | PHQ-9, GAD-7, PCL-5 progression data             |
| `demo_communications.csv`   | 66      | SMS/email threads tied to patients               |
| `demo_invoices.csv`         | 98      | 6-month billing history (Aug 2025 - Feb 6, 2026) |
| `prioritized_actions.json`  | 5       | AI substrate intelligence seed data              |
| `supabase_demo_seed.sql`    | -       | SQL migration script to load everything          |

---

## 🚀 QUICK START

### Option 1: Load via Supabase SQL Editor (Fastest ⚡)

1. **Open Supabase Dashboard** → Your Project → SQL Editor
2. **Create new query**
3. **Copy entire `supabase_demo_seed.sql` script**
4. **Paste into SQL Editor**
5. **Click "Run"**
6. ✅ Done! Demo data is loaded.

### Option 2: Load via Node.js Script (Programmatic)

```bash
npm install @supabase/supabase-js
node load_demo_data.js
```

(See `load_demo_data.js` for implementation)

### Option 3: Import CSVs Individually

If you prefer manual Supabase UI import:

1. **Patients** → Go to Supabase → patients table → Import CSV → `demo_patients.csv`
2. **Appointments** → appointments table → `demo_appointments.csv`
3. **Medications** → medications table → `demo_medications.csv`
4. **Outcome Measures** → outcome_measures table → `demo_outcome_measures.csv`
5. **Communications** → communications table → `demo_communications.csv`
6. **Invoices** → invoices table → `demo_invoices.csv` (if table exists)
7. **Priority Actions** → Manually insert from `prioritized_actions.json`

---

## 🧬 7 CORE STORY PATIENTS (For Demo Narrative)

### 1. **Sarah Mitchell** (URGENT: Elevated A1C)

- **Status:** Active, 38F, Depression
- **Progress:** PHQ-9 19→7 (excellent response to Sertraline + CBT)
- **🚨 TRIGGER:** PCP discovered A1C 7.8% (pre-diabetes)
- **Demo Hook:** Shows AI connecting therapy + lab results for integrated care
- **Action:** "Elevated A1C Levels Detected" (URGENT, 94% confidence)

### 2. **Marcus Johnson** (HIGH: Medication Refill)

- **Status:** Active, 29M, Anxiety
- **Progress:** GAD-7 16→12 (good response to Escitalopram 10mg)
- **🚨 TRIGGER:** Refill due Feb 8, 2026 (4 days from demo date)
- **Demo Hook:** Shows medication management workflow + "Complete All Actions"
- **Action:** "Medication Refill Due" (HIGH, 98% confidence)

### 3. **Emily Chen** (HIGH: First Appointment)

- **Status:** New, 25F, Anxiety Disorder
- **Stressor:** Recent job loss (6 weeks ago)
- **🚨 TRIGGER:** First appointment is Feb 6, 2026 (TODAY - demo day!)
- **Demo Hook:** Shows new patient onboarding + intake preparation
- **Action:** "First Appointment Tomorrow" (HIGH, 100% confidence)

### 4. **David Rodriguez** (URGENT: Comorbid Depression + SI)

- **Status:** Active, 42M, PTSD + NEW Depression
- **Progress:** PCL-5 stable at 47 | PHQ-9 NEW score 9
- **🚨 TRIGGER:** Passive suicidal ideation 2-3x/week, weight loss, isolation
- **Demo Hook:** Shows critical clinical escalation + safety protocols
- **Action:** "Comorbid Depression Detected + SI Present" (URGENT, 96% confidence)

### 5. **Jennifer Liu** (MEDIUM: Long-Term Success)

- **Status:** Active, 52F, Dysthymia
- **Progress:** PHQ-9 stable 6-8 (excellent for chronic condition)
- **Milestone:** 18-month treatment with reengagement in hobbies
- **Demo Hook:** Shows chronic condition management + maintenance therapy

### 6. **Aisha Patel** (MEDIUM: Exposure Success)

- **Status:** Active, 31F, Social Anxiety
- **Progress:** GAD-7 17→13 (significant improvement)
- **Success:** Attended networking events, holiday party, initiating conversations
- **Demo Hook:** Shows real behavioral activation + CBT success
- **Action:** "Exposure Therapy Success - Reinforce" (MEDIUM, 88% confidence)

### 7. **Robert Thompson** (MEDIUM: Panic Progress)

- **Status:** Active, 29M, Panic Disorder
- **Progress:** GAD-7 18→14 (improving with Fluoxetine + exposure)
- **Recent Win:** Completed mall exposure exercise despite anxiety
- **Demo Hook:** Shows anxiety management through behavioral change

---

## 📊 DEMO DATA STATISTICS

| Metric                 | Value                              |
| ---------------------- | ---------------------------------- |
| **Total Patients**     | 23 (7 story + 16 support)          |
| **Total Appointments** | 89 (83 historical + 6 upcoming)    |
| **Active Medications** | 23                                 |
| **Outcome Measures**   | 73 (showing treatment progression) |
| **Communications**     | 66 (SMS + email threads)           |
| **Invoices**           | 98 (6-month history)               |
| **Total Revenue**      | $20,700.00                         |
| **Collections Rate**   | 80%                                |
| **Outstanding AR**     | $783.00                            |
| **Priority Actions**   | 5 (URGENT/HIGH/MEDIUM)             |

---

## 🎬 DEMO FLOW

### POC 1: UX Transformation (7 minutes)

**Setup:** System date is Feb 6, 2026. Home page loads with substrate intelligence.

**Show:**

1. **Priority Action Card 1:** Sarah Mitchell - "Elevated A1C Levels Detected" (URGENT)
   - Shows AI connecting therapy + lab data
   - Displays suggested actions with reasoning
   - Demo "Complete All Actions" workflow

2. **Priority Action Card 2:** Marcus Johnson - "Medication Refill Due" (HIGH)
   - Shows medication management
   - Demo coordination with prescriber

3. **Priority Action Card 3:** David Rodriguez - "Comorbid Depression Detected + SI" (URGENT)
   - Shows critical safety escalation
   - Demonstrates HITL governance (AI suggests, human approves)

**Key Message:** _"Competitors make you find data. Tebra shows you decisions."_

### POC 2: AI Engineering (7 minutes)

**Setup:** Show Patient 360 for Sarah Mitchell

**Show:**

1. **Patient header** with demographics + key metrics
2. **Prioritized Actions tab** (THE KILLER FEATURE):
   - Lists all AI-surfaced actions for this patient
   - Shows urgency badges (URGENT/HIGH/MEDIUM)
   - Displays AI confidence scores (94%, 98%, etc.)
   - Expands to show reasoning + suggested actions
   - Click "Complete All" to execute workflow

3. **Other tabs** (Appointments, Medical Records, Messages, Billing)
   - Show real data for this patient
   - Demonstrate clinical context

4. **Show 6-month billing data** (ready for tomorrow's billing page)
   - Total invoiced: $20,700
   - Collections: 80%
   - Outstanding AR: $783

---

## 🔄 RESET DEMO DATA (If Demo Crashes)

If something breaks during the demo, reset in **30 seconds**:

```bash
# Option 1: Re-run SQL script
# Copy the entire supabase_demo_seed.sql script again
# Paste into Supabase SQL Editor → Run

# Option 2: Run reset script
npm run reset-demo-data

# Option 3: Manual reset
# In Supabase, run:
# DELETE FROM prioritized_actions WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';
# DELETE FROM communications WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';
# DELETE FROM invoices WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';
# DELETE FROM outcome_measures WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000');
# DELETE FROM medications WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000');
# DELETE FROM appointments WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';
# DELETE FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';
# Then run supabase_demo_seed.sql again
```

---

## 🎯 WHAT THIS DEMO PROVES

✅ **Real data patterns** (not obviously synthetic)  
✅ **Complete threading** (messages ↔ patients ↔ appointments ↔ billing)  
✅ **Substrate intelligence** (AI-surfaced priority actions, not reactive search)  
✅ **Production quality** (RLS, multi-tenant, enterprise-grade security)  
✅ **Repeatable** (git-committed, resettable in 30 seconds)  
✅ **Authentic narrative** (7 story patients showcase real clinical complexity)

---

## 📝 NOTES

- **System Date:** All data references are relative to Feb 6, 2026 (demo day)
- **Practice ID:** `550e8400-e29b-41d4-a716-446655440000`
- **All Patient IDs:** Start with `550e8400-e29b-41d4-a716-446655440001` through `550e8400-e29b-41d4-a716-446655440023`
- **RLS Enforced:** All queries automatically filter by practice_id (multi-tenant safe)
- **HIPAA Safe:** All data is fictional but clinically realistic

---

## 🚨 DEMO DAY CHECKLIST

- [ ] Load demo data into Supabase (30 seconds)
- [ ] Verify all 23 patients appear in Patients page
- [ ] Verify 5 priority actions appear on Home page
- [ ] Click on each priority action to show substrate intelligence
- [ ] Test "Complete All Actions" workflow on Marcus Johnson refill
- [ ] Show Patient 360 for Sarah Mitchell (A1C story)
- [ ] Show Patient 360 for David Rodriguez (safety escalation)
- [ ] Show Communications page with threaded messages
- [ ] Show Schedule page with Feb 6-21 appointments
- [ ] Show Billing page with 6-month history (ready for tomorrow's completion)
- [ ] Test reset procedure (if needed)

---

**Ready to WIN this hackathon? 🏆**

Load this data 10 minutes before demo day, run through the checklist, and deliver a flawless POC that shows the entire company what production-ready AI infrastructure looks like.

_Last Updated: February 4, 2026_
