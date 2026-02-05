"use client";

import * as React from "react";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

interface ActivityRowProps {
  title: string;
  description: string;
  date: string;
  isRecent?: boolean;
  isLast?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ActivityRow({
  title,
  description,
  date,
  isRecent = false,
  isLast = false,
  className,
  onClick,
}: ActivityRowProps) {
  return (
    <div className={cn("flex items-stretch gap-4 pl-0.5", className)} onClick={onClick}>
      {/* Timeline column with dot and connecting line */}
      <div className="relative flex flex-col items-center">
        {/* Dot - solid fill with white ring outline */}
        <div
          className={cn(
            "relative z-10 mt-4 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white",
            isRecent ? "bg-[#FF8D6E]" : "bg-stone-300"
          )}
        />
        {/* Vertical dashed line (hidden for last item) */}
        {!isLast && (
          <div className="absolute top-7 bottom-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-stone-300" />
        )}
      </div>

      {/* Card content */}
      <div
        className={cn(
          "mb-3 flex-1 cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
          "border border-stone-100"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-card-foreground text-sm font-semibold">{title}</h4>
            <Text size="sm" muted className="mt-1 line-clamp-2">
              {description}
            </Text>
          </div>
          <Text size="xs" muted className="shrink-0 whitespace-nowrap">
            {date}
          </Text>
        </div>
      </div>
    </div>
  );
}

export type { ActivityRowProps };
