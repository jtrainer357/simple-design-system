/**
 * Communication React Query Hooks
 * Provides cached data fetching for communication/message-related queries
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communicationKeys } from "./keys";
import {
  getCommunications,
  getPatientCommunications,
  getCommunicationThreads,
  getUnreadCount,
  markAsRead,
} from "./communications";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

/**
 * Hook to fetch all communications for a practice
 */
export function useCommunications(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: communicationKeys.list(practiceId),
    queryFn: () => getCommunications(practiceId),
  });
}

/**
 * Hook to fetch communications for a specific patient
 */
export function usePatientCommunications(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: communicationKeys.byPatient(patientId),
    queryFn: () => getPatientCommunications(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch communication threads (grouped by patient)
 */
export function useCommunicationThreads(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: communicationKeys.threads(practiceId),
    queryFn: () => getCommunicationThreads(practiceId),
  });
}

/**
 * Hook to fetch unread message count
 */
export function useUnreadCount(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: communicationKeys.unreadCount(practiceId),
    queryFn: () => getUnreadCount(practiceId),
    // Refetch more frequently for unread count
    refetchInterval: 30000, // 30 seconds
  });
}

/**
 * Mutation hook to mark a communication as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      communicationId,
      practiceId = DEMO_PRACTICE_ID,
    }: {
      communicationId: string;
      practiceId?: string;
    }) => markAsRead(communicationId, practiceId),
    onSuccess: (_, { practiceId = DEMO_PRACTICE_ID }) => {
      // Invalidate communication queries
      queryClient.invalidateQueries({ queryKey: communicationKeys.list(practiceId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.threads(practiceId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadCount(practiceId) });
    },
  });
}
