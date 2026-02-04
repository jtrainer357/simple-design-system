"use client";

import * as React from "react";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface RecentActivityTimelineProps {
  activities: ActivityItem[];
  className?: string;
  onActivityClick?: (activity: ActivityItem) => void;
}

export function RecentActivityTimeline({
  activities,
  className,
  onActivityClick,
}: RecentActivityTimelineProps) {
  const displayActivities = activities.slice(0, 5);

  return (
    <div className={cn("", className)}>
      <h3 className="text-foreground-strong mb-4 text-base font-medium sm:text-lg">
        Recent Activity
      </h3>

      {displayActivities.length === 0 ? (
        <Text size="sm" muted className="py-4 text-center">
          No recent activity
        </Text>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="border-border/60 absolute top-2 bottom-2 left-[7px] w-px border-l-2 border-dashed" />

          {/* Activities */}
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  "relative flex gap-4 pl-6",
                  onActivityClick && "cursor-pointer hover:opacity-80"
                )}
                onClick={() => onActivityClick?.(activity)}
                role={onActivityClick ? "button" : undefined}
                tabIndex={onActivityClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onActivityClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onActivityClick(activity);
                  }
                }}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute top-1.5 left-0 h-4 w-4 rounded-full border-2 border-white",
                    index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                  )}
                />

                {/* Content */}
                <div className="min-w-0 flex-1 rounded-lg bg-white/50 p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-foreground-strong text-sm font-semibold">
                        {activity.title}
                      </h4>
                      <Text size="sm" muted className="mt-1 line-clamp-2">
                        {activity.description}
                      </Text>
                    </div>
                    <Text size="xs" muted className="shrink-0 whitespace-nowrap">
                      {activity.date}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Demo activities data
export const demoActivities: ActivityItem[] = [
  {
    id: "1",
    title: "Psychotherapy Session",
    description:
      "60-minute individual therapy session. Discussed coping strategies and medication compliance.",
    date: "Jan 14, 2026",
  },
  {
    id: "2",
    title: "Medication Review",
    description:
      "Reviewed current prescriptions. Adjusted Metformin dosage based on recent A1C results.",
    date: "Jan 10, 2026",
  },
  {
    id: "3",
    title: "Lab Results Received",
    description: "Comprehensive metabolic panel results available. A1C elevated at 7.8%.",
    date: "Jan 8, 2026",
  },
  {
    id: "4",
    title: "Phone Consultation",
    description: "Patient called regarding prescription refill. Authorized 30-day supply.",
    date: "Jan 5, 2026",
  },
  {
    id: "5",
    title: "Appointment Scheduled",
    description: "Follow-up appointment scheduled for medication management.",
    date: "Dec 28, 2025",
  },
];

export type { RecentActivityTimelineProps };
