"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

interface ActivityRowProps {
  title: string;
  description: string;
  date: string;
  className?: string;
  onClick?: () => void;
}

export function ActivityRow({ title, description, date, className, onClick }: ActivityRowProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer p-3 shadow-sm transition-all hover:shadow-md sm:p-4",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-card-foreground text-sm font-bold">{title}</h4>
          <Text size="sm" muted className="mt-1 line-clamp-2">
            {description}
          </Text>
        </div>
        <Text size="xs" muted className="shrink-0">
          {date}
        </Text>
      </div>
    </Card>
  );
}

export type { ActivityRowProps };
