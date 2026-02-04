"use client";

import * as React from "react";
import { useParams } from "next/navigation";
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
  demoPrioritizedActions,
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

// Demo patient data for the roster
const demoPatients: PatientRosterItem[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    age: 42,
    dob: "Mar 15, 1983",
    phone: "(555) 123-4567",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Michael Chen",
    age: 35,
    dob: "Jul 22, 1990",
    phone: "(555) 234-5678",
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    age: 28,
    dob: "Nov 8, 1997",
    phone: "(555) 345-6789",
    status: "NEW",
  },
  {
    id: "4",
    name: "David Kim",
    age: 56,
    dob: "Jan 30, 1969",
    phone: "(555) 456-7890",
    status: "ACTIVE",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    age: 61,
    dob: "Sep 12, 1964",
    phone: "(555) 567-8901",
    status: "INACTIVE",
  },
];

// Demo patient details
const demoPatientDetails: Record<
  string,
  { header: PatientHeaderData; metrics: PatientMetricsData }
> = {
  "1": {
    header: {
      id: "1",
      name: "Sarah Johnson",
      status: "ACTIVE",
      dob: "Mar 15, 1983",
      age: 42,
      phone: "(555) 123-4567",
      email: "sarah.johnson@email.com",
      insurance: "Blue Cross PPO",
    },
    metrics: {
      lastVisit: {
        date: "Jan 14, 2026",
        type: "Psychotherapy Session",
      },
      appointments: {
        total: 12,
        dateRange: "2025-2026",
      },
      balance: {
        amount: "$125.50",
        type: "Self Pay",
      },
    },
  },
  "2": {
    header: {
      id: "2",
      name: "Michael Chen",
      status: "ACTIVE",
      dob: "Jul 22, 1990",
      age: 35,
      phone: "(555) 234-5678",
      email: "michael.chen@email.com",
      insurance: "Aetna HMO",
    },
    metrics: {
      lastVisit: {
        date: "Jan 10, 2026",
        type: "Medication Review",
      },
      appointments: {
        total: 8,
        dateRange: "2025-2026",
      },
      balance: {
        amount: "$0.00",
        type: "Insurance",
      },
    },
  },
  "3": {
    header: {
      id: "3",
      name: "Emily Rodriguez",
      status: "NEW",
      dob: "Nov 8, 1997",
      age: 28,
      phone: "(555) 345-6789",
      email: "emily.rodriguez@email.com",
      insurance: "United Healthcare",
    },
    metrics: {
      lastVisit: {
        date: "Jan 8, 2026",
        type: "Initial Consultation",
      },
      appointments: {
        total: 1,
        dateRange: "2026",
      },
      balance: {
        amount: "$50.00",
        type: "Copay",
      },
    },
  },
  "4": {
    header: {
      id: "4",
      name: "David Kim",
      status: "ACTIVE",
      dob: "Jan 30, 1969",
      age: 56,
      phone: "(555) 456-7890",
      email: "david.kim@email.com",
      insurance: "Medicare",
    },
    metrics: {
      lastVisit: {
        date: "Jan 5, 2026",
        type: "Follow-up Visit",
      },
      appointments: {
        total: 24,
        dateRange: "2024-2026",
      },
      balance: {
        amount: "$0.00",
        type: "Medicare",
      },
    },
  },
  "5": {
    header: {
      id: "5",
      name: "Lisa Thompson",
      status: "INACTIVE",
      dob: "Sep 12, 1964",
      age: 61,
      phone: "(555) 567-8901",
      email: "lisa.thompson@email.com",
      insurance: "Cigna PPO",
    },
    metrics: {
      lastVisit: {
        date: "Nov 20, 2025",
        type: "Annual Wellness",
      },
      appointments: {
        total: 6,
        dateRange: "2024-2025",
      },
      balance: {
        amount: "$275.00",
        type: "Outstanding",
      },
    },
  },
};

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const selectedPatient = demoPatients.find((p) => p.id === patientId);
  const patientDetails = patientId ? demoPatientDetails[patientId] : null;

  const handlePatientSelect = (patient: PatientRosterItem) => {
    // In a real app, this would navigate to /patients/[id]
    window.location.href = `/patients/${patient.id}`;
  };

  const handleActionClick = (action: PrioritizedAction) => {
    // This would typically open an orchestration modal
    alert(`Action: ${action.title}\n\nSuggested Actions:\n${action.suggestedActions.join("\n")}`);
  };

  if (!selectedPatient || !patientDetails) {
    return (
      <div className="flex h-full flex-col lg:flex-row">
        <aside className="border-synapse-2 w-full border-b lg:w-72 lg:border-r lg:border-b-0">
          <div className="h-64 lg:h-full">
            <PatientRoster
              patients={demoPatients}
              selectedPatientId={patientId}
              onPatientSelect={handlePatientSelect}
              className="h-full"
            />
          </div>
        </aside>
        <main className="flex-1 p-4 lg:p-6">
          <CardWrapper className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Patient not found</p>
          </CardWrapper>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Sidebar - Patient Roster */}
      <aside className="border-synapse-2 w-full border-b lg:w-72 lg:border-r lg:border-b-0">
        <div className="h-64 lg:h-full">
          <PatientRoster
            patients={demoPatients}
            selectedPatientId={patientId}
            onPatientSelect={handlePatientSelect}
            className="h-full"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4 lg:space-y-6 lg:p-6">
            {/* Patient Header */}
            <PatientHeader patient={patientDetails.header} />

            {/* Patient Metrics */}
            <PatientMetrics metrics={patientDetails.metrics} />

            {/* Tabs Section */}
            <CardWrapper className="min-h-[400px]">
              <PatientTabs defaultValue="overview">
                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0 space-y-6">
                  {/* Prioritized Actions - KILLER FEATURE */}
                  <PrioritizedActionsSection
                    actions={demoPrioritizedActions}
                    onActionClick={handleActionClick}
                  />

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
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
