"use client";

import * as React from "react";
import { Sparkles, CheckCircle } from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { Heading } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { PriorityActionCard } from "./PriorityActionCard";
import {
  usePatientPriorityActions,
  useCompleteAction,
  useDismissAction,
  useSnoozeAction,
} from "@/src/lib/queries/use-priority-actions";
import { useToast } from "@/src/hooks/useToast";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import type { SuggestedAction, SnoozeDuration } from "@/src/lib/triggers";

/**
 * Props for Patient360PriorityActions component
 */
export interface Patient360PriorityActionsProps {
  patientId: string;
  patientName: string;
  practiceId?: string;
  onActionClick?: (action: SuggestedAction) => void;
  className?: string;
}

/**
 * Priority Actions section for Patient 360 view.
 * Shows patient-specific priority actions at the top of the Overview tab.
 */
export function Patient360PriorityActions({
  patientId,
  patientName,
  practiceId = DEMO_PRACTICE_ID,
  onActionClick,
  className,
}: Patient360PriorityActionsProps) {
  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  // Fetch patient-specific actions
  const { data: actions, isLoading, error } = usePatientPriorityActions(patientId, practiceId);

  // Mutations
  const completeAction = useCompleteAction(practiceId);
  const dismissAction = useDismissAction(practiceId);
  const snoozeAction = useSnoozeAction(practiceId);

  // Track completed/dismissed for optimistic updates
  const [hiddenIds, setHiddenIds] = React.useState<Set<string>>(new Set());

  const handleComplete = async (actionId: string) => {
    setHiddenIds((prev) => new Set([...prev, actionId]));
    try {
      await completeAction.mutateAsync(actionId);
    } catch {
      setHiddenIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
      showError("Failed to complete action");
    }
  };

  const handleDismiss = async (actionId: string, reason?: string) => {
    setHiddenIds((prev) => new Set([...prev, actionId]));
    try {
      await dismissAction.mutateAsync({ actionId, reason });
    } catch {
      setHiddenIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
      showError("Failed to dismiss action");
    }
  };

  const handleSnooze = async (actionId: string, duration: SnoozeDuration) => {
    setHiddenIds((prev) => new Set([...prev, actionId]));
    try {
      await snoozeAction.mutateAsync({ actionId, duration });
    } catch {
      setHiddenIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
      showError("Failed to snooze action");
    }
  };

  // Filter out hidden actions
  const visibleActions = actions?.filter((a) => !hiddenIds.has(a.id)) || [];

  // Loading state - show subtle skeleton
  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="bg-muted mb-3 h-6 w-48 rounded" />
        <div className="bg-muted/50 h-24 rounded-lg" />
      </div>
    );
  }

  // Error state - show subtle message
  if (error) {
    return null; // Silent fail - don't disrupt the patient view
  }

  // No actions - show subtle message
  if (visibleActions.length === 0) {
    return (
      <div
        className={cn(
          "border-teal/30 bg-teal/5 flex items-center gap-3 rounded-lg border border-dashed p-4",
          className
        )}
      >
        <div className="bg-teal/10 flex h-10 w-10 items-center justify-center rounded-full">
          <CheckCircle className="text-teal h-5 w-5" />
        </div>
        <div>
          <p className="text-foreground-strong text-sm font-medium">
            No priority actions for {patientName}
          </p>
          <p className="text-muted-foreground text-xs">All clinical items are up to date</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      {/* Section Header */}
      <div className="mb-3 flex items-center gap-2">
        <Heading level={5} className="text-base sm:text-lg">
          Priority Actions
        </Heading>
        <Badge
          variant="secondary"
          className="bg-teal/10 text-teal flex items-center gap-1 rounded-full border-none px-2 py-0.5 text-[10px] font-medium sm:text-xs"
        >
          <Sparkles className="h-3 w-3" />
          AI Surfaced
        </Badge>
        <span className="text-muted-foreground ml-auto text-xs">
          {visibleActions.length} action{visibleActions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Action Cards */}
      <div className="flex flex-col gap-3">
        {visibleActions.map((action) => (
          <PriorityActionCard
            key={action.id}
            id={action.id}
            title={action.title}
            urgency={action.urgency}
            confidence={action.confidence}
            timeFrame={action.timeFrame}
            context={action.context}
            suggestedActions={action.suggestedActions}
            onComplete={handleComplete}
            onDismiss={handleDismiss}
            onSnooze={handleSnooze}
            onActionClick={onActionClick}
          />
        ))}
      </div>
    </div>
  );
}
