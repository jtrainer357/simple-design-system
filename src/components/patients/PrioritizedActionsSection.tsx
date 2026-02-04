"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Heading } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { PrioritizedActionCard, type PrioritizedAction } from "./PrioritizedActionCard";

interface PrioritizedActionsSectionProps {
  actions: PrioritizedAction[];
  onActionClick?: (action: PrioritizedAction) => void;
  onViewAllClick?: () => void;
  className?: string;
}

export function PrioritizedActionsSection({
  actions,
  onActionClick,
  onViewAllClick,
  className,
}: PrioritizedActionsSectionProps) {
  return (
    <div className={cn("", className)}>
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div className="flex items-center gap-2">
          <Heading level={5} className="text-base sm:text-lg">
            Prioritized Actions
          </Heading>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary flex items-center gap-1 rounded-full border-none px-2 py-0.5 text-[10px] font-medium sm:text-xs"
          >
            <Sparkles className="h-3 w-3" />
            AI Surfaced
          </Badge>
        </div>
        {onViewAllClick && (
          <Button variant="link" className="h-auto p-0 text-xs sm:text-sm" onClick={onViewAllClick}>
            View All
          </Button>
        )}
      </div>

      {/* Action Cards */}
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <PrioritizedActionCard key={action.id} action={action} onClick={onActionClick} />
        ))}
      </div>
    </div>
  );
}

// Demo data for the 4 prioritized actions
export const demoPrioritizedActions: PrioritizedAction[] = [
  {
    id: "1",
    title: "Elevated A1C Levels Detected",
    description: "Latest lab results show A1C at 7.8%. Consider diabetes management review.",
    urgency: "urgent",
    timeframe: "Immediate",
    confidence: 94,
    icon: "alert-triangle",
    patientId: "demo-patient",
    suggestedActions: [
      "Schedule endocrinology consult",
      "Review current medication regimen",
      "Order comprehensive metabolic panel",
    ],
  },
  {
    id: "2",
    title: "Medication Refill Due",
    description: "Metformin prescription expires in 5 days. Patient has 3-day supply remaining.",
    urgency: "high",
    timeframe: "Within 3 days",
    confidence: 98,
    icon: "pill",
    patientId: "demo-patient",
    suggestedActions: [
      "Send prescription refill",
      "Verify pharmacy on file",
      "Check for drug interactions",
    ],
  },
  {
    id: "3",
    title: "Annual Wellness Visit Overdue",
    description: "Last comprehensive exam was 14 months ago. Schedule preventive care visit.",
    urgency: "medium",
    timeframe: "This month",
    confidence: 87,
    icon: "calendar",
    patientId: "demo-patient",
    suggestedActions: [
      "Schedule annual wellness visit",
      "Prepare preventive care checklist",
      "Send appointment reminder",
    ],
  },
  {
    id: "4",
    title: "Depression Screening Recommended",
    description: "PHQ-9 indicated mild symptoms at last visit. Follow-up assessment suggested.",
    urgency: "medium",
    timeframe: "Next visit",
    confidence: 82,
    icon: "brain",
    patientId: "demo-patient",
    suggestedActions: [
      "Administer PHQ-9 at next visit",
      "Consider behavioral health referral",
      "Review current mental health treatment",
    ],
  },
];

export type { PrioritizedActionsSectionProps };
