# 🚀 ANTIGRAVITY CLAUDE CODE PROMPT

## MHMVP Hackathon Demo Data Loader

Copy this entire prompt into Antigravity and let Claude Code execute it autonomously.

---

## PROMPT

````
You are Claude Code, executing an automated data loading task for the MHMVP hackathon demo.

TASK: Load the complete demo dataset into Supabase with verification.

CONTEXT:
- Demo Date: Friday, February 6, 2026
- Practice: Dr. Jennifer Martinez, PsyD - Mount Lebanon, PA
- Data: 23 patients, 89 appointments, 66 messages, 98 invoices, 73 outcome measures, 40+ clinical notes, 5 priority actions
- Environment: Production Supabase instance
- Criticality: FLAWLESS - This is for a company-wide hackathon demo. Zero tolerance for errors.

EXECUTION PLAN:

### PHASE 1: PREREQUISITES (5 min)
- [ ] Get Supabase connection details (project URL, anon key, service role key)
- [ ] Test connection to Supabase
- [ ] Verify tables exist: practices, patients, appointments, medications, outcome_measures, communications, invoices, clinical_notes, visit_summaries, prioritized_actions
- [ ] Confirm demo practice ID exists or create it: '550e8400-e29b-41d4-a716-446655440000'

### PHASE 2: DATA LOAD (20 min)
Execute in this exact order (prevents foreign key issues):

1. **Practices** (if not exists)
   - Insert Dr. Jennifer Martinez practice record
   - practice_id: 550e8400-e29b-41d4-a716-446655440000
   - address: 100 Medical Plaza Drive, Suite 200, Mount Lebanon, PA 15228

2. **Patients** (23 total)
   - Load demo_patients.csv
   - All 23 patients tied to practice_id above
   - Verify: 23 patients inserted

3. **Appointments** (89 total)
   - Load demo_appointments.csv
   - Verify all appointment_dates are on or before Feb 6, 2026
   - Verify foreign key references to patient_id exist
   - Verify: 89 appointments inserted

4. **Medications** (23 total)
   - Load demo_medications.csv
   - Verify all patient_id references exist
   - Check refill_due_dates are realistic
   - Verify: 23 medications inserted

5. **Outcome Measures** (73 total)
   - Load demo_outcome_measures.csv
   - Verify measure_type in (PHQ-9, GAD-7, PCL-5)
   - Verify scores are within valid ranges
   - Verify: 73 outcome measures inserted

6. **Communications** (66 total)
   - Load demo_communications.csv
   - Verify channel in (SMS, email)
   - Verify direction in (inbound, outbound)
   - Verify: 66 communications inserted

7. **Invoices** (98 total)
   - Load demo_invoices.csv
   - Verify invoice_date range: Aug 2025 - Feb 6, 2026
   - Verify CPT codes in (90834, 90837, 90836)
   - Verify: 98 invoices inserted

8. **Clinical Notes** (40+ total)
   - Load clinical_notes.csv (provided separately)
   - Verify all patient_id references exist
   - Verify note_date matches or is within ±2 days of appointment_date
   - Verify SOAP structure is present (subjective, objective, assessment, plan)
   - Verify: All clinical notes inserted

9. **Visit Summaries** (40+ total)
   - Load visit_summaries.csv (provided separately)
   - Verify one visit_summary per clinical_note
   - Verify visit_date matches clinical_note date
   - Verify: All visit summaries inserted

10. **Prioritized Actions** (5 total)
    - Load from prioritized_actions.json
    - Verify urgency in (URGENT, HIGH, MEDIUM)
    - Verify patient_id exists
    - Verify: 5 prioritized actions inserted

### PHASE 3: VERIFICATION (10 min)
Run these queries to confirm data integrity:

```sql
-- Overall counts
SELECT
  (SELECT COUNT(*) FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as patient_count,
  (SELECT COUNT(*) FROM appointments WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as appointment_count,
  (SELECT COUNT(*) FROM medications WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as medication_count,
  (SELECT COUNT(*) FROM outcome_measures WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as outcome_count,
  (SELECT COUNT(*) FROM communications WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as communication_count,
  (SELECT COUNT(*) FROM invoices WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as invoice_count,
  (SELECT COUNT(*) FROM clinical_notes WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as clinical_note_count,
  (SELECT COUNT(*) FROM visit_summaries WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as visit_summary_count,
  (SELECT COUNT(*) FROM prioritized_actions WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as priority_action_count;
````

Expected output:

- patient_count: 23 ✅
- appointment_count: 89 ✅
- medication_count: 23 ✅
- outcome_count: 73 ✅
- communication_count: 66 ✅
- invoice_count: 98 ✅
- clinical_note_count: 40+ ✅
- visit_summary_count: 40+ ✅
- priority_action_count: 5 ✅

### PHASE 4: STORY PATIENT VERIFICATION (5 min)

Verify the 7 story patients have complete data:

```sql
-- Sarah Mitchell (Elevated A1C)
SELECT
  p.first_name, p.last_name,
  COUNT(DISTINCT a.id) as appointments,
  COUNT(DISTINCT m.id) as medications,
  COUNT(DISTINCT om.id) as outcome_measures,
  COUNT(DISTINCT c.id) as messages,
  COUNT(DISTINCT cn.id) as clinical_notes,
  COUNT(DISTINCT i.id) as invoices
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN medications m ON p.id = m.patient_id
LEFT JOIN outcome_measures om ON p.id = om.patient_id
LEFT JOIN communications c ON p.id = c.patient_id
LEFT JOIN clinical_notes cn ON p.id = cn.patient_id
LEFT JOIN invoices i ON p.id = i.patient_id
WHERE p.id = '550e8400-e29b-41d4-a716-446655440001' -- Sarah Mitchell
GROUP BY p.id, p.first_name, p.last_name;

-- Repeat for other 6 story patients:
-- Marcus: 550e8400-e29b-41d4-a716-446655440002
-- Emily: 550e8400-e29b-41d4-a716-446655440003
-- David: 550e8400-e29b-41d4-a716-446655440004
-- Jennifer: 550e8400-e29b-41d4-a716-446655440005
-- Aisha: 550e8400-e29b-41d4-a716-446655440006
-- Robert: 550e8400-e29b-41d4-a716-446655440007
```

Expected: Each story patient should have:

- ✅ 3-5 appointments
- ✅ 1 active medication
- ✅ 4-6 outcome measures (showing progression)
- ✅ 2-3 messages
- ✅ 3-4 clinical notes (showing 3-month progression)
- ✅ 4-6 invoices

### PHASE 5: CLINICAL NARRATIVE VERIFICATION (5 min)

For each story patient, verify clinical notes show progression:

```sql
SELECT
  cn.patient_id,
  cn.note_date,
  cn.appointment_type,
  SUBSTRING(cn.subjective, 1, 100) as subjective_preview,
  SUBSTRING(cn.assessment, 1, 100) as assessment_preview
FROM clinical_notes cn
WHERE cn.patient_id IN (
  '550e8400-e29b-41d4-a716-446655440001', -- Sarah
  '550e8400-e29b-41d4-a716-446655440002', -- Marcus
  '550e8400-e29b-41d4-a716-446655440003', -- Emily
  '550e8400-e29b-41d4-a716-446655440004', -- David
  '550e8400-e29b-41d4-a716-446655440005', -- Jennifer
  '550e8400-e29b-41d4-a716-446655440006', -- Aisha
  '550e8400-e29b-41d4-a716-446655440007'  -- Robert
)
ORDER BY cn.patient_id, cn.note_date;
```

Expected: Each story patient should have 3+ clinical notes spanning 3 months, showing:

- ✅ Treatment initiation (first note)
- ✅ Mid-treatment progress (second note, ~4-6 weeks in)
- ✅ Sustained improvement (third note, ~8-12 weeks in)
- ✅ Clinical reasoning and treatment response documented

### PHASE 6: DEMO DAY READINESS (5 min)

Final checklist:

- [ ] All 23 patients visible in Patients page
- [ ] All 5 priority actions visible on Home page
- [ ] Sarah Mitchell Patient 360 shows: demographics, medications, outcome progression, clinical notes, appointment history
- [ ] Marcus Johnson shows medication refill action
- [ ] David Rodriguez shows safety escalation
- [ ] Emily Chen shows new patient intake
- [ ] All 66 messages appear in Communications page with correct threading
- [ ] All 89 appointments visible in Schedule page (filter for Feb 6-21)
- [ ] All 98 invoices visible in Billing page (6-month history)
- [ ] Clinical notes are clickable and readable from Patient 360
- [ ] Visit summaries show progression narrative
- [ ] System date appears as Friday, February 6, 2026 throughout

### OUTPUT REQUIREMENTS:

At the end of execution, provide:

1. **STATUS REPORT**
   - Start time: [timestamp]
   - End time: [timestamp]
   - Total execution time: [minutes]
   - Overall status: ✅ SUCCESS or ❌ FAILED
   - If failed: detailed error log

2. **DATA SUMMARY**

   ```
   MHMVP Demo Data Load Complete
   ===================================
   Practice: Dr. Jennifer Martinez, PsyD
   System Date: Friday, February 6, 2026

   Patients:              23 ✅
   Appointments:         89 ✅
   Medications:          23 ✅
   Outcome Measures:     73 ✅
   Communications:       66 ✅
   Invoices:            98 ✅
   Clinical Notes:      40+ ✅
   Visit Summaries:     40+ ✅
   Priority Actions:     5 ✅

   Data Integrity:       100% ✅
   Ready for Demo:       YES ✅
   Estimated Demo Time: 14 minutes (POC1: 7min, POC2: 7min)
   ```

3. **STORY PATIENT DATA**
   For each of the 7 story patients, show:
   - Name, age, diagnosis, status
   - Appointments count, most recent date
   - Medications, current dosage, refill status
   - Latest outcome measure score and trend
   - Clinical note progression (dates and summaries)
   - Priority action (if applicable)

4. **TROUBLESHOOTING REFERENCE**
   If any errors occur, include:
   - Error type and location
   - Failed table/record
   - Suggested fix
   - Re-run instruction

### ERROR HANDLING:

If any phase fails:

1. **LOG THE ERROR** with table, record ID, and specific issue
2. **IDENTIFY THE BLOCKER** (foreign key? data type? missing reference?)
3. **SUGGEST A FIX** (delete conflicting record? adjust data type? check IDs?)
4. **DO NOT CONTINUE** to next phase until current phase succeeds
5. **OUTPUT DIAGNOSTICS** so Jay can manually fix if needed

### IDEMPOTENCY REQUIREMENT:

This script MUST be safe to run multiple times:

- Use "INSERT ... ON CONFLICT DO NOTHING" where applicable
- Delete and reload is okay for demo data (it's not production)
- Verify before deleting (show what will be deleted, ask confirmation)
- Option to do clean reload vs merge

### SUCCESS CRITERIA:

✅ All data loads without errors  
✅ All foreign keys valid  
✅ All 23 patients have complete profiles  
✅ All 7 story patients have clinical progression  
✅ All 5 priority actions are seeded  
✅ Data is ready for live demo  
✅ No manual fixes needed  
✅ Can reset/reload in <60 seconds if needed

---

EXECUTION START:

1. Acknowledge this prompt
2. Confirm Supabase credentials (ask if not provided)
3. Begin Phase 1
4. Report progress after each phase
5. Provide final status report at end

GO! 🚀

```

---

## HOW TO USE THIS PROMPT

1. **Copy the entire prompt above** (starting from "You are Claude Code...")
2. **Open Antigravity IDE**
3. **Create new agent or task**
4. **Paste the prompt**
5. **Provide Supabase credentials** if Claude Code asks
6. **Let it run autonomously**
7. **It will report status at each phase**
8. **You'll get a final success report**

The beauty: Claude Code will handle all the data loading, verification, and error handling. You just trigger it and watch it work.

---

```
