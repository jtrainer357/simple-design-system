/**
 * Query Functions Index
 * Re-exports all database queries for easy imports
 */

// Priority Actions
export {
  getPriorityActions,
  getPatientPriorityActions,
  completeAction,
  dismissAction,
  completeAllPatientActions,
  getActionCounts,
} from "./priority-actions";

// Patients
export {
  getPatients,
  getPatientById,
  getPatientByExternalId,
  getPatientAppointments,
  getPatientOutcomeMeasures,
  getPatientMessages,
  getPatientInvoices,
  getPatientDetails,
  searchPatients,
  getHighRiskPatients,
} from "./patients";

// Appointments
export {
  getTodayAppointments,
  getUpcomingAppointments,
  getRecentAppointments,
  getAppointmentStats,
  updateAppointmentStatus,
} from "./appointments";
export type { AppointmentWithPatient } from "./appointments";

// Practice
export {
  getDemoPractice,
  getPracticeId,
  getDashboardStats,
  isDatabasePopulated,
  getRecentAnalysisRuns,
} from "./practice";
