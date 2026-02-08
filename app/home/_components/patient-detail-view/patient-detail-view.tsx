"use client";

import * as React from "react";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system/components/ui/tabs";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { PatientDetail, PatientDetailViewProps } from "./types";

// Import sub-components
import { PatientHeader } from "./patient-header";
import { OverviewTab } from "./overview-tab";
import { AppointmentsTab } from "./appointments-tab";
import { MedicalRecordsTab } from "./medical-records-tab";
import { MessagesTab } from "./messages-tab";
import { BillingTab } from "./billing-tab";
import { ReviewsTab } from "./reviews-tab";
import { VisitSummaryPanel } from "./visit-summary-panel";

const tabTriggerStyles =
  "rounded-none border-b-2 border-transparent bg-transparent shadow-none px-3 py-2 text-xl font-light text-foreground-strong whitespace-nowrap hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4";

// Type for selected activity with full details
type SelectedActivity = PatientDetail["recentActivity"][number];

export function PatientDetailView({
  patient,
  className,
  initialTab = "overview",
}: PatientDetailViewProps) {
  // State for selected activity (visit summary panel)
  const [selectedActivity, setSelectedActivity] = React.useState<SelectedActivity | null>(null);
  // State for controlled tab
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Update activeTab when initialTab changes (e.g., from voice command)
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!patient) {
    return (
      <CardWrapper className={cn("flex h-full items-center justify-center", className)}>
        <Text muted className="text-center">
          Select a patient to view their details
        </Text>
      </CardWrapper>
    );
  }

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      {/* Patient Header Card */}
      <PatientHeader patient={patient} />

      {/* Tabs Section with Full-Panel Sliding */}
      <div className="relative flex-1 overflow-hidden">
        {/* Sliding container for full panel transition */}
        <div
          className={cn(
            "flex h-full transition-transform duration-300 ease-in-out",
            selectedActivity ? "-translate-x-1/2" : "translate-x-0"
          )}
          style={{ width: "200%" }}
        >
          {/* Panel 1: Tabs Content */}
          <div className="h-full w-1/2 shrink-0">
            <CardWrapper className="flex h-full flex-col overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex h-full w-full flex-col"
              >
                <TabsList className="border-border/50 mb-4 h-auto w-full justify-start gap-0 overflow-x-auto border-b-2 bg-transparent p-0 sm:mb-6">
                  <TabsTrigger value="overview" className={tabTriggerStyles}>
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="appointments" className={tabTriggerStyles}>
                    Appointments
                  </TabsTrigger>
                  <TabsTrigger value="medical-records" className={tabTriggerStyles}>
                    Medical Records
                  </TabsTrigger>
                  <TabsTrigger value="messages" className={tabTriggerStyles}>
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="billing" className={tabTriggerStyles}>
                    Billing
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className={tabTriggerStyles}>
                    Reviews
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab Content */}
                <TabsContent value="overview" className="mt-0 flex-1 overflow-y-auto">
                  <OverviewTab patient={patient} onActivitySelect={setSelectedActivity} />
                </TabsContent>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="mt-0 flex-1 overflow-y-auto pr-1">
                  <AppointmentsTab patient={patient} />
                </TabsContent>

                {/* Medical Records Tab */}
                <TabsContent value="medical-records" className="mt-0 flex-1 overflow-y-auto pr-1">
                  <MedicalRecordsTab patient={patient} />
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" className="-mx-6 mt-0 -mb-6 flex-1 overflow-hidden">
                  <MessagesTab patient={patient} />
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing" className="mt-0 flex-1 overflow-y-auto pr-1">
                  <BillingTab patient={patient} />
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-0 flex-1 overflow-y-auto pr-1">
                  <ReviewsTab patient={patient} />
                </TabsContent>
              </Tabs>
            </CardWrapper>
          </div>

          {/* Panel 2: Visit Summary (Full Panel) */}
          <div className="h-full w-1/2 shrink-0">
            <CardWrapper className="flex h-full flex-col">
              {selectedActivity ? (
                <VisitSummaryPanel
                  activity={selectedActivity}
                  patientName={patient.name}
                  onBack={() => setSelectedActivity(null)}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Text muted>Select an activity to view details</Text>
                </div>
              )}
            </CardWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
