"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import { usePatientViewNavigation } from "@/src/lib/stores/patient-view-store";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface RecentActivityTimelineProps {
  activities: ActivityItem[];
  className?: string;
  /** Optional custom click handler - if not provided, uses store navigation */
  onActivityClick?: (activity: ActivityItem) => void;
  /** Currently selected activity ID for highlighting */
  selectedActivityId?: string;
}

export function RecentActivityTimeline({
  activities,
  className,
  onActivityClick,
  selectedActivityId,
}: RecentActivityTimelineProps) {
  const { transitionTo } = usePatientViewNavigation();
  const displayActivities = activities.slice(0, 5);

  // Handle activity click - use custom handler or default to store transition
  const handleActivityClick = React.useCallback(
    (activity: ActivityItem) => {
      if (onActivityClick) {
        onActivityClick(activity);
      } else {
        transitionTo("summary", activity.id);
      }
    },
    [onActivityClick, transitionTo]
  );

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
            {displayActivities.map((activity, index) => {
              const isSelected = selectedActivityId === activity.id;

              return (
                <motion.div
                  key={activity.id}
                  className={cn("relative flex gap-4 pl-6", "cursor-pointer")}
                  onClick={() => handleActivityClick(activity)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleActivityClick(activity);
                    }
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.2,
                  }}
                  aria-pressed={isSelected}
                >
                  {/* Timeline dot */}
                  <motion.div
                    className={cn(
                      "absolute top-1.5 left-0 h-4 w-4 rounded-full border-2 transition-colors",
                      isSelected
                        ? "bg-primary border-primary/30"
                        : index === 0
                          ? "bg-primary border-white"
                          : "bg-muted-foreground/40 border-white"
                    )}
                    animate={
                      isSelected
                        ? {
                            scale: [1, 1.2, 1],
                            transition: { duration: 0.3 },
                          }
                        : {}
                    }
                  />

                  {/* Content */}
                  <div
                    className={cn(
                      "min-w-0 flex-1 rounded-lg p-3 shadow-sm transition-all",
                      isSelected
                        ? "bg-primary/5 ring-primary/20 ring-2"
                        : "bg-white/50 hover:bg-white/80 hover:shadow-md"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4
                          className={cn(
                            "text-sm font-semibold",
                            isSelected ? "text-primary" : "text-foreground-strong"
                          )}
                        >
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
                </motion.div>
              );
            })}
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
