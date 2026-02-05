"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { ScrollArea } from "@/design-system/components/ui/scroll-area";
import {
  PatientRoster,
  PatientHeader,
  PatientMetrics,
  PatientTabs,
  TabsContent,
  PrioritizedActionsSection,
  RecentActivityTimeline,
  demoActivities,
  AppointmentsTabContent,
  MedicalRecordsTabContent,
  MessagesTabContent,
  BillingTabContent,
  ReviewsTabContent,
  type PatientRosterItem,
  type PatientHeaderData,
  type PatientMetricsData,
  type PrioritizedAction,
} from "@/src/components/patients";
import { getPatients, getPatientDetails } from "@/src/lib/queries/patients";
import {
  getPatientPriorityActions,
  type PatientPriorityAction,
} from "@/src/lib/queries/priority-actions";
import { isDatabasePopulated } from "@/src/lib/queries/practice";
import type { Patient, Appointment, Invoice } from "@/src/lib/supabase/types";
import { Button } from "@/design-system/components/ui/button";

// Convert database patient to roster item
function patientToRosterItem(patient: Patient): PatientRosterItem {
  const age = Math.floor(
    (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const dobFormatted = new Date(patient.date_of_birth).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    age,
    dob: dobFormatted,
    phone: patient.phone_mobile || "(No phone)",
    status:
      patient.status === "Active" ? "ACTIVE" : patient.status === "Inactive" ? "INACTIVE" : "NEW",
    avatarSrc: patient.avatar_url || undefined,
  };
}

// Convert database patient to header data
function patientToHeaderData(patient: Patient): PatientHeaderData {
  const age = Math.floor(
    (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const dobFormatted = new Date(patient.date_of_birth).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    status:
      patient.status === "Active" ? "ACTIVE" : patient.status === "Inactive" ? "INACTIVE" : "NEW",
    dob: dobFormatted,
    age,
    phone: patient.phone_mobile || "(No phone)",
    email: patient.email || "",
    insurance: patient.insurance_provider || "Self-Pay",
    avatarSrc: patient.avatar_url || undefined,
  };
}

// Create metrics from patient data
function createPatientMetrics(
  appointments: Appointment[],
  invoices: Invoice[]
): PatientMetricsData {
  const sortedAppts = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastAppt = sortedAppts.find((a) => a.status === "Completed");

  const outstandingBalance = invoices
    .filter((i) => i.balance > 0)
    .reduce((sum, i) => sum + i.balance, 0);

  const years =
    appointments.length > 0
      ? [...new Set(appointments.map((a) => new Date(a.date).getFullYear()))].sort()
      : [new Date().getFullYear()];

  const dateRange =
    years.length === 1 ? String(years[0]) : `${years[0]}-${years[years.length - 1]}`;

  return {
    lastVisit: lastAppt
      ? {
          date: new Date(lastAppt.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          type: lastAppt.service_type,
        }
      : { date: "No visits yet", type: "" },
    appointments: {
      total: appointments.length,
      dateRange,
    },
    balance: {
      amount: `$${outstandingBalance.toFixed(2)}`,
      type: outstandingBalance > 0 ? "Outstanding" : "Paid",
    },
  };
}

// Convert database action to UI action
function dbActionToUiAction(action: PatientPriorityAction): PrioritizedAction {
  const suggestedActions = Array.isArray(action.suggested_actions) ? action.suggested_actions : [];

  return {
    id: action.id,
    title: action.title,
    description: action.clinical_context || "",
    urgency: action.urgency,
    timeframe: (action.timeframe as PrioritizedAction["timeframe"]) || "This week",
    confidence: action.confidence_score || 85,
    icon: "clipboard",
    patientId: action.patient_id,
    suggestedActions,
  };
}

export default function Patient360Page() {
  const [loading, setLoading] = React.useState(true);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);
  const [patientDetails, setPatientDetails] = React.useState<{
    patient: Patient;
    appointments: Appointment[];
    invoices: Invoice[];
  } | null>(null);
  const [actions, setActions] = React.useState<PatientPriorityAction[]>([]);
  const [detailLoading, setDetailLoading] = React.useState(false);

  // Load initial patients list
  React.useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);

        // Check if database is populated
        const populated = await isDatabasePopulated();
        setDbReady(populated);

        if (!populated) {
          setLoading(false);
          return;
        }

        // Load patients list for roster
        const patientsData = await getPatients();
        setPatients(patientsData);

        // Auto-select first patient
        if (patientsData.length > 0 && patientsData[0]) {
          setSelectedPatientId(patientsData[0].id);
        }
      } catch (err) {
        console.error("Failed to load patients:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  // Load selected patient details
  React.useEffect(() => {
    if (!selectedPatientId || !dbReady) return;

    async function loadPatientDetails() {
      try {
        setDetailLoading(true);

        const [details, patientActions] = await Promise.all([
          getPatientDetails(selectedPatientId!),
          getPatientPriorityActions(selectedPatientId!),
        ]);

        if (details) {
          setPatientDetails({
            patient: details.patient,
            appointments: details.appointments,
            invoices: details.invoices,
          });
        }

        setActions(patientActions);
      } catch (err) {
        console.error("Failed to load patient details:", err);
      } finally {
        setDetailLoading(false);
      }
    }

    loadPatientDetails();
  }, [selectedPatientId, dbReady]);

  const handlePatientSelect = (patient: PatientRosterItem) => {
    setSelectedPatientId(patient.id);
  };

  const handleActionClick = (action: PrioritizedAction) => {
    alert(`Action: ${action.title}\n\nSuggested Actions:\n${action.suggestedActions.join("\n")}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-3">Loading patients...</p>
        </div>
      </div>
    );
  }

  // Database not ready
  if (dbReady === false) {
    return (
      <div className="flex h-full items-center justify-center">
        <CardWrapper className="max-w-md p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No patient data imported yet. Please run the import wizard first.
          </p>
          <Link href="/import">
            <Button>Start Import</Button>
          </Link>
        </CardWrapper>
      </div>
    );
  }

  // Convert patients for roster
  const rosterItems = patients.map(patientToRosterItem);

  // Get header and metrics for selected patient
  const headerData = patientDetails ? patientToHeaderData(patientDetails.patient) : null;
  const metricsData = patientDetails
    ? createPatientMetrics(patientDetails.appointments, patientDetails.invoices)
    : null;
  const uiActions = actions.map(dbActionToUiAction);

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Sidebar - Patient Roster */}
      <aside className="border-synapse-2 w-full border-b lg:w-72 lg:border-r lg:border-b-0">
        <div className="h-64 lg:h-full">
          <PatientRoster
            patients={rosterItems}
            selectedPatientId={selectedPatientId || undefined}
            onPatientSelect={handlePatientSelect}
            className="h-full"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4 lg:space-y-6 lg:p-6">
            {detailLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            ) : headerData && metricsData ? (
              <>
                {/* Patient Header */}
                <PatientHeader patient={headerData} />

                {/* Patient Metrics */}
                <PatientMetrics metrics={metricsData} />

                {/* Tabs Section */}
                <CardWrapper className="min-h-[400px]">
                  <PatientTabs defaultValue="overview">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      {/* Prioritized Actions - KILLER FEATURE */}
                      {uiActions.length > 0 ? (
                        <PrioritizedActionsSection
                          actions={uiActions}
                          onActionClick={handleActionClick}
                        />
                      ) : (
                        <div className="border-muted-foreground/30 bg-muted/10 rounded-lg border border-dashed p-6 text-center">
                          <p className="text-muted-foreground text-sm">
                            No priority actions for this patient
                          </p>
                        </div>
                      )}

                      {/* Recent Activity Timeline */}
                      <RecentActivityTimeline activities={demoActivities} />
                    </TabsContent>

                    {/* Other tabs */}
                    <AppointmentsTabContent />
                    <MedicalRecordsTabContent />
                    <MessagesTabContent />
                    <BillingTabContent />
                    <ReviewsTabContent />
                  </PatientTabs>
                </CardWrapper>
              </>
            ) : (
              <CardWrapper className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Select a patient to view their details</p>
              </CardWrapper>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
