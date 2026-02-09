"use client";

import * as React from "react";
import { motion } from "framer-motion";
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
import { usePatientViewNavigation } from "@/src/lib/stores/patient-view-store";
import type { PatientDetail } from "./types";

// Type for selected activity with full details
type SelectedActivity = PatientDetail["recentActivity"][number];

interface VisitSummaryPanelProps {
  activity: SelectedActivity;
  patientName: string;
  /** Optional callback for backward compatibility */
  onBack?: () => void;
  className?: string;
}

export function VisitSummaryPanel({
  activity,
  patientName,
  onBack,
  className,
}: VisitSummaryPanelProps) {
  const { goBack, transitionTo } = usePatientViewNavigation();

  // Handle back navigation - use store or fallback to prop
  const handleBack = React.useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  }, [onBack, goBack]);

  // Handle view full note - transition to note view
  const handleViewFullNote = React.useCallback(() => {
    transitionTo("note", activity.id);
  }, [transitionTo, activity.id]);

  return (
    <motion.div
      className={cn("flex h-full flex-col", className)}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleBack}
          aria-label="Go back to overview"
          className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 w-10 items-center justify-center rounded-xl transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <Heading level={4} className="text-lg font-semibold sm:text-xl">
            {activity.title}
          </Heading>
          <Text size="sm" muted className="mt-0.5">
            {activity.date}
          </Text>
        </div>
      </div>

      {/* Visit details */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {/* Session Info Card */}
        <Card className="border-border/40 from-muted/30 to-muted/10 overflow-hidden bg-gradient-to-br p-0 shadow-sm">
          <div className="divide-border/30 grid grid-cols-2 divide-x sm:grid-cols-4">
            <div className="p-4">
              <Text
                size="xs"
                muted
                className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
              >
                Duration
              </Text>
              <Text size="sm" className="font-semibold">
                {activity.duration || "30 minutes"}
              </Text>
            </div>
            <div className="p-4">
              <Text
                size="xs"
                muted
                className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
              >
                Provider
              </Text>
              <Text size="sm" className="font-semibold">
                {activity.provider || "Dr. Demo"}
              </Text>
            </div>
            <div className="p-4">
              <Text
                size="xs"
                muted
                className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
              >
                Type
              </Text>
              <Text size="sm" className="font-semibold">
                {activity.appointmentType || activity.title}
              </Text>
            </div>
            <div className="p-4">
              <Text
                size="xs"
                muted
                className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
              >
                Location
              </Text>
              <Text size="sm" className="font-semibold">
                In-office
              </Text>
            </div>
          </div>
        </Card>

        {/* Visit Summary */}
        <section>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg">
              <FileText className="text-primary h-3.5 w-3.5" />
            </div>
            <Text size="sm" className="font-semibold">
              Session Summary
            </Text>
          </div>
          <Card className="border-border/40 bg-white/60 p-4 shadow-sm">
            <Text size="sm" className="text-foreground/80 leading-relaxed">
              {activity.visitSummary || activity.description}
            </Text>
          </Card>
        </section>

        {/* Diagnosis/Focus Areas */}
        {activity.diagnosisCodes && activity.diagnosisCodes.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg">
                <Stethoscope className="text-primary h-3.5 w-3.5" />
              </div>
              <Text size="sm" className="font-semibold">
                Focus Areas
              </Text>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.diagnosisCodes.map((code, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/15 rounded-lg px-3 py-1.5 text-xs font-medium"
                >
                  {code}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Treatment Notes */}
        {activity.treatmentNotes && (
          <section>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg">
                <ClipboardList className="text-primary h-3.5 w-3.5" />
              </div>
              <Text size="sm" className="font-semibold">
                Treatment Notes
              </Text>
            </div>
            <Card className="border-border/40 bg-white/60 p-4 shadow-sm">
              <Text size="sm" className="text-foreground/80 leading-relaxed">
                {activity.treatmentNotes}
              </Text>
            </Card>
          </section>
        )}

        {/* Next Steps */}
        {activity.nextSteps && (
          <section>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <Text size="sm" className="font-semibold">
                Next Steps
              </Text>
            </div>
            <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-amber-50/40 p-4 shadow-sm">
              <Text size="sm" className="leading-relaxed text-amber-900/80">
                {activity.nextSteps}
              </Text>
            </Card>
          </section>
        )}

        {/* Billing Summary */}
        <section>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <Text size="sm" className="font-semibold">
              Billing Summary
            </Text>
          </div>
          <Card className="border-border/40 overflow-hidden bg-white/60 p-0 shadow-sm">
            <div className="divide-border/30 grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Copay Collected
                </Text>
                <Text size="sm" className="font-semibold text-emerald-600">
                  $25.00
                </Text>
              </div>
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Insurance Claim
                </Text>
                <Text size="sm" className="font-semibold">
                  Submitted
                </Text>
              </div>
              <div className="p-4">
                <Text
                  size="xs"
                  muted
                  className="mb-1 text-[10px] font-semibold tracking-wider uppercase"
                >
                  Balance
                </Text>
                <Text size="sm" className="font-semibold">
                  $0.00
                </Text>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Footer with View Note button */}
      <div className="border-border/30 mt-6 flex justify-end border-t pt-4">
        <Button
          className="gap-2 shadow-sm transition-all hover:shadow-md"
          onClick={handleViewFullNote}
        >
          <FileText className="h-4 w-4" />
          View Full Note
        </Button>
      </div>
    </motion.div>
  );
}
