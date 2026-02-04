"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Card, CardContent } from "@/design-system/components/ui/card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { LabResultsSection } from "@/src/components/orchestration/LabResultsSection";
import { SuggestedActionsSection } from "@/src/components/orchestration/SuggestedActionsSection";
import { CurrentMedicationsSection } from "@/src/components/orchestration/CurrentMedicationsSection";
import { TaskProgressSection } from "./task-progress-section";
import { useOrchestrationStore } from "@/src/components/orchestration/hooks/useActionOrchestration";
import type {
  OrchestrationContext,
  SuggestedAction,
  Medication,
} from "@/src/lib/orchestration/types";

interface PatientCanvasDetailProps {
  context: OrchestrationContext;
  onCancel: () => void;
  onComplete: () => void;
  className?: string;
}

// Extended medications for the demo
const extendedMedications: Medication[] = [
  { name: "Metformin", dosage: "1000mg", frequency: "twice daily" },
  { name: "Lisinopril", dosage: "10mg", frequency: "daily" },
  { name: "Atorvastatin", dosage: "20mg", frequency: "daily" },
];

export function PatientCanvasDetail({
  context,
  onCancel,
  onComplete: _onComplete,
  className,
}: PatientCanvasDetailProps) {
  const openModal = useOrchestrationStore((state) => state.openModal);
  const [actions, setActions] = React.useState<SuggestedAction[]>(
    context.suggestedActions.map((a) => ({ ...a }))
  );

  const toggleAction = (actionId: string) => {
    setActions((prev) => prev.map((a) => (a.id === actionId ? { ...a, checked: !a.checked } : a)));
  };

  const handleCompleteAll = () => {
    // Open the orchestration modal with updated actions
    openModal({
      ...context,
      suggestedActions: actions,
    });
  };

  const initials = context.patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const labResults = context.clinicalData.labResults || [];

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Light Header */}
      <div className="border-border/50 border-b p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Avatar className="border-border h-12 w-12 shrink-0 border-2 sm:h-14 sm:w-14">
            <AvatarImage
              src="https://randomuser.me/api/portraits/men/75.jpg"
              alt={context.patient.name}
            />
            <AvatarFallback className="bg-avatar-fallback text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Heading level={4} className="truncate">
                {context.patient.name}
              </Heading>
              <Badge variant="secondary" className="shrink-0">
                {context.patient.primaryDiagnosis}
              </Badge>
            </div>
            <Text size="sm" muted className="mt-1">
              MRN: {context.patient.mrn} &bull; DOB: {context.patient.dob} ({context.patient.age}{" "}
              years)
            </Text>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            <LabResultsSection labResults={labResults} />
            <SuggestedActionsSection actions={actions} onToggle={toggleAction} />
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            <CurrentMedicationsSection medications={extendedMedications} />
            <TaskProgressSection />
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <div className="border-border/50 flex items-center justify-end gap-3 border-t px-4 py-3 sm:px-6 sm:py-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCompleteAll}>Complete All Suggested Actions</Button>
      </div>
    </Card>
  );
}
