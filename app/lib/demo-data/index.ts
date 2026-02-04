/**
 * Demo Data Module
 * Centralized exports for all demo data used in the Mental Health MVP
 */

// Re-export everything from the centralized patients file
export * from "./patients";

// Re-export from seed.ts for backward compatibility
export {
  demoPatients,
  demoAppointments,
  demoMessages,
  demoActivities,
  getPatientById as getSeedPatientById,
  getAppointmentsByPatient,
  getMessagesByPatient,
  getActivitiesByPatient,
  getUnreadMessageCount,
  getUpcomingAppointments,
  getTodaysAppointments,
  type DemoPatient as SeedDemoPatient,
  type DemoAppointment,
  type DemoMessage,
  type DemoActivity,
} from "./seed";
