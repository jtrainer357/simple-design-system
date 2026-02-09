"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { ActivityRow } from "@/design-system/components/ui/activity-row";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { PriorityActionCard } from "@/design-system/components/ui/priority-action-card";
import { useSelectedIds } from "@/src/lib/stores/patient-view-store";
import type { PatientDetail } from "./types";

interface OverviewTabProps {
  patient: PatientDetail;
  onActivitySelect: (activity: PatientDetail["recentActivity"][number]) => void;
}

export function OverviewTab({ patient, onActivitySelect }: OverviewTabProps) {
  const { selectedVisitId } = useSelectedIds();

  return (
    <div className="flex flex-col gap-8">
      {/* Prioritized Actions - AI Surfaced */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heading level={5} className="text-base font-semibold sm:text-lg">
              Prioritized Actions
            </Heading>
            <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs">
              <Sparkles className="h-3 w-3" />
              AI Surfaced
            </span>
          </div>
          <Button
            variant="link"
            className="text-primary hover:text-primary/80 h-auto p-0 text-xs font-medium sm:text-sm"
          >
            View All
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {(patient.prioritizedActions || []).slice(0, 4).map((action) => (
            <PriorityActionCard
              key={action.id}
              type={action.type}
              title={action.title}
              description={action.description}
              priority={action.priority}
              dueDate={action.dueDate}
              aiConfidence={action.aiConfidence}
            />
          ))}
          {(!patient.prioritizedActions || patient.prioritizedActions.length === 0) && (
            <div className="border-border/60 bg-muted/20 rounded-xl border border-dashed py-10">
              <Text size="sm" muted className="text-center">
                No prioritized actions at this time
              </Text>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <Heading level={5} className="mb-4 text-base font-semibold sm:text-lg">
          Recent Activity
        </Heading>
        <div className="border-border/40 overflow-hidden rounded-xl border bg-white/30">
          {patient.recentActivity.map((activity, index) => (
            <ActivityRow
              key={activity.id}
              title={activity.title}
              description={activity.description}
              date={activity.date}
              isRecent={index === 0}
              isLast={index === patient.recentActivity.length - 1}
              selected={selectedVisitId === activity.id}
              onClick={() => onActivitySelect(activity)}
            />
          ))}
          {patient.recentActivity.length === 0 && (
            <div className="py-10">
              <Text size="sm" muted className="text-center">
                No recent activity
              </Text>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
