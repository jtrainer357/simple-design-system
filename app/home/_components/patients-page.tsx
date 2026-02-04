"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { PatientListSidebar, Patient } from "./patient-list-sidebar";
import { PatientDetailView, PatientDetail } from "./patient-detail-view";

const patientFilterTabs = [
  { id: "all", label: "All Patients" },
  { id: "active", label: "Active" },
  { id: "new", label: "New" },
  { id: "inactive", label: "Inactive" },
];

// Mock data for demonstration
const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Tim Anders",
    age: 22,
    dob: "11/08/2003",
    phone: "1-701-421-6969",
    lastActivity: "2/3/2026",
    status: "ACTIVE",
    avatarSrc: "/avatars/avatar-1.png",
  },
  {
    id: "2",
    name: "Gwendolyn Bechtelar",
    age: 22,
    dob: "09/20/2003",
    phone: "864.922.0456",
    lastActivity: "2/3/2026",
    status: "INACTIVE",
    avatarSrc: "/avatars/avatar-2.png",
  },
  {
    id: "3",
    name: "Opal Boyer",
    age: 25,
    dob: "09/04/2000",
    phone: "1-271-383-1951",
    lastActivity: "2/3/2026",
    status: "ACTIVE",
    avatarSrc: "/avatars/avatar-3.png",
  },
  {
    id: "4",
    name: "Michael Chen",
    age: 47,
    dob: "07/21/1978",
    phone: "(555) 234-5678",
    lastActivity: "2/3/2026",
    status: "ACTIVE",
    avatarSrc: "/avatars/avatar-4.png",
  },
  {
    id: "5",
    name: "Jodi Connelly",
    age: 57,
    dob: "10/15/1968",
    phone: "536.662.5108",
    lastActivity: "2/3/2026",
    status: "ACTIVE",
    avatarSrc: "/avatars/avatar-1.png",
  },
  {
    id: "6",
    name: "Lloyd Effertz",
    age: 46,
    dob: "10/05/1979",
    phone: "259.945.1434",
    lastActivity: "2/3/2026",
    status: "ACTIVE",
  },
  {
    id: "7",
    name: "Jason Farrell",
    age: 26,
    dob: "02/05/1999",
    phone: "(880) 938-2872",
    lastActivity: "2/3/2026",
    status: "INACTIVE",
  },
];

const mockPatientDetails: Record<string, PatientDetail> = {
  "1": {
    id: "1",
    name: "Tim Anders",
    status: "ACTIVE",
    dob: "11/08/2003",
    age: 22,
    phone: "1-701-421-6969",
    phoneExt: "09823",
    email: "Tim_Ankunding@hotmail.com",
    insurance: "Blue Cross Blue Shield",
    avatarSrc: "/avatars/avatar-1.png",
    lastVisit: {
      date: "Jan 14, 2026",
      type: "Psychotherapy Session",
    },
    appointments: {
      total: 12,
      dateRange: "2025 - 2026",
    },
    balance: {
      amount: "$125.50",
      type: "Self Pay",
    },
    upcomingAppointments: [
      {
        id: "apt1",
        status: "Scheduled",
        date: "Mar 5, 2026",
        time: "5:00 AM",
        type: "Follow Up",
        provider: "Dr. Provider",
      },
      {
        id: "apt2",
        status: "Scheduled",
        date: "Mar 19, 2026",
        time: "10:30 AM",
        type: "Wellness",
        provider: "Dr. Provider",
      },
    ],
    recentActivity: [
      {
        id: "act1",
        title: "Psychotherapy Session",
        description: "Session documented.",
        date: "Jan 21, 2026",
      },
      {
        id: "act2",
        title: "Psychotherapy Session",
        description: "Session documented.",
        date: "Jan 21, 2026",
      },
      {
        id: "act3",
        title: "Psychotherapy Session",
        description: "Patient managing work stress well.",
        date: "Jan 13, 2026",
      },
    ],
  },
};

// Generate default patient details for patients without mock data
function getPatientDetails(patient: Patient): PatientDetail {
  if (mockPatientDetails[patient.id]) {
    return mockPatientDetails[patient.id];
  }

  return {
    id: patient.id,
    name: patient.name,
    status: patient.status,
    dob: patient.dob,
    age: patient.age,
    phone: patient.phone,
    email: `${patient.name.toLowerCase().replace(" ", ".")}@email.com`,
    lastVisit: {
      date: "Feb 1, 2026",
      type: "General Checkup",
    },
    appointments: {
      total: 5,
      dateRange: "2025 - 2026",
    },
    balance: {
      amount: "$0.00",
      type: "Insurance",
    },
    upcomingAppointments: [],
    recentActivity: [],
  };
}

export function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(mockPatients[0]);
  const [activeFilter, setActiveFilter] = React.useState("all");

  const patientDetails = selectedPatient ? getPatientDetails(selectedPatient) : null;

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
            patients={mockPatients}
            selectedPatientId={selectedPatient?.id}
            onPatientSelect={setSelectedPatient}
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
          <PatientDetailView patient={patientDetails} className="min-h-0 flex-1" />
        </div>
      </div>
    </div>
  );
}
