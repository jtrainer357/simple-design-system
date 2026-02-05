/**
 * Billing/Invoices Queries
 * Fetches invoice and billing data from Supabase
 *
 * Note: Demo invoices have additional columns not in the base types.
 * We use explicit typing to handle both schemas.
 */

import { createClient } from "@/src/lib/supabase/client";
import { DEMO_PRACTICE_ID, getDemoToday, getDemoDaysAgo } from "@/src/lib/utils/demo-date";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any;

export interface Invoice {
  id: string;
  practice_id: string;
  patient_id: string;
  patient_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  date_of_service: string | null;
  service_date_start: string | null;
  service_date_end: string | null;
  cpt_code: string | null;
  description: string | null;
  units: number | null;
  unit_price: number | null;
  subtotal: number | null;
  charge_amount: number;
  insurance_paid: number;
  patient_responsibility: number;
  patient_paid: number;
  amount_paid: number | null;
  balance: number;
  total_due: number | null;
  status: string;
  insurance_provider: string | null;
  insurance_id: string | null;
  created_at: string;
}

export interface InvoiceWithPatient extends Invoice {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface BillingSummary {
  totalCharged: number;
  totalCollected: number;
  outstandingAR: number;
  collectionRate: number;
  invoiceCount: number;
  paidCount: number;
  pendingCount: number;
}

/**
 * Get all invoices for a practice
 */
export async function getInvoices(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<InvoiceWithPatient[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("practice_id", practiceId)
    .order("date_of_service", { ascending: false });

  if (error) {
    console.error("Failed to fetch invoices:", error);
    throw error;
  }

  return (data || []) as unknown as InvoiceWithPatient[];
}

/**
 * Get invoices within a date range
 */
export async function getInvoicesByDateRange(
  practiceId: string = DEMO_PRACTICE_ID,
  startDate: string,
  endDate: string
): Promise<Invoice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("practice_id", practiceId)
    .gte("date_of_service", startDate)
    .lte("date_of_service", endDate)
    .order("date_of_service", { ascending: false });

  if (error) {
    console.error("Failed to fetch invoices by date range:", error);
    throw error;
  }

  return (data || []) as unknown as Invoice[];
}

/**
 * Get billing summary for a practice (6 month history)
 */
export async function getBillingSummary(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<BillingSummary> {
  const supabase = createClient();
  const today = getDemoToday();
  const sixMonthsAgo = getDemoDaysAgo(180);

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("practice_id", practiceId)
    .gte("date_of_service", sixMonthsAgo)
    .lte("date_of_service", today);

  if (error) {
    console.error("Failed to fetch billing summary:", error);
    return {
      totalCharged: 0,
      totalCollected: 0,
      outstandingAR: 0,
      collectionRate: 0,
      invoiceCount: 0,
      paidCount: 0,
      pendingCount: 0,
    };
  }

  const invoices = (data || []) as SupabaseAny[];

  const totalCharged = invoices.reduce(
    (sum: number, inv: SupabaseAny) => sum + (inv.charge_amount || 0),
    0
  );
  const totalCollected = invoices.reduce(
    (sum: number, inv: SupabaseAny) => sum + (inv.insurance_paid || 0) + (inv.patient_paid || 0),
    0
  );
  const outstandingAR = invoices.reduce(
    (sum: number, inv: SupabaseAny) => sum + (inv.balance || 0),
    0
  );
  const collectionRate = totalCharged > 0 ? (totalCollected / totalCharged) * 100 : 0;
  const paidCount = invoices.filter(
    (inv: SupabaseAny) => inv.status?.toLowerCase() === "paid"
  ).length;
  const pendingCount = invoices.filter(
    (inv: SupabaseAny) => inv.status?.toLowerCase() === "pending"
  ).length;

  return {
    totalCharged,
    totalCollected,
    outstandingAR,
    collectionRate: Math.round(collectionRate),
    invoiceCount: invoices.length,
    paidCount,
    pendingCount,
  };
}

/**
 * Get patient invoices
 */
export async function getPatientInvoices(patientId: string): Promise<Invoice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patientId)
    .order("date_of_service", { ascending: false });

  if (error) {
    console.error("Failed to fetch patient invoices:", error);
    throw error;
  }

  return (data || []) as unknown as Invoice[];
}

/**
 * Get outstanding invoices (balance > 0)
 */
export async function getOutstandingInvoices(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<InvoiceWithPatient[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("practice_id", practiceId)
    .gt("balance", 0)
    .order("balance", { ascending: false });

  if (error) {
    console.error("Failed to fetch outstanding invoices:", error);
    throw error;
  }

  return (data || []) as unknown as InvoiceWithPatient[];
}

/**
 * Get monthly billing totals for the past 6 months
 */
export async function getMonthlyBillingTotals(practiceId: string = DEMO_PRACTICE_ID): Promise<
  Array<{
    month: string;
    charged: number;
    collected: number;
  }>
> {
  const supabase = createClient();
  const today = getDemoToday();
  const sixMonthsAgo = getDemoDaysAgo(180);

  const { data, error } = await supabase
    .from("invoices")
    .select("date_of_service, charge_amount, insurance_paid, patient_paid")
    .eq("practice_id", practiceId)
    .gte("date_of_service", sixMonthsAgo)
    .lte("date_of_service", today);

  if (error) {
    console.error("Failed to fetch monthly billing:", error);
    return [];
  }

  // Group by month
  const monthMap = new Map<string, { charged: number; collected: number }>();

  ((data || []) as SupabaseAny[]).forEach((inv: SupabaseAny) => {
    if (!inv.date_of_service) return;
    const month = inv.date_of_service.substring(0, 7); // YYYY-MM
    if (!monthMap.has(month)) {
      monthMap.set(month, { charged: 0, collected: 0 });
    }
    const totals = monthMap.get(month)!;
    totals.charged += inv.charge_amount || 0;
    totals.collected += (inv.insurance_paid || 0) + (inv.patient_paid || 0);
  });

  // Convert to array and sort
  return Array.from(monthMap.entries())
    .map(([month, totals]) => ({
      month,
      ...totals,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
