/**
 * Appointment React Query Hooks
 * Provides cached data fetching for appointment-related queries
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentKeys } from "./keys";
import {
  getTodayAppointments,
  getUpcomingAppointments,
  getRecentAppointments,
  getAppointmentStats,
  updateAppointmentStatus,
} from "./appointments";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import type { Appointment } from "@/src/lib/supabase/types";

/**
 * Hook to fetch today's appointments
 */
export function useTodayAppointments(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: appointmentKeys.today(practiceId),
    queryFn: () => getTodayAppointments(practiceId),
  });
}

/**
 * Hook to fetch upcoming appointments
 */
export function useUpcomingAppointments(
  practiceId: string = DEMO_PRACTICE_ID,
  days: number = 7,
  statusFilter: "Scheduled" | "all" = "Scheduled"
) {
  return useQuery({
    queryKey: appointmentKeys.upcoming(practiceId, days),
    queryFn: () => getUpcomingAppointments(practiceId, days, statusFilter),
  });
}

/**
 * Hook to fetch recent appointments
 */
export function useRecentAppointments(practiceId: string = DEMO_PRACTICE_ID, days: number = 30) {
  return useQuery({
    queryKey: appointmentKeys.recent(practiceId, days),
    queryFn: () => getRecentAppointments(practiceId, days),
  });
}

/**
 * Hook to fetch appointment statistics
 */
export function useAppointmentStats(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: appointmentKeys.stats(practiceId),
    queryFn: () => getAppointmentStats(practiceId),
  });
}

/**
 * Mutation hook to update appointment status
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      status,
      practiceId = DEMO_PRACTICE_ID,
    }: {
      appointmentId: string;
      status: Appointment["status"];
      practiceId?: string;
    }) => updateAppointmentStatus(appointmentId, status, practiceId),
    onSuccess: (_, { practiceId = DEMO_PRACTICE_ID }) => {
      // Invalidate all appointment queries for this practice
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.today(practiceId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats(practiceId) });
    },
  });
}
