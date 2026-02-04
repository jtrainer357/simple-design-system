"use client";

import * as React from "react";
import { Calendar, CalendarClock, DollarSign, type LucideIcon } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  className?: string;
}

function MetricCard({ icon: Icon, label, value, subtitle, className }: MetricCardProps) {
  return (
    <Card className={cn("flex items-center gap-3 p-3 sm:gap-4 sm:p-4", className)}>
      <div className="bg-accent/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12">
        <Icon className="text-teal h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <Text size="xs" muted className="font-bold tracking-wider uppercase">
          {label}
        </Text>
        <Heading level={4} className="mt-0.5 truncate text-lg sm:text-xl">
          {value}
        </Heading>
        {subtitle && (
          <Text size="xs" muted className="mt-0.5">
            {subtitle}
          </Text>
        )}
      </div>
    </Card>
  );
}

export interface PatientMetricsData {
  lastVisit: {
    date: string;
    type: string;
  };
  appointments: {
    total: number;
    dateRange: string;
  };
  balance: {
    amount: string;
    type: string;
  };
}

interface PatientMetricsProps {
  metrics: PatientMetricsData;
  className?: string;
}

export function PatientMetrics({ metrics, className }: PatientMetricsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4", className)}>
      <MetricCard
        icon={Calendar}
        label="Last Visit"
        value={metrics.lastVisit.date}
        subtitle={metrics.lastVisit.type}
      />
      <MetricCard
        icon={CalendarClock}
        label="Appointments"
        value={`${metrics.appointments.total} Total`}
        subtitle={metrics.appointments.dateRange}
      />
      <MetricCard
        icon={DollarSign}
        label="Balance"
        value={metrics.balance.amount}
        subtitle={metrics.balance.type}
      />
    </div>
  );
}

export type { PatientMetricsProps };
