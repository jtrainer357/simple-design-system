"use client";

import * as React from "react";
import {
  ArrowLeft,
  FileText,
  Stethoscope,
  ClipboardList,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { FullNoteView } from "./full-note-view";
import type { PatientDetail } from "./types";

// Type for selected activity with full details
type SelectedActivity = PatientDetail["recentActivity"][number];

interface VisitSummaryPanelProps {
  activity: SelectedActivity;
  patientName: string;
  onBack: () => void;
}

export function VisitSummaryPanel({ activity, patientName, onBack }: VisitSummaryPanelProps) {
  const [showFullNote, setShowFullNote] = React.useState(false);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Sliding container for summary <-> full note transition */}
      <div
        className={cn(
          "flex h-full transition-transform duration-300 ease-in-out",
          showFullNote ? "-translate-x-1/2" : "translate-x-0"
        )}
        style={{ width: "200%" }}
      >
        {/* Panel 1: Visit Summary */}
        <div className="flex h-full w-1/2 shrink-0 flex-col">
          {/* Header with back button */}
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Go back to overview"
              className="hover:bg-muted flex h-11 w-11 items-center justify-center rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <Heading level={5} className="text-base sm:text-lg">
                {activity.title}
              </Heading>
              <Text size="sm" muted>
                {activity.date}
              </Text>
            </div>
          </div>

          {/* Visit details */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {/* Session Info Card */}
            <Card className="p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Text size="xs" muted className="mb-0.5">
                    Duration
                  </Text>
                  <Text size="sm" className="font-medium">
                    {activity.duration || "60 min"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" muted className="mb-0.5">
                    Provider
                  </Text>
                  <Text size="sm" className="font-medium">
                    {activity.provider || "Dr. Demo"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" muted className="mb-0.5">
                    Type
                  </Text>
                  <Text size="sm" className="font-medium">
                    {activity.appointmentType || "Individual"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" muted className="mb-0.5">
                    Location
                  </Text>
                  <Text size="sm" className="font-medium">
                    In-office
                  </Text>
                </div>
              </div>
            </Card>

            {/* Visit Summary */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileText className="text-muted-foreground h-4 w-4" />
                <Text size="sm" className="font-semibold">
                  Session Summary
                </Text>
              </div>
              <Card className="p-4">
                <Text size="sm" className="leading-relaxed">
                  {activity.visitSummary || activity.description}
                </Text>
              </Card>
            </div>

            {/* Diagnosis/Focus Areas */}
            {activity.diagnosisCodes && activity.diagnosisCodes.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Stethoscope className="text-muted-foreground h-4 w-4" />
                  <Text size="sm" className="font-semibold">
                    Focus Areas
                  </Text>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activity.diagnosisCodes.map((code, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Notes */}
            {activity.treatmentNotes && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ClipboardList className="text-muted-foreground h-4 w-4" />
                  <Text size="sm" className="font-semibold">
                    Treatment Notes
                  </Text>
                </div>
                <Card className="p-4">
                  <Text size="sm" className="leading-relaxed">
                    {activity.treatmentNotes}
                  </Text>
                </Card>
              </div>
            )}

            {/* Next Steps */}
            {activity.nextSteps && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="text-primary h-4 w-4" />
                  <Text size="sm" className="font-semibold">
                    Next Steps
                  </Text>
                </div>
                <Card className="border-primary/20 bg-primary/5 p-4">
                  <Text size="sm" className="leading-relaxed">
                    {activity.nextSteps}
                  </Text>
                </Card>
              </div>
            )}

            {/* Billing Summary */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <DollarSign className="text-muted-foreground h-4 w-4" />
                <Text size="sm" className="font-semibold">
                  Billing Summary
                </Text>
              </div>
              <Card className="p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                  <div>
                    <Text size="xs" muted className="mb-0.5">
                      Copay Collected
                    </Text>
                    <Text size="sm" className="font-medium text-green-600">
                      $25.00
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" muted className="mb-0.5">
                      Insurance Claim
                    </Text>
                    <Text size="sm" className="font-medium">
                      Submitted
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" muted className="mb-0.5">
                      Balance
                    </Text>
                    <Text size="sm" className="font-medium">
                      $0.00
                    </Text>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer with View Note button */}
          <div className="mt-4 flex justify-end border-t pt-4">
            <Button variant="outline" className="gap-2" onClick={() => setShowFullNote(true)}>
              <FileText className="h-4 w-4" />
              View Full Note
            </Button>
          </div>
        </div>

        {/* Panel 2: Full Clinical Note */}
        <div className="h-full w-1/2 shrink-0 pl-6">
          <FullNoteView
            activity={activity}
            patientName={patientName}
            onBack={() => setShowFullNote(false)}
          />
        </div>
      </div>
    </div>
  );
}
