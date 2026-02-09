"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system/components/ui/tabs";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import {
  useViewState,
  usePatientViewNavigation,
  useSelectedIds,
  usePatientViewReset,
} from "@/src/lib/stores/patient-view-store";
import type { PatientDetail, PatientDetailViewProps } from "./types";

// Import sub-components
import { AdaptivePatientHeader } from "./adaptive-patient-header";
import { OverviewTab } from "./overview-tab";
import { AppointmentsTab } from "./appointments-tab";
import { MedicalRecordsTab } from "./medical-records-tab";
import { MessagesTab } from "./messages-tab";
import { BillingTab } from "./billing-tab";
import { ReviewsTab } from "./reviews-tab";
import { VisitSummaryPanel } from "./visit-summary-panel";
import { ClinicalNoteView } from "./clinical-note-view";

const tabTriggerStyles =
  "rounded-none border-b-2 border-transparent bg-transparent shadow-none px-3 py-2 text-xl font-light text-foreground-strong whitespace-nowrap hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4";

// Animation variants for content transitions
const contentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

// Type for selected activity with full details
type SelectedActivity = PatientDetail["recentActivity"][number];

export function PatientDetailView({
  patient,
  className,
  initialTab = "overview",
}: PatientDetailViewProps) {
  // Get view state from store
  const viewState = useViewState();
  const { transitionTo, goBack } = usePatientViewNavigation();
  const { selectedVisitId } = useSelectedIds();
  const reset = usePatientViewReset();

  // Debug: Log render state
  console.log("[PatientDetailView] Render:", {
    viewState,
    selectedVisitId,
    hasPatient: !!patient,
    patientId: patient?.id,
    recentActivityCount: patient?.recentActivity?.length ?? 0,
  });

  // Reset state on mount if in an invalid state (stale sessionStorage)
  React.useEffect(() => {
    // If we're in summary/note but have no selected ID, reset to default
    if (
      (viewState === "summary" || viewState === "note" || viewState === "fullView") &&
      !selectedVisitId
    ) {
      console.log("[PatientDetailView] Resetting stale state:", viewState);
      reset();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track patient ID to detect changes
  const previousPatientId = React.useRef<string | null>(null);

  // State for controlled tab
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Track direction for animations
  const [direction, setDirection] = React.useState(0);
  const previousViewState = React.useRef(viewState);

  // Update direction based on view state changes
  React.useEffect(() => {
    const states = ["default", "summary", "note", "fullView"];
    const prevIndex = states.indexOf(previousViewState.current);
    const currentIndex = states.indexOf(viewState);
    setDirection(currentIndex > prevIndex ? 1 : -1);
    previousViewState.current = viewState;
  }, [viewState]);

  // Reset view state when patient changes
  React.useEffect(() => {
    if (
      patient?.id &&
      previousPatientId.current !== null &&
      previousPatientId.current !== patient.id
    ) {
      // Patient changed, reset to default view
      reset();
    }
    previousPatientId.current = patient?.id ?? null;
  }, [patient?.id, reset]);

  // Update activeTab when initialTab changes (e.g., from voice command)
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Find selected activity based on selectedVisitId
  const selectedActivity = React.useMemo<SelectedActivity | null>(() => {
    if (!patient || !selectedVisitId) return null;
    return patient.recentActivity.find((a) => a.id === selectedVisitId) || null;
  }, [patient, selectedVisitId]);

  // Auto-recover: if in summary/note state but activity not found, reset to default
  React.useEffect(() => {
    if (
      (viewState === "summary" || viewState === "note") &&
      selectedVisitId &&
      !selectedActivity &&
      patient
    ) {
      console.warn("Selected activity not found, resetting to default view");
      reset();
    }
  }, [viewState, selectedVisitId, selectedActivity, patient, reset]);

  // Handle activity selection from overview tab
  const handleActivitySelect = React.useCallback(
    (activity: SelectedActivity) => {
      transitionTo("summary", activity.id);
    },
    [transitionTo]
  );

  // Handle back from summary - go back to default
  const handleBackFromSummary = React.useCallback(() => {
    goBack();
  }, [goBack]);

  if (!patient) {
    return (
      <CardWrapper className={cn("flex h-full items-center justify-center", className)}>
        <Text muted className="text-center">
          Select a patient to view their details
        </Text>
      </CardWrapper>
    );
  }

  // Determine if we're in full view mode (no header visible)
  const isFullView = viewState === "fullView";

  return (
    <div className={cn("flex flex-col gap-2", className)} style={{ height: "100%" }}>
      {/* Adaptive Patient Header - shrinks based on view state */}
      <div className="shrink-0">
        <AdaptivePatientHeader patient={patient} />
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Default View: Tabs */}
        {viewState === "default" && (
          <CardWrapper className="flex min-h-0 flex-1 flex-col overflow-hidden">
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

              <TabsContent value="overview" className="mt-0 flex-1 overflow-y-auto">
                <OverviewTab patient={patient} onActivitySelect={handleActivitySelect} />
              </TabsContent>

              <TabsContent value="appointments" className="mt-0 flex-1 overflow-y-auto pr-1">
                <AppointmentsTab patient={patient} />
              </TabsContent>

              <TabsContent value="medical-records" className="mt-0 flex-1 overflow-y-auto pr-1">
                <MedicalRecordsTab patient={patient} />
              </TabsContent>

              <TabsContent value="messages" className="-mx-6 mt-0 -mb-6 flex-1 overflow-hidden">
                <MessagesTab patient={patient} />
              </TabsContent>

              <TabsContent value="billing" className="mt-0 flex-1 overflow-y-auto pr-1">
                <BillingTab patient={patient} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0 flex-1 overflow-y-auto pr-1">
                <ReviewsTab patient={patient} />
              </TabsContent>
            </Tabs>
          </CardWrapper>
        )}

        {/* Summary View: Visit Summary Panel */}
        {viewState === "summary" && selectedActivity && (
          <CardWrapper className="h-full overflow-hidden">
            <VisitSummaryPanel
              activity={selectedActivity}
              patientName={patient.name}
              onBack={handleBackFromSummary}
            />
          </CardWrapper>
        )}

        {/* Note View: Clinical Note with optional Full View */}
        {(viewState === "note" || viewState === "fullView") && selectedActivity && (
          <CardWrapper
            className={cn(
              "h-full overflow-hidden",
              isFullView && "bg-background fixed inset-0 z-50 rounded-none border-0 shadow-none"
            )}
          >
            <ClinicalNoteView activity={selectedActivity} patientName={patient.name} />
          </CardWrapper>
        )}

        {/* Fallback when no activity is selected but we're in summary/note state */}
        {(viewState === "summary" || viewState === "note") && !selectedActivity && (
          <CardWrapper className="flex h-full items-center justify-center">
            <Text muted>Select an activity to view details</Text>
          </CardWrapper>
        )}
      </div>
    </div>
  );
}
