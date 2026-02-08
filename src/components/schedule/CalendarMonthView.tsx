"use client";

import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { cn } from "@/design-system/lib/utils";
import { type AppointmentStatus } from "@/src/lib/supabase/scheduling-types";

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
}

interface CalendarMonthViewProps {
  date: Date;
  appointments: Appointment[];
  onDayClick: (date: Date) => void;
  showWeekends?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({
  date,
  appointments,
  onDayClick,
  showWeekends = true,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const filteredDays = showWeekends
    ? days
    : days.filter((d) => d.getDay() !== 0 && d.getDay() !== 6);
  const weekdayHeaders = showWeekends ? WEEKDAYS : WEEKDAYS.filter((_, i) => i !== 0 && i !== 6);

  const appointmentCounts = new Map<string, number>();
  appointments
    .filter((apt) => apt.status !== "Cancelled")
    .forEach((apt) => {
      const count = appointmentCounts.get(apt.date) || 0;
      appointmentCounts.set(apt.date, count + 1);
    });

  return (
    <div className="flex flex-1 flex-col">
      <div className={cn("grid gap-1", showWeekends ? "grid-cols-7" : "grid-cols-5")}>
        {weekdayHeaders.map((day) => (
          <div
            key={day}
            className="text-muted-foreground flex h-10 items-center justify-center text-sm font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      <div className={cn("grid flex-1 gap-1", showWeekends ? "grid-cols-7" : "grid-cols-5")}>
        {filteredDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const count = appointmentCounts.get(dateKey) || 0;
          const isCurrentMonth = isSameMonth(day, date);
          const isDayToday = isToday(day);

          return (
            <button
              key={dateKey}
              onClick={() => onDayClick(day)}
              className={cn(
                "hover:bg-muted/50 focus:ring-primary min-h-24 rounded-lg border p-2 text-left transition-all focus:ring-2 focus:outline-none",
                !isCurrentMonth && "opacity-40",
                isDayToday && "ring-primary bg-primary/5 ring-2"
              )}
            >
              <div className={cn("mb-1 text-sm font-medium", isDayToday && "text-primary")}>
                {format(day, "d")}
              </div>
              {count > 0 && (
                <div className="text-muted-foreground text-xs">
                  {count} appointment{count !== 1 ? "s" : ""}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
