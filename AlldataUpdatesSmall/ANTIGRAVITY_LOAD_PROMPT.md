# ANTIGRAVITY CLAUDE CODE PROMPT: Load MHMVP Demo Data

**Use this prompt in Claude Code (via Antigravity) to auto-load all demo data**

---

## COPY EVERYTHING BELOW INTO CLAUDE CODE

```
You are an expert Supabase data engineer loading production demo data.

TASK: Load the MHMVP demo data package into Supabase for a hackathon demo.

CONTEXT:
- Supabase project: [User will provide their Supabase URL and key]
- System date: Friday, February 6, 2026
- Practice: Dr. Jennifer Martinez, PsyD - Mount Lebanon, PA
- Demo scope: 23 patients, 89 appointments, 66 messages, 98 invoices, 5 priority actions

DATA FILES (all provided):
1. demo_patients.csv - 23 patients
2. demo_appointments.csv - 89 appointments
3. demo_medications.csv - 23 prescriptions
4. demo_outcome_measures.csv - 73 outcome scores
5. demo_communications.csv - 66 messages
6. demo_invoices.csv - 98 invoices
7. prioritized_actions.json - 5 priority actions
8. clinical_notes.json - 3 months of SOAP notes (7 story patients)
9. visit_summaries.json - Visit summaries with progression tracking
10. supabase_demo_seed.sql - Complete SQL seed script (BACKUP)

EXECUTION PLAN:

STEP 1: Validate Data Integrity
- Check all CSV files are UTF-8 encoded
- Verify no missing required fields (id, practice_id, patient_id, etc.)
- Validate date formats (YYYY-MM-DD)
- Confirm foreign key relationships (patient_id in appointments matches patients.id)

STEP 2: Connect to Supabase
- Use provided SUPABASE_URL and SUPABASE_KEY
- Create Supabase client with proper authentication
- Test connection with simple query

STEP 3: Load Data in Order
Load EXACTLY in this order to maintain foreign key constraints:

A) Load Practice (if not exists):
   - ID: 550e8400-e29b-41d4-a716-446655440000
   - Name: Dr. Jennifer Martinez, PsyD
   - Location: Mount Lebanon, PA

B) Load Patients (demo_patients.csv)
   - First delete any existing patients for this practice
   - Bulk insert all 23 patients
   - Verify count = 23

C) Load Appointments (demo_appointments.csv)
   - Delete existing appointments for this practice
   - Bulk insert all 89 appointments
   - Verify count = 89

D) Load Medications (demo_medications.csv)
   - Delete existing medications
   - Bulk insert all 23 medications
   - Verify count = 23

E) Load Outcome Measures (demo_outcome_measures.csv)
   - Delete existing outcome measures
   - Bulk insert all 73 records
   - Verify count = 73

F) Load Communications (demo_communications.csv)
   - Delete existing communications
   - Bulk insert all 66 messages
   - Verify count = 66

G) Load Invoices (demo_invoices.csv)
   - Delete existing invoices
   - Bulk insert all 98 invoices
   - Verify count = 98

H) Load Clinical Notes (clinical_notes.json)
   - Parse JSON structure
   - Insert/upsert all notes
   - Link to correct appointments via date matching
   - Verify 7 story patients have 4-6 notes each

I) Load Visit Summaries (visit_summaries.json)
   - Parse JSON structure
   - Insert/upsert visit summaries
   - Link to clinical notes
   - Show progression tracking

J) Load Priority Actions (prioritized_actions.json)
   - Parse JSON structure
   - Delete existing priority actions for this practice
   - Insert 5 priority actions with JSONB formatting for suggested_actions
   - Verify count = 5

STEP 4: Comprehensive Verification
After all inserts, run these validations:

✅ Patients: Count = 23 ✓
✅ Appointments: Count = 89 ✓
✅ Medications: Count = 23 ✓
✅ Outcome Measures: Count = 73 ✓
✅ Communications: Count = 66 ✓
✅ Invoices: Count = 98 ✓
✅ Clinical Notes: Count ≥ 28 (4-6 per story patient) ✓
✅ Visit Summaries: Count ≥ 7 ✓
✅ Priority Actions: Count = 5 ✓

Verify relationships:
✅ All appointments have valid patient_id
✅ All medications have valid patient_id
✅ All communications have valid patient_id
✅ All outcome measures have valid patient_id
✅ All invoices have valid patient_id
✅ All clinical notes reference valid appointments
✅ All visit summaries reference valid clinical notes

STEP 5: Success Report
Print summary:
```

✅ MHMVP DEMO DATA LOADED SUCCESSFULLY
Practice: Dr. Jennifer Martinez, PsyD
System Date: Friday, February 6, 2026

📊 DATA COUNTS:
• Patients: 23
• Appointments: 89
• Medications: 23
• Outcome Measures: 73
• Communications: 66
• Invoices: 98
• Clinical Notes: [COUNT]
• Visit Summaries: [COUNT]
• Priority Actions: 5

✅ All relationships verified
✅ All data integrity checks passed
✅ Ready for demo!

Time to load: [DURATION]

```

ERROR HANDLING:
- If any insert fails, roll back and report which table/record failed
- If foreign key constraint fails, show which records are missing references
- If date format is wrong, show which records and expected format
- Provide clear error messages so user can fix and retry

OPTIONAL: If user provides GitHub repo, commit demo data load script to:
/scripts/load-demo-data.js (for future reference)

NICE TO HAVE:
- Print sample records from each table to show data quality
- Show appointment schedule for Feb 6-7 (demo day)
- Show priority actions with urgency badges
- Show top 3 story patients with their current status

IMPORTANT NOTES:
- Do NOT hardcode SUPABASE_KEY in code
- Use environment variables: SUPABASE_URL, SUPABASE_KEY
- All data is fictional but clinically realistic
- Data is scoped to practice_id for multi-tenant safety
- RLS policies should enforce practice isolation automatically

---

Let me know when you're ready and I'll execute this with your Supabase credentials!
```

---

## WHAT TO PROVIDE TO CLAUDE CODE

Before running this prompt, gather:

1. **Supabase URL** - From your Supabase dashboard
2. **Supabase Anon Key** - From your Supabase project settings
3. **All data files** - The CSV/JSON files from the demo package
4. **GitHub repo** (optional) - If you want the script saved to git

---

## EXPECTED OUTPUT

After execution, you'll see:

```
✅ MHMVP DEMO DATA LOADED SUCCESSFULLY
   Practice: Dr. Jennifer Martinez, PsyD
   System Date: Friday, February 6, 2026

   📊 DATA COUNTS:
   • Patients: 23
   • Appointments: 89
   • Medications: 23
   • Outcome Measures: 73
   • Communications: 66
   • Invoices: 98
   • Clinical Notes: 28+
   • Visit Summaries: 7+
   • Priority Actions: 5

   ✅ All relationships verified
   ✅ All data integrity checks passed
   ✅ Ready for demo!
```

Then you can immediately start your demo. No manual SQL needed!

---

## BACKUP OPTION

If Claude Code encounters issues, you always have the manual SQL option:

1. Open Supabase SQL Editor
2. Copy `supabase_demo_seed.sql`
3. Paste and run

But the Claude Code route is faster and more reliable.
