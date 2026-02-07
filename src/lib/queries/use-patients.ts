/**
 * Patient React Query Hooks
 * Provides cached data fetching for patient-related queries
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientKeys } from "./keys";
import {
  getPatients,
  getPatientById,
  getPatientAppointments,
  getPatientOutcomeMeasures,
  getPatientMessages,
  getPatientInvoices,
  getPatientDetails,
  searchPatients,
  getHighRiskPatients,
  getPatientVisitSummaries,
} from "./patients";
import { getPatientPriorityActions, completeAllPatientActions } from "./priority-actions";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

/**
 * Hook to fetch all patients for a practice
 */
export function usePatients(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.list(practiceId),
    queryFn: () => getPatients(practiceId),
  });
}

/**
 * Hook to fetch a single patient by ID
 */
export function usePatient(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => getPatientById(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch complete patient details with all related data
 */
export function usePatientDetails(patientId: string) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => getPatientDetails(patientId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient appointments
 */
export function usePatientAppointments(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.appointments(patientId),
    queryFn: () => getPatientAppointments(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient outcome measures
 */
export function usePatientOutcomeMeasures(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
) {
  return useQuery({
    queryKey: patientKeys.outcomeMeasures(patientId),
    queryFn: () => getPatientOutcomeMeasures(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient messages
 */
export function usePatientMessages(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.messages(patientId),
    queryFn: () => getPatientMessages(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient invoices
 */
export function usePatientInvoices(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.invoices(patientId),
    queryFn: () => getPatientInvoices(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient visit summaries
 */
export function usePatientVisitSummaries(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.visitSummaries(patientId),
    queryFn: () => getPatientVisitSummaries(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch patient priority actions
 */
export function usePatientPriorityActions(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
) {
  return useQuery({
    queryKey: patientKeys.priorityActions(patientId),
    queryFn: () => getPatientPriorityActions(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to search patients by name
 */
export function usePatientSearch(query: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.search(query, practiceId),
    queryFn: () => searchPatients(query, practiceId),
    enabled: query.length >= 2, // Only search with 2+ characters
  });
}

/**
 * Hook to fetch high-risk patients
 */
export function useHighRiskPatients(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: patientKeys.highRisk(practiceId),
    queryFn: () => getHighRiskPatients(practiceId),
  });
}

/**
 * Mutation hook to complete all patient actions
 */
export function useCompleteAllPatientActions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      practiceId = DEMO_PRACTICE_ID,
    }: {
      patientId: string;
      practiceId?: string;
    }) => completeAllPatientActions(patientId, practiceId),
    onSuccess: (_, { patientId }) => {
      // Invalidate the patient's priority actions
      queryClient.invalidateQueries({ queryKey: patientKeys.priorityActions(patientId) });
      // Also invalidate the main priority actions list
      queryClient.invalidateQueries({ queryKey: ["priority-actions"] });
    },
  });
}
