"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

interface PatientStatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  className?: string;
}

export function PatientStatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  className,
}: PatientStatCardProps) {
  return (
    <Card className={cn("flex items-center gap-3 p-3 sm:gap-4 sm:p-4", className)}>
      {Icon && (
        <div className="bg-accent/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12">
          <Icon className="text-teal h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      )}
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

export type { PatientStatCardProps };
