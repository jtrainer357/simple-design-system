# 🚀 ANTIGRAVITY AUTOMATION QUICKSTART

## Load MHMVP Demo Data in 5 Minutes

---

## STEP 1: Gather Your Supabase Credentials (2 minutes)

Go to **Supabase Dashboard** → Your Project:

1. **Get your Project URL:**
   - Click Settings (gear icon)
   - Click "API"
   - Copy "Project URL" (looks like: `https://xxxxx.supabase.co`)

2. **Get your Anon Key:**
   - Same page, copy "anon public" key (long string starting with `eyJ...`)

3. **Optional: Get Service Role Key (for faster inserts)**
   - Same location, copy "service_role secret" (even longer string)

**You need:**

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_KEY = eyJ...xxxxx
```

---

## STEP 2: Open Antigravity (1 minute)

1. Go to **Antigravity IDE**
2. Create new **Agent** or **Claude Code session**
3. Have the prompt ready to paste

---

## STEP 3: Copy the Prompt (30 seconds)

Open: **ANTIGRAVITY_LOAD_PROMPT.md**

Copy EVERYTHING from "You are an expert Supabase data engineer..."
through to the end (the whole code block).

---

## STEP 4: Paste into Claude Code (1 minute)

1. In Antigravity, click **Claude Code**
2. Paste the entire prompt
3. When it says "Let me know when you're ready," respond with:

```
I'm ready. Here are my credentials:

SUPABASE_URL: https://[your-project].supabase.co
SUPABASE_ANON_KEY: [your-anon-key]

All data files are in ./outputs/
Please load everything and verify.
```

---

## STEP 5: Watch It Work (3-5 minutes)

Claude Code will:

1. ✅ Validate all data files
2. ✅ Connect to Supabase
3. ✅ Load data in correct order (practice → patients → appointments → etc.)
4. ✅ Verify all records (23 patients, 89 appointments, etc.)
5. ✅ Report success with record counts

You'll see output like:

```
✅ MHMVP DEMO DATA LOADED SUCCESSFULLY
   Practice: Dr. Jennifer Martinez, PsyD
   System Date: Friday, February 6, 2026

   📊 DATA COUNTS:
   • Patients: 23 ✓
   • Appointments: 89 ✓
   • Medications: 23 ✓
   • Outcome Measures: 73 ✓
   • Communications: 66 ✓
   • Invoices: 98 ✓
   • Clinical Notes: 21 ✓
   • Priority Actions: 5 ✓

   ✅ All relationships verified
   ✅ Ready for demo!
```

---

## STEP 6: Verify in Your App (2 minutes)

1. Go to your MHMVP app
2. Navigate to **Patients** page
3. You should see **23 patients** listed ✓
4. Click on **Sarah Mitchell**
5. You should see her demographics, medications, appointments ✓
6. (Optional) Click on her to verify she has data

---

## 🎯 That's It!

You're done. Demo data is loaded.

Now you can:

- Show home page with 5 priority actions
- Click through patient 360s
- Show clinical notes progression
- Demo the "Complete All Actions" workflow

---

## ⚠️ If Something Goes Wrong

**"Claude Code won't run"**
→ Make sure you provided Supabase credentials in your response

**"Data load failed - foreign key error"**
→ Old data in Supabase? Claude Code will ask to delete first. Say yes.

**"Files not found"**
→ Make sure all demo CSV files are in the same directory as ANTIGRAVITY_LOAD_PROMPT.md

**"Connection refused"**
→ Check your SUPABASE_URL is correct (should start with `https://`)

**Worst case:** Use manual SQL backup
→ Open Supabase SQL Editor
→ Copy `supabase_demo_seed.sql`
→ Paste & run (30 seconds)

---

## ✅ Pre-Demo Verification Checklist

After data loads, verify these work:

- [ ] Navigate to Patients page
- [ ] See all 23 patients listed
- [ ] Click Sarah Mitchell → see Patient 360
- [ ] Click Marcus Johnson → see his data
- [ ] Click David Rodriguez → see his data
- [ ] Home page shows 5 priority actions
- [ ] Schedule page shows appointments
- [ ] Communications page shows messages

If all check ✓, you're ready for the demo!

---

## 🎬 Next: Run Your Demo

Once data loads, follow **CLINICAL_NOTES_SUMMARY.txt** for:

- What to click
- What to say
- When to pause for effect
- How to explain substrate intelligence

---

## 📞 Need Help During Load?

If Claude Code gets stuck:

1. Share the exact error message
2. Ask it to retry with more verbose logging
3. Or fall back to manual SQL

But this should work smoothly. The prompt is bulletproof. ✓

---

**Ready? Go to Antigravity and paste the prompt!** 🚀
