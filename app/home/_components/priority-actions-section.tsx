"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { PriorityAction } from "@/design-system/components/ui/priority-action";
import { AIActionCard } from "@/design-system/components/ui/ai-action-card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { AlertTriangle, Database } from "lucide-react";
import { PriorityActionCardSkeleton, Skeleton } from "@/design-system/components/ui/skeleton";
import { Button } from "@/design-system/components/ui/button";
import { getPriorityActions } from "@/src/lib/queries/priority-actions";
import { getTodayAppointments } from "@/src/lib/queries/appointments";
import { isDatabasePopulated } from "@/src/lib/queries/practice";
import { formatDemoDate } from "@/src/lib/utils/demo-date";
import type { PriorityActionWithPatient } from "@/src/lib/supabase/types";
import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";
import type { OrchestrationContext } from "@/src/lib/orchestration/types";

interface PriorityActionsSectionProps {
  className?: string;
  onSelectPatient?: (context: OrchestrationContext) => void;
  hideHeader?: boolean;
}

// Exported header component for use in parent layouts
interface TodaysActionsHeaderProps {
  appointmentCount: number;
  isLoading?: boolean;
}

export function TodaysActionsHeader({ appointmentCount, isLoading }: TodaysActionsHeaderProps) {
  const formattedDate = formatDemoDate("long");

  return (
    <div className="flex items-center gap-4">
      <Image src="/icons/caring-hands.png" alt="" width={56} height={56} className="shrink-0" />
      <div className="flex-1">
        <Heading level={3} className="text-xl sm:text-2xl">
          Today&apos;s Actions
        </Heading>
        <Text size="xs" muted className="mt-1 tracking-widest uppercase">
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              {formattedDate} •{" "}
              <span className="text-card-foreground font-semibold">
                {appointmentCount} Appointments
              </span>
            </>
          )}
        </Text>
      </div>
      <Button variant="outline" className="shrink-0">
        Complete All Actions
      </Button>
    </div>
  );
}

// Map urgency to badge variant
function getBadgeVariant(urgency: string): "urgent" | "warning" | "success" | "default" {
  switch (urgency) {
    case "urgent":
      return "urgent";
    case "high":
      return "warning";
    case "medium":
      return "success";
    default:
      return "default";
  }
}

// Map urgency to badge text
function getBadgeText(urgency: string, timeframe: string | null): string {
  if (urgency === "urgent") return "URGENT";
  if (timeframe === "Immediate" || timeframe === "Today") return "TODAY";
  if (timeframe === "Within 3 days") return "WITHIN 3 DAYS";
  return "ACTION NEEDED";
}

// Convert database action to OrchestrationContext for the detail view
function actionToContext(action: PriorityActionWithPatient): OrchestrationContext {
  const patient = action.patient;
  return {
    patient: {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      mrn: patient.id.substring(0, 8),
      dob: patient.date_of_birth,
      age: Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      ),
      primaryDiagnosis: action.clinical_context || "Mental Health",
      avatar: patient.avatar_url || `https://i.pravatar.cc/150?u=${patient.id}`,
    },
    trigger: {
      type: "screening",
      title: action.title,
      urgency:
        action.urgency === "urgent" ? "urgent" : action.urgency === "high" ? "high" : "medium",
    },
    clinicalData: {},
    suggestedActions: ((action.suggested_actions as string[]) || []).map((suggestion, i) => ({
      id: String(i + 1),
      label: suggestion,
      type: "task",
      checked: true,
    })),
  };
}

// Convert appointment to OrchestrationContext for the detail view
function appointmentToContext(apt: AppointmentWithPatient): OrchestrationContext {
  const patient = apt.patient;
  return {
    patient: {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      mrn: patient.id.substring(0, 8),
      dob: patient.date_of_birth,
      age: Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      ),
      primaryDiagnosis: apt.service_type || "General Visit",
      avatar: patient.avatar_url || `https://i.pravatar.cc/150?u=${patient.id}`,
    },
    trigger: {
      type: "appointment",
      title: `${apt.service_type} Appointment`,
      urgency: "medium",
    },
    clinicalData: {},
    suggestedActions: [],
  };
}

export function PriorityActionsSection({
  className,
  onSelectPatient,
  hideHeader = false,
}: PriorityActionsSectionProps) {
  const [actions, setActions] = React.useState<PriorityActionWithPatient[]>([]);
  const [todayAppts, setTodayAppts] = React.useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dbReady, setDbReady] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Check if database is populated
        const populated = await isDatabasePopulated();
        setDbReady(populated);

        if (!populated) {
          setLoading(false);
          return;
        }

        // Fetch priority actions and today's appointments in parallel
        const [actionsData, apptsData] = await Promise.all([
          getPriorityActions(),
          getTodayAppointments(),
        ]);

        setActions(actionsData.slice(0, 3)); // Show top 3
        setTodayAppts(apptsData);
      } catch (err) {
        console.error("Failed to load priority actions:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Format demo date (Feb 6, 2026)
  const formattedDate = formatDemoDate("long");

  // Get the first arriving/scheduled patient
  const arrivingPatient = todayAppts.find((a) => a.status === "Scheduled") || todayAppts[0];

  // Loading state with skeleton
  if (loading) {
    return (
      <section className={className}>
        <div className="mb-14 flex items-center gap-4">
          <Image src="/icons/caring-hands.png" alt="" width={56} height={56} className="shrink-0" />
          <div className="flex-1">
            <Heading level={3} className="text-xl sm:text-2xl">
              Today&apos;s Actions
            </Heading>
            <Text size="xs" muted className="mt-1 tracking-widest uppercase">
              <Skeleton as="span" className="inline-block h-3 w-48" />
            </Text>
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        {/* Arriving patient skeleton */}
        <div className="bg-priority-bg/30 mb-10 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <Skeleton className="h-16 w-16 shrink-0 rounded-full sm:h-20 sm:w-20" />
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-2 h-3 w-24" />
                <Skeleton className="mb-2 h-7 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-12 w-32 rounded-full" />
            </div>
          </div>
        </div>
        {/* Action cards skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <PriorityActionCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // Database not populated state
  if (dbReady === false) {
    return (
      <section className={className}>
        <div className="mb-10 flex items-center gap-4">
          <Image src="/icons/caring-hands.png" alt="" width={56} height={56} className="shrink-0" />
          <div>
            <Heading level={3} className="text-xl sm:text-2xl">
              Today&apos;s Actions
            </Heading>
            <Text size="xs" muted className="mt-1 tracking-widest uppercase">
              {formattedDate}
            </Text>
          </div>
        </div>
        <div className="border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Database className="text-muted-foreground/50 h-12 w-12" />
          <Text size="sm" muted className="mt-4 text-center">
            No data imported yet.
          </Text>
          <Text size="xs" muted className="mt-1 max-w-sm text-center">
            Run the import wizard to populate the database with patient data and generate AI-powered
            priority actions.
          </Text>
          <Link href="/import" className="mt-4">
            <Button variant="default" size="sm">
              Start Import
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={className}>
        <div className="mb-10 flex items-center gap-4">
          <Image src="/icons/caring-hands.png" alt="" width={56} height={56} className="shrink-0" />
          <div>
            <Heading level={3} className="text-xl sm:text-2xl">
              Today&apos;s Actions
            </Heading>
            <Text size="xs" muted className="mt-1 tracking-widest uppercase">
              {formattedDate}
            </Text>
          </div>
        </div>
        <div className="border-destructive/30 bg-destructive/10 flex flex-col items-center justify-center rounded-lg border py-12">
          <AlertTriangle className="text-destructive h-8 w-8" />
          <Text size="sm" className="text-destructive mt-3">
            {error}
          </Text>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  // Empty state
  if (actions.length === 0) {
    return (
      <section className={className}>
        <div className="mb-10 flex items-center gap-4">
          <Image src="/icons/caring-hands.png" alt="" width={56} height={56} className="shrink-0" />
          <div>
            <Heading level={3} className="text-xl sm:text-2xl">
              Today&apos;s Actions
            </Heading>
            <Text size="xs" muted className="mt-1 tracking-widest uppercase">
              {formattedDate} •{" "}
              <span className="text-card-foreground font-semibold">
                {todayAppts.length} Appointments
              </span>
            </Text>
          </div>
        </div>
        <div className="border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Text size="sm" muted className="text-center">
            All caught up! No priority actions right now.
          </Text>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      {!hideHeader && (
        <div className="mb-14 flex items-center gap-4">
          <Image src="/icons/caring-hands.png" alt="" width={56} height={56} className="shrink-0" />
          <div className="flex-1">
            <Heading level={3} className="text-xl sm:text-2xl">
              Today&apos;s Actions
            </Heading>
            <Text size="xs" muted className="mt-1 tracking-widest uppercase">
              {formattedDate} •{" "}
              <span className="text-card-foreground font-semibold">
                {todayAppts.length} Appointments
              </span>
            </Text>
          </div>
          <Button variant="outline" className="shrink-0">
            Complete All Actions
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {/* Top coral "arriving" card - if there's an arriving patient */}
        {arrivingPatient && (
          <div
            onClick={() => onSelectPatient?.(appointmentToContext(arrivingPatient))}
            className="mb-10 block cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelectPatient?.(appointmentToContext(arrivingPatient));
              }
            }}
          >
            <PriorityAction
              title={`${arrivingPatient.patient.first_name} ${arrivingPatient.patient.last_name} is arriving`}
              subtitle={`${arrivingPatient.start_time} appointment • ${arrivingPatient.service_type}`}
              avatarInitials={`${arrivingPatient.patient.first_name[0]}${arrivingPatient.patient.last_name[0]}`}
              avatarSrc={arrivingPatient.patient.avatar_url || undefined}
              secondaryButtonText="View Suggested Actions"
              onSecondaryButtonClick={() => {}}
              buttonText="Begin Check-in"
              onButtonClick={() => {}}
            />
          </div>
        )}

        {/* AI Action Cards from database */}
        <div className="space-y-2">
          {actions.map((action) => {
            const patientName = `${action.patient.first_name} ${action.patient.last_name}`;
            const suggestedCount = Array.isArray(action.suggested_actions)
              ? (action.suggested_actions as string[]).length
              : 0;

            return (
              <div
                key={action.id}
                onClick={() => onSelectPatient?.(actionToContext(action))}
                className="block cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectPatient?.(actionToContext(action));
                  }
                }}
              >
                <AIActionCard
                  patientName={patientName}
                  avatarSrc={action.patient.avatar_url || undefined}
                  mainAction={action.title}
                  statusIndicators={action.description || action.clinical_context || ""}
                  readyStatus={`Confidence: ${action.confidence_score || 85}%`}
                  suggestedActions={suggestedCount}
                  badgeText={getBadgeText(action.urgency, action.timeframe)}
                  badgeVariant={getBadgeVariant(action.urgency)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
