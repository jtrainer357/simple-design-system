"use client";

import * as React from "react";
import { PriorityActionCard, PriorityAction } from "./priority-action-card";
import { Heading, Text } from "@/design-system/components/ui/typography";

// Demo Data - 4 Priority Actions as specified
const priorityActions: PriorityAction[] = [
  {
    id: "action-1",
    patientId: "michael-chen",
    patientName: "Michael Chen",
    patientAvatar: "https://randomuser.me/api/portraits/men/75.jpg",
    appointmentTime: "11:00 AM - Psychotherapy Session",
    actionType: "results_ready",
    description:
      "A1C results available: 7.2% (down from 8.1%) - Excellent progress on diabetes management",
    metadata: "Content ready + 3 suggested actions",
    ctaLabel: "Begin Check-In",
  },
  {
    id: "action-2",
    patientId: "sarah-johnson",
    patientName: "Sarah Johnson",
    patientAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    appointmentTime: "2:00 PM - Initial Consultation",
    actionType: "first_appt",
    description: "First appointment today - Review intake forms and prepare welcome materials",
    metadata: "Everything pre-configured + 4 suggested actions",
    ctaLabel: "Begin Check-In",
  },
  {
    id: "action-3",
    patientId: "margaret-williams",
    patientName: "Margaret Williams",
    patientAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    appointmentTime: "ASAP - Medication Review",
    actionType: "urgent_refill",
    description: "Metformin 500mg: 5 days remaining - Patient messaged about running low",
    metadata: "One-click approval ready",
    ctaLabel: "Approve Refill",
  },
  {
    id: "action-4",
    patientId: "david-park",
    patientName: "David Park",
    patientAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    appointmentTime: "4:30 PM - Follow-Up Session",
    actionType: "priority_action",
    description: "PHQ-9 score increased to 15 - Depression screening indicates moderate symptoms",
    metadata: "Assessment tools ready + 2 suggested actions",
    ctaLabel: "Begin Check-In",
  },
];

interface PriorityActionsSectionProps {
  className?: string;
}

export function PriorityActionsSection({ className }: PriorityActionsSectionProps) {
  return (
    <section className={className}>
      <div className="mb-4">
        <Heading level={3} className="text-xl sm:text-2xl">
          Priority Actions
        </Heading>
        <Text size="xs" muted className="mt-1 tracking-widest uppercase">
          AI-surfaced items requiring your attention
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {priorityActions.map((action) => (
          <PriorityActionCard key={action.id} action={action} />
        ))}
      </div>
    </section>
  );
}
