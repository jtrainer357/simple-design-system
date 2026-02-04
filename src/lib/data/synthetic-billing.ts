/**
 * Synthetic Billing Data for Billing Page
 */

import { SYNTHETIC_PATIENTS } from "./synthetic-patients";
import { SYNTHETIC_APPOINTMENTS } from "./synthetic-appointments";

export interface Invoice {
  id: string;
  patient_id: string;
  patient_name: string;
  appointment_id: string;
  date_of_service: string;
  cpt_code: string;
  charge_amount: number;
  insurance_paid: number;
  patient_responsibility: number;
  patient_paid: number;
  balance: number;
  status: "Paid" | "Pending" | "Partial" | "Denied";
}

export interface BillingSummary {
  total_outstanding: number;
  collections_this_month: number;
  aging_0_30: number;
  aging_31_60: number;
  aging_61_90: number;
  aging_90_plus: number;
  claim_denial_rate: number;
}

// Seeded random for consistency
let seed = 11111;
function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function generateBillingData() {
  const invoices: Invoice[] = [];
  let invoiceId = 1;

  // Create invoices for completed appointments
  const completedAppts = SYNTHETIC_APPOINTMENTS.filter((a) => a.status === "Completed");

  completedAppts.forEach((appt) => {
    const patient = SYNTHETIC_PATIENTS.find((p) => p.id === appt.patient_id);
    if (!patient) return;

    const chargeAmount = appt.cpt_code === "90837" ? 180 : appt.cpt_code === "90834" ? 150 : 200;
    const isSelfPay = patient.insurance_provider === "Self-Pay";

    let insurancePaid = 0;
    let patientResponsibility = chargeAmount;
    let patientPaid = 0;
    let status: Invoice["status"] = "Pending";

    if (!isSelfPay) {
      // Insurance patients
      const denialRoll = seededRandom();
      if (denialRoll < 0.08) {
        // Denied claim
        status = "Denied";
        patientResponsibility = chargeAmount;
      } else {
        // Covered
        insurancePaid = Math.round(chargeAmount * (0.6 + seededRandom() * 0.3)); // 60-90% covered
        patientResponsibility = chargeAmount - insurancePaid;

        // Did patient pay their copay?
        const daysSinceService = Math.floor(
          (Date.now() - new Date(appt.date).getTime()) / 86400000
        );
        if (daysSinceService > 14 && seededRandom() > 0.3) {
          patientPaid = patientResponsibility;
          status = "Paid";
        } else if (daysSinceService > 7 && seededRandom() > 0.5) {
          patientPaid = Math.round(patientResponsibility * 0.5);
          status = "Partial";
        }
      }
    } else {
      // Self-pay patients
      const daysSinceService = Math.floor((Date.now() - new Date(appt.date).getTime()) / 86400000);
      if (daysSinceService > 7 && seededRandom() > 0.4) {
        patientPaid = chargeAmount;
        status = "Paid";
      } else if (seededRandom() > 0.6) {
        patientPaid = Math.round(chargeAmount * 0.5);
        status = "Partial";
      }
    }

    invoices.push({
      id: `inv-${String(invoiceId++).padStart(5, "0")}`,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      appointment_id: appt.id,
      date_of_service: appt.date,
      cpt_code: appt.cpt_code,
      charge_amount: chargeAmount,
      insurance_paid: insurancePaid,
      patient_responsibility: patientResponsibility,
      patient_paid: patientPaid,
      balance: patientResponsibility - patientPaid,
      status,
    });
  });

  // Calculate summary
  const unpaidInvoices = invoices.filter((i) => i.balance > 0);
  const paidThisMonth = invoices.filter((i) => {
    const serviceDate = new Date(i.date_of_service);
    const now = new Date();
    return serviceDate.getMonth() === now.getMonth() && i.status === "Paid";
  });

  const now = new Date();
  const summary: BillingSummary = {
    total_outstanding: unpaidInvoices.reduce((sum, i) => sum + i.balance, 0),
    collections_this_month: paidThisMonth.reduce(
      (sum, i) => sum + i.patient_paid + i.insurance_paid,
      0
    ),
    aging_0_30: unpaidInvoices
      .filter((i) => (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000 <= 30)
      .reduce((sum, i) => sum + i.balance, 0),
    aging_31_60: unpaidInvoices
      .filter((i) => {
        const days = (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000;
        return days > 30 && days <= 60;
      })
      .reduce((sum, i) => sum + i.balance, 0),
    aging_61_90: unpaidInvoices
      .filter((i) => {
        const days = (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000;
        return days > 60 && days <= 90;
      })
      .reduce((sum, i) => sum + i.balance, 0),
    aging_90_plus: unpaidInvoices
      .filter((i) => (now.getTime() - new Date(i.date_of_service).getTime()) / 86400000 > 90)
      .reduce((sum, i) => sum + i.balance, 0),
    claim_denial_rate: invoices.filter((i) => i.status === "Denied").length / invoices.length,
  };

  return { invoices, summary };
}

export const { invoices: SYNTHETIC_INVOICES, summary: BILLING_SUMMARY } = generateBillingData();
