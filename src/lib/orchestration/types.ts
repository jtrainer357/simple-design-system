/**
 * Orchestration Types
 * Type definitions for the AI Action Orchestration system
 */

export type TriggerType = "lab_result" | "refill" | "screening" | "appointment";
export type UrgencyLevel = "urgent" | "high" | "medium";
export type ActionType = "message" | "order" | "medication" | "task" | "document";
export type TaskStatus = "pending" | "executing" | "completed" | "failed";
export type LabStatus = "normal" | "elevated" | "critical";
export type TrendDirection = "up" | "down" | "stable";

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: number;
  primaryDiagnosis: string;
  avatar: string;
}

export interface Trigger {
  type: TriggerType;
  title: string;
  urgency: UrgencyLevel;
}

export interface LabResult {
  name: string;
  value: string;
  unit: string;
  trend?: TrendDirection;
  trendValue?: string;
  status: LabStatus;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface ClinicalData {
  labResults?: LabResult[];
  medications?: Medication[];
}

export interface SuggestedAction {
  id: string;
  label: string;
  type: ActionType;
  checked: boolean;
}

export interface OrchestrationContext {
  patient: Patient;
  trigger: Trigger;
  clinicalData: ClinicalData;
  suggestedActions: SuggestedAction[];
}

export interface TaskProgress {
  actionId: string;
  status: TaskStatus;
  completedAt?: Date;
}

export interface ExecutionResult {
  actionId: string;
  success: boolean;
  error?: string;
}

// Demo data for showcasing the modal
// Michael Chen - RESULTS READY: A1C improved from 8.1% to 7.2%
export const demoContext: OrchestrationContext = {
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
};
