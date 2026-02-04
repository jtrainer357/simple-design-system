"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { format, isSameDay, isToday } from "date-fns";

interface CalendarDateStripProps {
  dates: Date[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export function CalendarDateStrip({
  dates,
  selectedDate,
  onDateSelect,
  className,
}: CalendarDateStripProps) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto pb-2", className)}>
      {dates.map((date, idx) => {
        const isSelected = isSameDay(date, selectedDate);
        const isCurrentDay = isToday(date);

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onDateSelect(date)}
            className={cn(
              "flex min-w-[48px] flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : isCurrentDay
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
            )}
          >
            <span className="text-xs font-medium">{format(date, "EEE")}</span>
            <span className="text-lg font-semibold">{format(date, "d")}</span>
          </button>
        );
      })}
    </div>
  );
}
