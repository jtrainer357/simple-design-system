"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Loader2, Database } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { PatientListSidebar, Patient } from "./patient-list-sidebar";
import { PatientDetailView, PatientDetail } from "./patient-detail-view";
import {
  getPatients,
  getPatientDetails as getPatientDetailsQuery,
} from "@/src/lib/queries/patients";
import { isDatabasePopulated } from "@/src/lib/queries/practice";
import type { Patient as DbPatient, Appointment, Invoice } from "@/src/lib/supabase/types";
import { Text } from "@/design-system/components/ui/typography";

const patientFilterTabs = [
  { id: "all", label: "All Patients" },
  { id: "active", label: "Active" },
  { id: "new", label: "New" },
  { id: "inactive", label: "Inactive" },
];

// Convert DB patient to list format
function dbPatientToListItem(patient: DbPatient): Patient {
  const age = Math.floor(
    (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const dobFormatted = new Date(patient.date_of_birth).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    age,
    dob: dobFormatted,
    phone: patient.phone_mobile || "(No phone)",
    lastActivity: new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }),
    status:
      patient.status === "Active" ? "ACTIVE" : patient.status === "Inactive" ? "INACTIVE" : "NEW",
    avatarSrc: patient.avatar_url || undefined,
  };
}

// Convert DB data to detail format
function createPatientDetail(
  patient: DbPatient,
  appointments: Appointment[],
  invoices: Invoice[]
): PatientDetail {
  const age = Math.floor(
    (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const dobFormatted = new Date(patient.date_of_birth).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  // Get last visit
  const sortedAppts = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastAppt = sortedAppts.find((a) => a.status === "Completed");

  // Calculate outstanding balance
  const outstandingBalance = invoices
    .filter((i) => i.balance > 0)
    .reduce((sum, i) => sum + i.balance, 0);

  // Get date range
  const years =
    appointments.length > 0
      ? [...new Set(appointments.map((a) => new Date(a.date).getFullYear()))].sort()
      : [new Date().getFullYear()];
  const dateRange =
    years.length === 1 ? String(years[0]) : `${years[0]} - ${years[years.length - 1]}`;

  // Get upcoming appointments
  const now = new Date();
  const upcomingAppts = sortedAppts
    .filter((a) => new Date(a.date) >= now && a.status === "Scheduled")
    .slice(0, 3)
    .map((a) => ({
      id: a.id,
      status: "Scheduled" as const,
      date: new Date(a.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: a.start_time,
      type: a.service_type,
      provider: "Dr. Demo",
    }));

  // Get recent activity from appointments
  const recentActivity = sortedAppts
    .filter((a) => a.status === "Completed")
    .slice(0, 3)
    .map((a) => ({
      id: a.id,
      title: a.service_type,
      description: `Session with ${patient.first_name}`,
      date: new Date(a.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

  return {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    status:
      patient.status === "Active" ? "ACTIVE" : patient.status === "Inactive" ? "INACTIVE" : "NEW",
    dob: dobFormatted,
    age,
    phone: patient.phone_mobile || "(No phone)",
    phoneExt: undefined,
    email: patient.email ?? "",
    insurance: patient.insurance_provider || "Self-Pay",
    avatarSrc: patient.avatar_url || undefined,
    lastVisit: lastAppt
      ? {
          date: new Date(lastAppt.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          type: lastAppt.service_type,
        }
      : {
          date: "No visits yet",
          type: "",
        },
    appointments: {
      total: appointments.length,
      dateRange,
    },
    balance: {
      amount: `$${outstandingBalance.toFixed(2)}`,
      type: outstandingBalance > 0 ? "Outstanding" : "Paid",
    },
    upcomingAppointments: upcomingAppts,
    recentActivity,
  };
}

export function PatientsPage() {
  const [loading, setLoading] = React.useState(true);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);
  const [patients, setPatients] = React.useState<DbPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [patientDetails, setPatientDetails] = React.useState<PatientDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState("all");

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

        // Load patients list
        const patientsData = await getPatients();
        setPatients(patientsData);

        // Auto-select first patient
        if (patientsData.length > 0 && patientsData[0]) {
          const firstPatient = dbPatientToListItem(patientsData[0]);
          setSelectedPatient(firstPatient);
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
    if (!selectedPatient || !dbReady) return;

    async function loadPatientDetails() {
      try {
        setDetailLoading(true);

        const details = await getPatientDetailsQuery(selectedPatient!.id);

        if (details) {
          const detailData = createPatientDetail(
            details.patient,
            details.appointments,
            details.invoices
          );
          setPatientDetails(detailData);
        }
      } catch (err) {
        console.error("Failed to load patient details:", err);
      } finally {
        setDetailLoading(false);
      }
    }

    loadPatientDetails();
  }, [selectedPatient?.id, dbReady]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  // Convert patients for list
  const patientListItems = patients.map(dbPatientToListItem);

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

  // Database not ready state
  if (dbReady === false) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <Database className="text-muted-foreground/50 h-12 w-12" />
          <Text size="sm" muted className="mt-4 text-center">
            No patient data imported yet.
          </Text>
          <Text size="xs" muted className="mt-1 max-w-sm text-center">
            Run the import wizard to populate the database with patient data.
          </Text>
          <Link href="/import" className="mt-4">
            <Button variant="default" size="sm">
              Start Import
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Main Content */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden lg:grid-cols-12">
        {/* Patient List Column */}
        <div className="flex flex-col overflow-hidden lg:col-span-5 xl:col-span-4">
          {/* Filter Tabs - aligned with patient list column */}
          <div className="mb-4 flex items-center justify-between">
            <FilterTabs
              tabs={patientFilterTabs}
              activeTab={activeFilter}
              onTabChange={setActiveFilter}
            />
          </div>
          <PatientListSidebar
            patients={patientListItems}
            selectedPatientId={selectedPatient?.id}
            onPatientSelect={handlePatientSelect}
            activeFilter={activeFilter}
            className="min-h-0 flex-1"
          />
        </div>

        {/* Patient Detail Column */}
        <div className="flex flex-col overflow-hidden lg:col-span-7 xl:col-span-8">
          {/* Add Patient Button - aligned with detail view */}
          <div className="mb-4 flex items-center justify-end">
            <Button className="gap-1.5 text-sm sm:gap-2 sm:text-base">
              Add Patient
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          {detailLoading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : (
            <PatientDetailView patient={patientDetails} className="min-h-0 flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
