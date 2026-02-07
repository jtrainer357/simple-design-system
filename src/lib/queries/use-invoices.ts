/**
 * Invoice/Billing React Query Hooks
 * Provides cached data fetching for billing-related queries
 */

import { useQuery } from "@tanstack/react-query";
import { billingKeys } from "./keys";
import {
  getInvoices,
  getInvoicesByDateRange,
  getBillingSummary,
  getPatientInvoices,
  getOutstandingInvoices,
  getMonthlyBillingTotals,
} from "./billing";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

/**
 * Hook to fetch all invoices for a practice
 */
export function useInvoices(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: billingKeys.invoiceList(practiceId),
    queryFn: () => getInvoices(practiceId),
  });
}

/**
 * Hook to fetch invoices within a date range
 */
export function useInvoicesByDateRange(
  practiceId: string = DEMO_PRACTICE_ID,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: billingKeys.byDateRange(practiceId, startDate, endDate),
    queryFn: () => getInvoicesByDateRange(practiceId, startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

/**
 * Hook to fetch billing summary
 */
export function useBillingSummary(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: billingKeys.summary(practiceId),
    queryFn: () => getBillingSummary(practiceId),
  });
}

/**
 * Hook to fetch invoices for a specific patient
 */
export function usePatientInvoices(patientId: string, practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: billingKeys.invoicesByPatient(patientId),
    queryFn: () => getPatientInvoices(patientId, practiceId),
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch outstanding invoices
 */
export function useOutstandingInvoices(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: billingKeys.outstanding(practiceId),
    queryFn: () => getOutstandingInvoices(practiceId),
  });
}

/**
 * Hook to fetch monthly billing totals
 */
export function useMonthlyBillingTotals(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: billingKeys.monthlyTotals(practiceId),
    queryFn: () => getMonthlyBillingTotals(practiceId),
  });
}
