"use client";

import * as React from "react";
import Link from "next/link";
import { PriorityAction } from "@/design-system/components/ui/priority-action";
import { AIActionCard } from "@/design-system/components/ui/ai-action-card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { demoContext, type OrchestrationContext } from "@/src/lib/orchestration/types";

// Arriving patient data for the top coral card
const arrivingPatient = {
  patientId: "michael-chen",
  patientName: "Michael Chen",
  avatarSrc: "https://randomuser.me/api/portraits/men/75.jpg",
  appointmentTime: "9:30 AM",
  room: "Room 101",
};

// AI Action cards data
const aiActions = [
  {
    patientId: "michael-chen",
    patientName: "Michael Chen",
    avatarSrc: "https://randomuser.me/api/portraits/men/75.jpg",
    mainAction: "A1C results available: 7.2% (↓ from 8.1%)",
    statusIndicators: "EXCELLENT PROGRESS ON TYPE 2 DIABETES MANAGEMENT",
    readyStatus: "Content ready",
    suggestedActions: 3,
    badgeText: "RESULTS READY",
    badgeVariant: "default" as const,
  },
  {
    patientId: "sarah-johnson",
    patientName: "Sarah Johnson",
    avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
    mainAction: "9:00 AM Annual Physical",
    statusIndicators: "INSURANCE VERIFIED • 2 CARE GAPS IDENTIFIED • RECENT MESSAGE FLAGGED",
    readyStatus: "Everything pre-configured",
    suggestedActions: 4,
    badgeText: "FIRST APPT TODAY",
    badgeVariant: "success" as const,
  },
  {
    patientId: "margaret-williams",
    patientName: "Margaret Williams",
    avatarSrc: "https://randomuser.me/api/portraits/women/68.jpg",
    mainAction: "Metformin 500mg: 5 days remaining",
    statusIndicators: "SCHEDULED TODAY AT 10 AM • SAFETY CHECKS COMPLETE",
    readyStatus: "One-click approval",
    badgeText: "URGENT REFILL",
    badgeVariant: "urgent" as const,
  },
];

interface PriorityActionsSectionProps {
  className?: string;
  onSelectPatient?: (context: OrchestrationContext) => void;
}

export function PriorityActionsSection({
  className,
  onSelectPatient,
}: PriorityActionsSectionProps) {
  const initials = arrivingPatient.patientName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <section className={className}>
      <div className="mb-4">
        <Heading level={3} className="text-xl sm:text-2xl">
          Today&apos;s Actions
        </Heading>
        <Text size="xs" muted className="mt-1 tracking-widest uppercase">
          Saturday, Jan 3 •{" "}
          <span className="text-card-foreground font-semibold">39 Appointments</span>
        </Text>
      </div>

      <div className="space-y-4">
        {/* Top coral "arriving" card */}
        <Link href={`/patients/${arrivingPatient.patientId}`} className="block">
          <PriorityAction
            title={`${arrivingPatient.patientName} is arriving`}
            subtitle={`${arrivingPatient.appointmentTime} appointment • ${arrivingPatient.room}`}
            avatarInitials={initials}
            avatarSrc={arrivingPatient.avatarSrc}
            buttonText="Begin Check-in"
            onButtonClick={() => {}}
          />
        </Link>

        {/* AI Action Cards list */}
        <div className="space-y-2">
          {aiActions.map((action) => {
            // For Michael Chen "Results Ready" card, use onClick for dynamic canvas
            const isResultsReadyCard =
              action.patientId === "michael-chen" && action.badgeText === "RESULTS READY";

            if (isResultsReadyCard && onSelectPatient) {
              return (
                <div
                  key={`${action.patientId}-${action.badgeText}`}
                  onClick={() => onSelectPatient(demoContext)}
                  className="block cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectPatient(demoContext);
                    }
                  }}
                >
                  <AIActionCard
                    patientName={action.patientName}
                    avatarSrc={action.avatarSrc}
                    mainAction={action.mainAction}
                    statusIndicators={action.statusIndicators}
                    readyStatus={action.readyStatus}
                    suggestedActions={action.suggestedActions}
                    badgeText={action.badgeText}
                    badgeVariant={action.badgeVariant}
                  />
                </div>
              );
            }

            return (
              <Link
                key={`${action.patientId}-${action.badgeText}`}
                href={`/patients/${action.patientId}`}
                className="block"
              >
                <AIActionCard
                  patientName={action.patientName}
                  avatarSrc={action.avatarSrc}
                  mainAction={action.mainAction}
                  statusIndicators={action.statusIndicators}
                  readyStatus={action.readyStatus}
                  suggestedActions={action.suggestedActions}
                  badgeText={action.badgeText}
                  badgeVariant={action.badgeVariant}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
