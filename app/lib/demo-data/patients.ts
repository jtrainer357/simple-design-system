/**
 * Centralized Demo Patient Data
 * All demo patient information for the Mental Health MVP Hackathon
 *
 * THE 4 DEMO PATIENTS:
 * 1. Michael Chen - RESULTS READY: A1C improved from 8.1% to 7.2%
 * 2. Sarah Johnson - FIRST APPT TODAY: New patient, anxiety screening needed
 * 3. Margaret Williams - URGENT REFILL: Medication expires in 3 days
 * 4. Robert Martinez - HIGH: Depression screening recommended
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type PatientStatus = "ACTIVE" | "INACTIVE" | "NEW";
export type TriggerBadge = "RESULTS READY" | "FIRST APPT TODAY" | "URGENT REFILL" | "HIGH";
export type BadgeVariant = "default" | "success" | "urgent" | "warning";
export type UrgencyLevel = "urgent" | "high" | "medium";
export type ActionIcon = "alert-triangle" | "pill" | "calendar" | "brain" | "heart" | "activity";
export type Timeframe = "Immediate" | "Within 3 days" | "This month" | "Next visit";
export type LabStatus = "normal" | "elevated" | "critical" | "improved";
export type TrendDirection = "up" | "down" | "stable";

export interface DemoPatient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  age: number;
  phone: string;
  email: string;
  mrn: string;
  insurance: {
    provider: string;
    plan: string;
    memberId: string;
  };
  conditions: string[];
  primaryCondition: string;
  status: PatientStatus;
  avatarSrc: string;
  triggerBadge: TriggerBadge;
  badgeVariant: BadgeVariant;
}

export interface LabResult {
  name: string;
  value: number | string;
  unit: string;
  previousValue?: number | string;
  trend?: TrendDirection;
  trendValue?: string;
  status: LabStatus;
  referenceRange?: string;
  date?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  daysRemaining?: number;
  expiresDate?: string;
}

export interface PrioritizedAction {
  id: string;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  timeframe: Timeframe;
  confidence: number;
  icon: ActionIcon;
  patientId: string;
  suggestedActions: string[];
}

export interface ScheduledAppointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  duration: number;
  type: string;
  room?: string;
  provider: string;
  status: "scheduled" | "checked-in" | "in-progress" | "completed";
  notes?: string;
}

export interface ActivityItem {
  id: string;
  patientId: string;
  title: string;
  description: string;
  date: string;
  type: "appointment" | "lab" | "prescription" | "message" | "note";
}

// ============================================
// DEMO PATIENTS - THE CORE 4
// ============================================

export const DEMO_PATIENTS: DemoPatient[] = [
  {
    id: "michael-chen",
    firstName: "Michael",
    lastName: "Chen",
    fullName: "Michael Chen",
    dob: "1973-11-15",
    age: 52,
    phone: "(555) 234-5678",
    email: "michael.chen@email.com",
    mrn: "45821",
    insurance: {
      provider: "Blue Cross Blue Shield",
      plan: "PPO",
      memberId: "BCB123456789",
    },
    conditions: ["Type 2 Diabetes", "Hypertension"],
    primaryCondition: "Type 2 Diabetes",
    status: "ACTIVE",
    avatarSrc: "https://randomuser.me/api/portraits/men/75.jpg",
    triggerBadge: "RESULTS READY",
    badgeVariant: "default",
  },
  {
    id: "sarah-johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    dob: "1992-08-22",
    age: 33,
    phone: "(555) 876-5432",
    email: "sarah.johnson@email.com",
    mrn: "45822",
    insurance: {
      provider: "Aetna",
      plan: "HMO",
      memberId: "AET987654321",
    },
    conditions: ["Anxiety Disorder", "Insomnia"],
    primaryCondition: "New Patient",
    status: "NEW",
    avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
    triggerBadge: "FIRST APPT TODAY",
    badgeVariant: "success",
  },
  {
    id: "margaret-williams",
    firstName: "Margaret",
    lastName: "Williams",
    fullName: "Margaret Williams",
    dob: "1955-11-08",
    age: 70,
    phone: "(555) 345-6789",
    email: "margaret.williams@email.com",
    mrn: "45823",
    insurance: {
      provider: "Medicare",
      plan: "Part B",
      memberId: "1EG4-TE5-MK72",
    },
    conditions: ["Hypertension", "Type 2 Diabetes", "Chronic Pain"],
    primaryCondition: "Hypertension",
    status: "ACTIVE",
    avatarSrc: "https://randomuser.me/api/portraits/women/68.jpg",
    triggerBadge: "URGENT REFILL",
    badgeVariant: "urgent",
  },
  {
    id: "robert-martinez",
    firstName: "Robert",
    lastName: "Martinez",
    fullName: "Robert Martinez",
    dob: "1978-05-20",
    age: 47,
    phone: "(555) 456-7890",
    email: "robert.martinez@email.com",
    mrn: "45824",
    insurance: {
      provider: "United Healthcare",
      plan: "PPO",
      memberId: "UHC456789123",
    },
    conditions: ["Major Depressive Disorder", "Generalized Anxiety"],
    primaryCondition: "Major Depressive Disorder",
    status: "ACTIVE",
    avatarSrc: "https://randomuser.me/api/portraits/men/45.jpg",
    triggerBadge: "HIGH",
    badgeVariant: "warning",
  },
];

// ============================================
// DEMO LAB RESULTS - MICHAEL CHEN
// ============================================

export const DEMO_LAB_RESULTS: Record<string, LabResult[]> = {
  "michael-chen": [
    {
      name: "Hemoglobin A1C",
      value: 7.2,
      unit: "%",
      previousValue: 8.1,
      trend: "down",
      trendValue: "0.9% improvement",
      status: "improved",
      referenceRange: "< 7.0%",
      date: "2026-02-03",
    },
    {
      name: "Fasting Glucose",
      value: 124,
      unit: "mg/dL",
      status: "normal",
      referenceRange: "70-130 mg/dL",
      date: "2026-02-03",
    },
    {
      name: "Blood Pressure",
      value: "128/82",
      unit: "mmHg",
      status: "normal",
      referenceRange: "< 130/80",
      date: "2026-02-03",
    },
    {
      name: "LDL Cholesterol",
      value: 98,
      unit: "mg/dL",
      status: "normal",
      referenceRange: "< 100 mg/dL",
      date: "2026-02-03",
    },
  ],
  "sarah-johnson": [],
  "margaret-williams": [
    {
      name: "Blood Pressure",
      value: "142/88",
      unit: "mmHg",
      previousValue: "138/85",
      trend: "up",
      status: "elevated",
      referenceRange: "< 130/80",
      date: "2026-01-28",
    },
    {
      name: "Fasting Glucose",
      value: 156,
      unit: "mg/dL",
      status: "elevated",
      referenceRange: "70-130 mg/dL",
      date: "2026-01-28",
    },
  ],
  "robert-martinez": [
    {
      name: "PHQ-9 Score",
      value: 14,
      unit: "points",
      previousValue: 12,
      trend: "up",
      status: "elevated",
      referenceRange: "0-4 (minimal)",
      date: "2026-01-15",
    },
    {
      name: "GAD-7 Score",
      value: 11,
      unit: "points",
      status: "elevated",
      referenceRange: "0-4 (minimal)",
      date: "2026-01-15",
    },
  ],
};

// ============================================
// DEMO MEDICATIONS
// ============================================

export const DEMO_MEDICATIONS: Record<string, Medication[]> = {
  "michael-chen": [
    { name: "Metformin", dosage: "1000mg", frequency: "twice daily" },
    { name: "Lisinopril", dosage: "10mg", frequency: "daily" },
  ],
  "sarah-johnson": [],
  "margaret-williams": [
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "twice daily",
      daysRemaining: 3,
      expiresDate: "2026-02-07",
    },
    { name: "Lisinopril", dosage: "20mg", frequency: "daily", daysRemaining: 15 },
    { name: "Aspirin", dosage: "81mg", frequency: "daily", daysRemaining: 30 },
  ],
  "robert-martinez": [
    { name: "Sertraline", dosage: "100mg", frequency: "daily" },
    { name: "Trazodone", dosage: "50mg", frequency: "at bedtime as needed" },
  ],
};

// ============================================
// DEMO PRIORITIZED ACTIONS
// ============================================

export const DEMO_ACTIONS: Record<string, PrioritizedAction[]> = {
  "michael-chen": [
    {
      id: "mc-1",
      title: "A1C Results: Celebrate Improvement!",
      description:
        "A1C improved from 8.1% to 7.2% - excellent progress! Send congratulatory message and reinforce positive behaviors.",
      urgency: "medium",
      timeframe: "Immediate",
      confidence: 98,
      icon: "heart",
      patientId: "michael-chen",
      suggestedActions: [
        "Send congratulatory message to patient",
        "Document progress in care plan",
        "Reinforce current medication adherence",
      ],
    },
    {
      id: "mc-2",
      title: "Schedule 3-Month Follow-up",
      description: "Order follow-up A1C test in 3 months to monitor continued progress.",
      urgency: "medium",
      timeframe: "This month",
      confidence: 95,
      icon: "calendar",
      patientId: "michael-chen",
      suggestedActions: [
        "Order 3-month A1C follow-up",
        "Schedule appointment for results review",
        "Set reminder for lab order",
      ],
    },
    {
      id: "mc-3",
      title: "Continue Current Medications",
      description:
        "Current regimen is working well. Maintain Metformin 1000mg and Lisinopril 10mg.",
      urgency: "medium",
      timeframe: "Next visit",
      confidence: 92,
      icon: "pill",
      patientId: "michael-chen",
      suggestedActions: [
        "Verify medication refills are current",
        "Confirm pharmacy on file",
        "Check for any side effects at visit",
      ],
    },
  ],
  "sarah-johnson": [
    {
      id: "sj-1",
      title: "Complete New Patient Intake",
      description:
        "First appointment today at 9:00 AM. Complete comprehensive intake and medical history.",
      urgency: "high",
      timeframe: "Immediate",
      confidence: 100,
      icon: "calendar",
      patientId: "sarah-johnson",
      suggestedActions: [
        "Review intake paperwork",
        "Verify insurance authorization",
        "Prepare new patient forms",
      ],
    },
    {
      id: "sj-2",
      title: "Anxiety Screening Required",
      description: "Administer GAD-7 and PHQ-9 screenings for baseline mental health assessment.",
      urgency: "high",
      timeframe: "Immediate",
      confidence: 95,
      icon: "brain",
      patientId: "sarah-johnson",
      suggestedActions: [
        "Administer GAD-7 screening",
        "Administer PHQ-9 screening",
        "Document baseline scores",
      ],
    },
    {
      id: "sj-3",
      title: "Care Gap: Preventive Screenings",
      description:
        "Patient missing routine preventive care screenings. Review and order as needed.",
      urgency: "medium",
      timeframe: "This month",
      confidence: 87,
      icon: "activity",
      patientId: "sarah-johnson",
      suggestedActions: [
        "Review immunization history",
        "Check preventive screening status",
        "Order appropriate screenings",
      ],
    },
    {
      id: "sj-4",
      title: "Review Recent Message",
      description:
        "Patient sent message via portal regarding appointment concerns. Review and address.",
      urgency: "medium",
      timeframe: "Immediate",
      confidence: 90,
      icon: "alert-triangle",
      patientId: "sarah-johnson",
      suggestedActions: [
        "Review portal message",
        "Prepare to discuss concerns at visit",
        "Document communication",
      ],
    },
  ],
  "margaret-williams": [
    {
      id: "mw-1",
      title: "URGENT: Metformin Refill Required",
      description:
        "Metformin 500mg expires in 3 days. Patient has limited supply remaining. Immediate refill needed.",
      urgency: "urgent",
      timeframe: "Immediate",
      confidence: 99,
      icon: "pill",
      patientId: "margaret-williams",
      suggestedActions: [
        "Approve prescription refill",
        "Verify pharmacy on file",
        "Check for drug interactions",
      ],
    },
    {
      id: "mw-2",
      title: "Medication Review Scheduled",
      description:
        "Appointment today at 2:00 PM for comprehensive medication review. Review all current meds.",
      urgency: "high",
      timeframe: "Immediate",
      confidence: 100,
      icon: "calendar",
      patientId: "margaret-williams",
      suggestedActions: [
        "Review medication list",
        "Check for polypharmacy concerns",
        "Prepare medication reconciliation",
      ],
    },
    {
      id: "mw-3",
      title: "Blood Pressure Trending Up",
      description:
        "Recent BP reading 142/88 mmHg, increased from previous. Consider medication adjustment.",
      urgency: "high",
      timeframe: "Within 3 days",
      confidence: 88,
      icon: "alert-triangle",
      patientId: "margaret-williams",
      suggestedActions: [
        "Review BP trend",
        "Consider Lisinopril dose adjustment",
        "Order BMP to check kidney function",
      ],
    },
  ],
  "robert-martinez": [
    {
      id: "rm-1",
      title: "Depression Screening Recommended",
      description:
        "PHQ-9 score elevated at 14 (moderate depression). Follow-up assessment and treatment review needed.",
      urgency: "high",
      timeframe: "Immediate",
      confidence: 94,
      icon: "brain",
      patientId: "robert-martinez",
      suggestedActions: [
        "Administer updated PHQ-9",
        "Review current treatment efficacy",
        "Consider medication adjustment",
      ],
    },
    {
      id: "rm-2",
      title: "Psychotherapy Session Today",
      description:
        "Scheduled for 4:00 PM psychotherapy session. Review progress and treatment goals.",
      urgency: "high",
      timeframe: "Immediate",
      confidence: 100,
      icon: "calendar",
      patientId: "robert-martinez",
      suggestedActions: [
        "Review session notes from last visit",
        "Prepare discussion topics",
        "Document session outcomes",
      ],
    },
    {
      id: "rm-3",
      title: "Consider Medication Adjustment",
      description:
        "Current Sertraline 100mg may need adjustment based on symptom response. Discuss with patient.",
      urgency: "medium",
      timeframe: "Next visit",
      confidence: 82,
      icon: "pill",
      patientId: "robert-martinez",
      suggestedActions: [
        "Discuss medication effectiveness",
        "Consider dose increase or augmentation",
        "Review side effects",
      ],
    },
    {
      id: "rm-4",
      title: "Anxiety Co-morbidity Assessment",
      description: "GAD-7 score at 11 indicates moderate anxiety. Assess treatment approach.",
      urgency: "medium",
      timeframe: "This month",
      confidence: 85,
      icon: "brain",
      patientId: "robert-martinez",
      suggestedActions: [
        "Review anxiety symptoms",
        "Consider CBT referral",
        "Discuss coping strategies",
      ],
    },
  ],
};

// ============================================
// TODAY'S SCHEDULE
// ============================================

export const DEMO_SCHEDULE: ScheduledAppointment[] = [
  {
    id: "apt-today-1",
    patientId: "sarah-johnson",
    patientName: "Sarah Johnson",
    time: "9:00 AM",
    duration: 60,
    type: "New Patient",
    room: "Room 101",
    provider: "Dr. Sarah Chen",
    status: "scheduled",
    notes: "Initial consultation, complete intake forms, anxiety screening",
  },
  {
    id: "apt-today-2",
    patientId: "michael-chen",
    patientName: "Michael Chen",
    time: "10:30 AM",
    duration: 30,
    type: "Follow-up",
    room: "Room 102",
    provider: "Dr. Sarah Chen",
    status: "scheduled",
    notes: "Review A1C results, celebrate improvement, discuss ongoing diabetes management",
  },
  {
    id: "apt-today-3",
    patientId: "margaret-williams",
    patientName: "Margaret Williams",
    time: "2:00 PM",
    duration: 45,
    type: "Med Review",
    room: "Room 101",
    provider: "Dr. Sarah Chen",
    status: "scheduled",
    notes: "Comprehensive medication review, address urgent Metformin refill",
  },
  {
    id: "apt-today-4",
    patientId: "robert-martinez",
    patientName: "Robert Martinez",
    time: "4:00 PM",
    duration: 60,
    type: "Psychotherapy",
    room: "Room 103",
    provider: "Dr. Sarah Chen",
    status: "scheduled",
    notes: "Weekly psychotherapy session, depression screening recommended",
  },
];

// ============================================
// DEMO ACTIVITIES BY PATIENT
// ============================================

export const DEMO_ACTIVITIES: Record<string, ActivityItem[]> = {
  "michael-chen": [
    {
      id: "mc-act-1",
      patientId: "michael-chen",
      title: "Lab Results Received",
      description:
        "A1C results: 7.2% (improved from 8.1%). Fasting glucose: 124 mg/dL within target.",
      date: "Feb 3, 2026",
      type: "lab",
    },
    {
      id: "mc-act-2",
      patientId: "michael-chen",
      title: "Prescription Refill",
      description: "Metformin 1000mg - 90 day supply sent to CVS Pharmacy",
      date: "Jan 25, 2026",
      type: "prescription",
    },
    {
      id: "mc-act-3",
      patientId: "michael-chen",
      title: "Follow-up Visit",
      description: "Routine diabetes management check. Patient reports improved diet compliance.",
      date: "Jan 15, 2026",
      type: "appointment",
    },
    {
      id: "mc-act-4",
      patientId: "michael-chen",
      title: "Portal Message",
      description: "Patient confirmed blood sugar readings stable this week.",
      date: "Jan 10, 2026",
      type: "message",
    },
  ],
  "sarah-johnson": [
    {
      id: "sj-act-1",
      patientId: "sarah-johnson",
      title: "New Patient Registration",
      description: "Completed online registration and intake paperwork via patient portal.",
      date: "Feb 2, 2026",
      type: "note",
    },
    {
      id: "sj-act-2",
      patientId: "sarah-johnson",
      title: "Insurance Verification",
      description: "Aetna HMO coverage verified. Referral not required for initial visit.",
      date: "Feb 2, 2026",
      type: "note",
    },
    {
      id: "sj-act-3",
      patientId: "sarah-johnson",
      title: "Portal Message",
      description: "Patient inquired about appointment parking and check-in process.",
      date: "Feb 3, 2026",
      type: "message",
    },
  ],
  "margaret-williams": [
    {
      id: "mw-act-1",
      patientId: "margaret-williams",
      title: "Refill Request",
      description: "Metformin 500mg refill requested via patient portal. 3 days supply remaining.",
      date: "Feb 4, 2026",
      type: "prescription",
    },
    {
      id: "mw-act-2",
      patientId: "margaret-williams",
      title: "BP Monitoring",
      description: "Blood pressure: 142/88 mmHg - elevated from previous reading of 138/85.",
      date: "Jan 30, 2026",
      type: "lab",
    },
    {
      id: "mw-act-3",
      patientId: "margaret-williams",
      title: "Follow-up Visit",
      description: "Discussed medication compliance. Patient reports occasional dizziness.",
      date: "Jan 28, 2026",
      type: "appointment",
    },
    {
      id: "mw-act-4",
      patientId: "margaret-williams",
      title: "Cardiology Referral",
      description: "Referral sent to Dr. Martinez for echocardiogram evaluation.",
      date: "Jan 25, 2026",
      type: "note",
    },
  ],
  "robert-martinez": [
    {
      id: "rm-act-1",
      patientId: "robert-martinez",
      title: "Psychotherapy Session",
      description: "60-min session. Discussed workplace stress and sleep difficulties.",
      date: "Jan 28, 2026",
      type: "appointment",
    },
    {
      id: "rm-act-2",
      patientId: "robert-martinez",
      title: "PHQ-9 Assessment",
      description: "PHQ-9 score: 14 (moderate depression). Increased from 12 at previous visit.",
      date: "Jan 15, 2026",
      type: "lab",
    },
    {
      id: "rm-act-3",
      patientId: "robert-martinez",
      title: "Medication Review",
      description:
        "Discussed Sertraline effectiveness. Patient reports some improvement but still struggling.",
      date: "Jan 15, 2026",
      type: "prescription",
    },
    {
      id: "rm-act-4",
      patientId: "robert-martinez",
      title: "Care Coordinator Note",
      description: "Patient enrolled in weekly check-in program for additional support.",
      date: "Jan 10, 2026",
      type: "note",
    },
  ],
};

// ============================================
// ORCHESTRATION CONTEXTS
// ============================================

export interface OrchestrationContext {
  patient: {
    id: string;
    name: string;
    mrn: string;
    dob: string;
    age: number;
    primaryDiagnosis: string;
    avatar: string;
  };
  trigger: {
    type: "lab_result" | "refill" | "screening" | "appointment";
    title: string;
    urgency: "urgent" | "high" | "medium";
  };
  clinicalData: {
    labResults?: Array<{
      name: string;
      value: string;
      unit: string;
      trend?: "up" | "down" | "stable";
      trendValue?: string;
      status: "normal" | "elevated" | "critical";
    }>;
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
  };
  suggestedActions: Array<{
    id: string;
    label: string;
    type: "message" | "order" | "medication" | "task" | "document";
    checked: boolean;
  }>;
}

export const DEMO_ORCHESTRATION_CONTEXTS: Record<string, OrchestrationContext> = {
  "michael-chen": {
    patient: {
      id: "michael-chen",
      name: "Michael Chen",
      mrn: "45821",
      dob: "11/15/1973",
      age: 52,
      primaryDiagnosis: "Type 2 Diabetes",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    trigger: {
      type: "lab_result",
      title: "A1C Results: Excellent Improvement!",
      urgency: "medium",
    },
    clinicalData: {
      labResults: [
        {
          name: "Hemoglobin A1C",
          value: "7.2",
          unit: "%",
          trend: "down",
          trendValue: "0.9% improvement from 8.1%",
          status: "elevated",
        },
        {
          name: "Fasting Glucose",
          value: "124",
          unit: "mg/dL",
          status: "normal",
        },
      ],
      medications: [
        { name: "Metformin", dosage: "1000mg", frequency: "twice daily" },
        { name: "Lisinopril", dosage: "10mg", frequency: "daily" },
      ],
    },
    suggestedActions: [
      {
        id: "1",
        label: "Send congratulatory message to patient",
        type: "message",
        checked: true,
      },
      {
        id: "2",
        label: "Order 3-month A1C follow-up",
        type: "order",
        checked: true,
      },
      {
        id: "3",
        label: "Continue current medications",
        type: "medication",
        checked: true,
      },
    ],
  },
  "sarah-johnson": {
    patient: {
      id: "sarah-johnson",
      name: "Sarah Johnson",
      mrn: "45822",
      dob: "08/22/1992",
      age: 33,
      primaryDiagnosis: "New Patient - Anxiety",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    trigger: {
      type: "appointment",
      title: "First Appointment Today - 9:00 AM",
      urgency: "high",
    },
    clinicalData: {
      labResults: [],
      medications: [],
    },
    suggestedActions: [
      {
        id: "1",
        label: "Complete new patient intake",
        type: "document",
        checked: true,
      },
      {
        id: "2",
        label: "Administer GAD-7 anxiety screening",
        type: "task",
        checked: true,
      },
      {
        id: "3",
        label: "Administer PHQ-9 depression screening",
        type: "task",
        checked: true,
      },
      {
        id: "4",
        label: "Review and address patient portal message",
        type: "message",
        checked: false,
      },
    ],
  },
  "margaret-williams": {
    patient: {
      id: "margaret-williams",
      name: "Margaret Williams",
      mrn: "45823",
      dob: "11/08/1955",
      age: 70,
      primaryDiagnosis: "Hypertension",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    trigger: {
      type: "refill",
      title: "URGENT: Metformin Expires in 3 Days",
      urgency: "urgent",
    },
    clinicalData: {
      labResults: [
        {
          name: "Blood Pressure",
          value: "142/88",
          unit: "mmHg",
          trend: "up",
          status: "elevated",
        },
        {
          name: "Fasting Glucose",
          value: "156",
          unit: "mg/dL",
          status: "elevated",
        },
      ],
      medications: [
        { name: "Metformin", dosage: "500mg", frequency: "twice daily" },
        { name: "Lisinopril", dosage: "20mg", frequency: "daily" },
        { name: "Aspirin", dosage: "81mg", frequency: "daily" },
      ],
    },
    suggestedActions: [
      {
        id: "1",
        label: "Approve Metformin 500mg refill (90-day supply)",
        type: "medication",
        checked: true,
      },
      {
        id: "2",
        label: "Review blood pressure medication dosage",
        type: "medication",
        checked: false,
      },
      {
        id: "3",
        label: "Order BMP to check kidney function",
        type: "order",
        checked: false,
      },
    ],
  },
  "robert-martinez": {
    patient: {
      id: "robert-martinez",
      name: "Robert Martinez",
      mrn: "45824",
      dob: "05/20/1978",
      age: 47,
      primaryDiagnosis: "Major Depressive Disorder",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    trigger: {
      type: "screening",
      title: "Depression Screening Recommended",
      urgency: "high",
    },
    clinicalData: {
      labResults: [
        {
          name: "PHQ-9 Score",
          value: "14",
          unit: "points",
          trend: "up",
          trendValue: "increased from 12",
          status: "elevated",
        },
        {
          name: "GAD-7 Score",
          value: "11",
          unit: "points",
          status: "elevated",
        },
      ],
      medications: [
        { name: "Sertraline", dosage: "100mg", frequency: "daily" },
        { name: "Trazodone", dosage: "50mg", frequency: "at bedtime as needed" },
      ],
    },
    suggestedActions: [
      {
        id: "1",
        label: "Administer updated PHQ-9 screening",
        type: "task",
        checked: true,
      },
      {
        id: "2",
        label: "Review Sertraline effectiveness",
        type: "medication",
        checked: true,
      },
      {
        id: "3",
        label: "Consider CBT referral",
        type: "order",
        checked: false,
      },
      {
        id: "4",
        label: "Document session outcomes",
        type: "document",
        checked: false,
      },
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPatientById(id: string): DemoPatient | undefined {
  return DEMO_PATIENTS.find((p) => p.id === id);
}

export function getPatientByName(name: string): DemoPatient | undefined {
  return DEMO_PATIENTS.find((p) => p.fullName.toLowerCase() === name.toLowerCase());
}

export function getLabResultsForPatient(patientId: string): LabResult[] {
  return DEMO_LAB_RESULTS[patientId] || [];
}

export function getMedicationsForPatient(patientId: string): Medication[] {
  return DEMO_MEDICATIONS[patientId] || [];
}

export function getActionsForPatient(patientId: string): PrioritizedAction[] {
  return DEMO_ACTIONS[patientId] || [];
}

export function getActivitiesForPatient(patientId: string): ActivityItem[] {
  return DEMO_ACTIVITIES[patientId] || [];
}

export function getOrchestrationContext(patientId: string): OrchestrationContext | undefined {
  return DEMO_ORCHESTRATION_CONTEXTS[patientId];
}

export function getTodaysSchedule(): ScheduledAppointment[] {
  return DEMO_SCHEDULE;
}

export function getScheduleByPatientId(patientId: string): ScheduledAppointment | undefined {
  return DEMO_SCHEDULE.find((apt) => apt.patientId === patientId);
}

// ============================================
// QUICK ACCESS CONSTANTS
// ============================================

export const MICHAEL_CHEN = DEMO_PATIENTS[0]!;
export const SARAH_JOHNSON = DEMO_PATIENTS[1]!;
export const MARGARET_WILLIAMS = DEMO_PATIENTS[2]!;
export const ROBERT_MARTINEZ = DEMO_PATIENTS[3]!;

export const MICHAEL_CHEN_CONTEXT = DEMO_ORCHESTRATION_CONTEXTS["michael-chen"]!;
export const SARAH_JOHNSON_CONTEXT = DEMO_ORCHESTRATION_CONTEXTS["sarah-johnson"]!;
export const MARGARET_WILLIAMS_CONTEXT = DEMO_ORCHESTRATION_CONTEXTS["margaret-williams"]!;
export const ROBERT_MARTINEZ_CONTEXT = DEMO_ORCHESTRATION_CONTEXTS["robert-martinez"]!;
