/**
 * Patient Detail View Module
 *
 * This module exports the PatientDetailView component and related types.
 *
 * TODO: This component is 1500+ lines and should be split into:
 * - types.ts (already created)
 * - PatientChatThread.tsx - Messaging functionality
 * - VisitSummaryPanel.tsx - Visit summary with clinical notes
 * - PatientHeader.tsx - Patient info header
 * - PatientTabs.tsx - Tab navigation and content
 *
 * For now, we re-export from the original file.
 */

export { PatientDetailView } from "../patient-detail-view";
export type {
  PatientDetail,
  PatientMessage,
  PatientInvoice,
  PatientOutcomeMeasure,
  PatientReview,
  PriorityAction,
} from "../patient-detail-view";
