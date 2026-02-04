/**
 * Demo Data Seed File
 * Contains sample patient data for the Tebra Mental Health MVP
 */

export interface DemoPatient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  age: number;
  phone: string;
  email: string;
  insurance: {
    provider: string;
    plan: string;
    memberId: string;
  };
  primaryCondition: string;
  status: "ACTIVE" | "INACTIVE" | "NEW";
  avatarSrc?: string;
}

export interface DemoAppointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: "Follow-up" | "New Patient" | "Wellness" | "Telehealth" | "Lab Review" | "Consultation";
  provider: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "No Show";
  notes?: string;
}

export interface DemoMessage {
  id: string;
  patientId: string;
  patientName: string;
  channel: "sms" | "email" | "phone" | "portal";
  direction: "inbound" | "outbound";
  content: string;
  timestamp: string;
  read: boolean;
}

export interface DemoActivity {
  id: string;
  patientId: string;
  title: string;
  description: string;
  date: string;
  type: "appointment" | "message" | "lab" | "prescription" | "note";
}

// ============================================
// DEMO PATIENTS
// ============================================

export const demoPatients: DemoPatient[] = [
  {
    id: "patient-1",
    firstName: "Michael",
    lastName: "Chen",
    fullName: "Michael Chen",
    dob: "1967-03-15",
    age: 58,
    phone: "(555) 234-5678",
    email: "michael.chen@email.com",
    insurance: {
      provider: "Blue Cross",
      plan: "PPO",
      memberId: "BCB123456789",
    },
    primaryCondition: "Type 2 Diabetes",
    status: "ACTIVE",
    avatarSrc: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    id: "patient-2",
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    dob: "1992-08-22",
    age: 33,
    phone: "(555) 876-5432",
    email: "sarah.johnson@email.com",
    insurance: {
      provider: "Aetna",
      plan: "HMO",
      memberId: "AET987654321",
    },
    primaryCondition: "New Patient",
    status: "NEW",
    avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "patient-3",
    firstName: "Margaret",
    lastName: "Williams",
    fullName: "Margaret Williams",
    dob: "1955-11-08",
    age: 70,
    phone: "(555) 345-6789",
    email: "margaret.williams@email.com",
    insurance: {
      provider: "Medicare",
      plan: "Part B",
      memberId: "1EG4-TE5-MK72",
    },
    primaryCondition: "Hypertension",
    status: "ACTIVE",
    avatarSrc: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

// ============================================
// DEMO APPOINTMENTS
// ============================================

export const demoAppointments: DemoAppointment[] = [
  // Michael Chen appointments
  {
    id: "apt-1",
    patientId: "patient-1",
    patientName: "Michael Chen",
    date: "2026-02-10",
    time: "08:00",
    duration: 30,
    type: "Follow-up",
    provider: "Dr. Sarah Chen",
    status: "Scheduled",
    notes: "Diabetes management follow-up, review A1C levels",
  },
  {
    id: "apt-2",
    patientId: "patient-1",
    patientName: "Michael Chen",
    date: "2026-02-12",
    time: "14:00",
    duration: 45,
    type: "Consultation",
    provider: "Dr. Sarah Chen",
    status: "Scheduled",
    notes: "Nutrition counseling session",
  },
  {
    id: "apt-3",
    patientId: "patient-1",
    patientName: "Michael Chen",
    date: "2026-01-28",
    time: "09:00",
    duration: 30,
    type: "Lab Review",
    provider: "Dr. Sarah Chen",
    status: "Completed",
    notes: "Reviewed quarterly labs, A1C at 6.8%",
  },

  // Sarah Johnson appointments
  {
    id: "apt-4",
    patientId: "patient-2",
    patientName: "Sarah Johnson",
    date: "2026-02-10",
    time: "09:00",
    duration: 60,
    type: "New Patient",
    provider: "Dr. Sarah Chen",
    status: "Scheduled",
    notes: "Initial consultation and health assessment",
  },
  {
    id: "apt-5",
    patientId: "patient-2",
    patientName: "Sarah Johnson",
    date: "2026-02-14",
    time: "15:30",
    duration: 60,
    type: "Wellness",
    provider: "Dr. Sarah Chen",
    status: "Scheduled",
    notes: "Comprehensive wellness examination",
  },

  // Margaret Williams appointments
  {
    id: "apt-6",
    patientId: "patient-3",
    patientName: "Margaret Williams",
    date: "2026-02-10",
    time: "10:30",
    duration: 30,
    type: "Follow-up",
    provider: "Dr. Sarah Chen",
    status: "Scheduled",
    notes: "Blood pressure monitoring and medication review",
  },
  {
    id: "apt-7",
    patientId: "patient-3",
    patientName: "Margaret Williams",
    date: "2026-02-11",
    time: "13:00",
    duration: 60,
    type: "Consultation",
    provider: "Dr. Sarah Chen",
    status: "Scheduled",
    notes: "Cardiology referral discussion",
  },
  {
    id: "apt-8",
    patientId: "patient-3",
    patientName: "Margaret Williams",
    date: "2026-01-30",
    time: "14:00",
    duration: 30,
    type: "Follow-up",
    provider: "Dr. Sarah Chen",
    status: "Completed",
    notes: "BP stable at 128/82, continue current medication",
  },
];

// ============================================
// DEMO MESSAGES
// ============================================

export const demoMessages: DemoMessage[] = [
  // Michael Chen messages
  {
    id: "msg-1",
    patientId: "patient-1",
    patientName: "Michael Chen",
    channel: "sms",
    direction: "inbound",
    content: "Thank you for the prescription refill reminder. I picked it up today.",
    timestamp: "2026-02-04T10:30:00Z",
    read: false,
  },
  {
    id: "msg-2",
    patientId: "patient-1",
    patientName: "Michael Chen",
    channel: "portal",
    direction: "inbound",
    content: "My blood sugar readings have been stable this week. Fasting glucose averaging 118.",
    timestamp: "2026-02-03T14:15:00Z",
    read: true,
  },
  {
    id: "msg-3",
    patientId: "patient-1",
    patientName: "Michael Chen",
    channel: "sms",
    direction: "outbound",
    content: "Great news! Keep up the good work. See you at your next appointment.",
    timestamp: "2026-02-03T15:00:00Z",
    read: true,
  },

  // Sarah Johnson messages
  {
    id: "msg-4",
    patientId: "patient-2",
    patientName: "Sarah Johnson",
    channel: "email",
    direction: "inbound",
    content: "Can I reschedule my appointment to next week? Something came up at work.",
    timestamp: "2026-02-04T09:45:00Z",
    read: false,
  },
  {
    id: "msg-5",
    patientId: "patient-2",
    patientName: "Sarah Johnson",
    channel: "email",
    direction: "outbound",
    content:
      "Of course! I have availability on Wednesday at 2:30 PM or Thursday at 10:00 AM. Would either work?",
    timestamp: "2026-02-04T11:00:00Z",
    read: true,
  },
  {
    id: "msg-6",
    patientId: "patient-2",
    patientName: "Sarah Johnson",
    channel: "email",
    direction: "inbound",
    content: "Thursday at 10 AM would be perfect! Thank you so much.",
    timestamp: "2026-02-04T11:15:00Z",
    read: true,
  },

  // Margaret Williams messages
  {
    id: "msg-7",
    patientId: "patient-3",
    patientName: "Margaret Williams",
    channel: "portal",
    direction: "inbound",
    content:
      "My blood pressure readings from this morning: 132/84. A little higher than usual. Should I be concerned?",
    timestamp: "2026-02-03T08:30:00Z",
    read: true,
  },
  {
    id: "msg-8",
    patientId: "patient-3",
    patientName: "Margaret Williams",
    channel: "portal",
    direction: "outbound",
    content:
      "A slight elevation is normal and can be influenced by many factors. Continue monitoring and we will discuss at your appointment tomorrow.",
    timestamp: "2026-02-03T10:00:00Z",
    read: true,
  },
  {
    id: "msg-9",
    patientId: "patient-3",
    patientName: "Margaret Williams",
    channel: "phone",
    direction: "inbound",
    content: "Called to confirm appointment time for tomorrow.",
    timestamp: "2026-02-03T16:00:00Z",
    read: true,
  },
];

// ============================================
// DEMO ACTIVITIES
// ============================================

export const demoActivities: DemoActivity[] = [
  // Michael Chen activities
  {
    id: "act-1",
    patientId: "patient-1",
    title: "A1C Lab Results",
    description: "A1C level: 6.8% - Within target range",
    date: "2026-01-28",
    type: "lab",
  },
  {
    id: "act-2",
    patientId: "patient-1",
    title: "Prescription Refill",
    description: "Metformin 500mg - 90 day supply",
    date: "2026-01-25",
    type: "prescription",
  },
  {
    id: "act-3",
    patientId: "patient-1",
    title: "Follow-up Visit",
    description: "Routine diabetes management check",
    date: "2026-01-15",
    type: "appointment",
  },

  // Sarah Johnson activities
  {
    id: "act-4",
    patientId: "patient-2",
    title: "New Patient Intake",
    description: "Completed new patient paperwork via portal",
    date: "2026-02-01",
    type: "note",
  },
  {
    id: "act-5",
    patientId: "patient-2",
    title: "Insurance Verification",
    description: "Aetna HMO - Coverage verified",
    date: "2026-02-02",
    type: "note",
  },

  // Margaret Williams activities
  {
    id: "act-6",
    patientId: "patient-3",
    title: "BP Monitoring",
    description: "Blood pressure: 128/82 - Stable",
    date: "2026-01-30",
    type: "appointment",
  },
  {
    id: "act-7",
    patientId: "patient-3",
    title: "Medication Review",
    description: "Lisinopril 10mg - Continue current dosage",
    date: "2026-01-30",
    type: "prescription",
  },
  {
    id: "act-8",
    patientId: "patient-3",
    title: "Cardiology Referral",
    description: "Referral sent to Dr. Martinez for echocardiogram",
    date: "2026-01-25",
    type: "note",
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPatientById(id: string): DemoPatient | undefined {
  return demoPatients.find((p) => p.id === id);
}

export function getAppointmentsByPatient(patientId: string): DemoAppointment[] {
  return demoAppointments.filter((a) => a.patientId === patientId);
}

export function getMessagesByPatient(patientId: string): DemoMessage[] {
  return demoMessages.filter((m) => m.patientId === patientId);
}

export function getActivitiesByPatient(patientId: string): DemoActivity[] {
  return demoActivities.filter((a) => a.patientId === patientId);
}

export function getUnreadMessageCount(): number {
  return demoMessages.filter((m) => !m.read && m.direction === "inbound").length;
}

export function getUpcomingAppointments(): DemoAppointment[] {
  const today = new Date().toISOString().split("T")[0];
  return demoAppointments
    .filter((a) => a.date >= today && a.status === "Scheduled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export function getTodaysAppointments(): DemoAppointment[] {
  const today = new Date().toISOString().split("T")[0];
  return demoAppointments
    .filter((a) => a.date === today && a.status === "Scheduled")
    .sort((a, b) => a.time.localeCompare(b.time));
}
