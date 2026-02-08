"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { ActivityRow } from "@/design-system/components/ui/activity-row";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { PriorityActionCard } from "@/design-system/components/ui/priority-action-card";
import type { PatientDetail } from "./types";

interface OverviewTabProps {
  patient: PatientDetail;
  onActivitySelect: (activity: PatientDetail["recentActivity"][number]) => void;
}

export function OverviewTab({ patient, onActivitySelect }: OverviewTabProps) {
  return (
    <>
      {/* Prioritized Actions - AI Surfaced */}
      <div className="mb-4 sm:mb-6">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <div className="flex items-center gap-2">
            <Heading level={5} className="text-base sm:text-lg">
              Prioritized Actions
            </Heading>
            <span className="text-primary flex items-center gap-1 text-[10px] font-medium sm:text-xs">
              <Sparkles className="h-3 w-3" />
              AI Surfaced
            </span>
          </div>
          <Button variant="link" className="h-auto p-0 text-xs sm:text-sm">
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
            <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
              <Text size="sm" muted className="text-center">
                No prioritized actions at this time
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <Heading level={5} className="mb-3 text-base sm:mb-4 sm:text-lg">
          Recent Activity
        </Heading>
        <div>
          {patient.recentActivity.map((activity, index) => (
            <ActivityRow
              key={activity.id}
              title={activity.title}
              description={activity.description}
              date={activity.date}
              isRecent={index === 0}
              isLast={index === patient.recentActivity.length - 1}
              onClick={() => onActivitySelect(activity)}
            />
          ))}
          {patient.recentActivity.length === 0 && (
            <Text size="sm" muted className="py-4 text-center">
              No recent activity
            </Text>
          )}
        </div>
      </div>
    </>
  );
}
