"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Checked In"
  | "In Progress"
  | "Completed"
  | "Cancelled";

interface AppointmentPreviewCardProps {
  status: AppointmentStatus;
  date: string;
  time: string;
  type: string;
  provider: string;
  className?: string;
  onClick?: () => void;
}

export function AppointmentPreviewCard({
  status,
  date,
  time,
  type,
  provider,
  className,
  onClick,
}: AppointmentPreviewCardProps) {
  return (
    <Card className={cn("cursor-pointer p-3 transition-all sm:p-4", className)} onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Status Badge */}
          <Badge
            variant="outline"
            className="text-teal bg-accent/50 mb-2 rounded-md border-none px-2 py-0.5 text-xs font-medium sm:mb-3"
          >
            {status}
          </Badge>

          {/* Date and Time */}
          <Heading level={4} className="text-base sm:text-lg">
            {date}
          </Heading>
          <Text size="sm" muted>
            {time}
          </Text>

          {/* Type and Provider */}
          <div className="mt-2 flex items-center justify-between gap-2 sm:mt-3">
            <Text size="xs" muted className="truncate">
              {type}
            </Text>
            <Text size="xs" weight="medium" className="text-card-foreground shrink-0">
              {provider}
            </Text>
          </div>
        </div>

        {/* Calendar Icon */}
        <div className="bg-accent/30 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10">
          <Calendar className="text-teal h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </Card>
  );
}

export type { AppointmentPreviewCardProps, AppointmentStatus };
