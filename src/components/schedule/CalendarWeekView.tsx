"use client";

import * as React from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { cn } from "@/design-system/lib/utils";

interface WeekAppointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  patient_name: string;
  service_type?: string;
  appointment_type?: string;
}

interface CalendarWeekViewProps {
  currentDate: Date;
  appointments: WeekAppointment[];
  onAppointmentClick?: (apt: WeekAppointment) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  showWeekends?: boolean;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

export function CalendarWeekView({
  currentDate,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  showWeekends = false,
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const daysToShow = showWeekends ? 7 : 5;
  const weekDays = Array.from({ length: daysToShow }, (_, i) =>
    showWeekends ? addDays(weekStart, i) : addDays(weekStart, i + 1)
  );

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const getAppointmentStyle = (apt: WeekAppointment) => {
    const startParts = apt.start_time.split(":").map(Number);
    const endParts = apt.end_time.split(":").map(Number);
    const startH = startParts[0] ?? 9;
    const startM = startParts[1] ?? 0;
    const endH = endParts[0] ?? 10;
    const endM = endParts[1] ?? 0;
    const startMinutes = (startH - 8) * 60 + startM;
    const duration = (endH - startH) * 60 + (endM - startM);
    return {
      top: `${(startMinutes / 60) * 60}px`,
      height: `${Math.max(30, (duration / 60) * 60)}px`,
    };
  };

  const statusColors: Record<string, string> = {
    Scheduled: "bg-growth-2/80 border-growth-4",
    Confirmed: "bg-growth-3/80 border-growth-5",
    "In Session": "bg-vitality-2/80 border-vitality-4",
    Completed: "bg-synapse-2/80 border-synapse-4",
    "No-Show": "bg-red-200 border-red-400",
    Cancelled: "bg-muted border-muted-foreground/30 line-through",
  };

  return (
    <div className="rounded-lg border bg-white">
      {/* Header */}
      <div
        className="grid border-b"
        style={{ gridTemplateColumns: `60px repeat(${daysToShow}, 1fr)` }}
      >
        <div className="border-r p-2" />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "border-r p-2 text-center last:border-r-0",
              isSameDay(day, new Date()) && "bg-growth-1/30"
            )}
          >
            <div className="text-muted-foreground text-xs font-medium">{format(day, "EEE")}</div>
            <div
              className={cn("text-lg font-semibold", isSameDay(day, new Date()) && "text-growth-6")}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div
        className="relative grid"
        style={{ gridTemplateColumns: `60px repeat(${daysToShow}, 1fr)` }}
      >
        {/* Time labels */}
        <div className="border-r">
          {HOURS.map((hour) => (
            <div key={hour} className="relative h-[60px] border-b pr-2 text-right">
              <span className="text-muted-foreground absolute -top-2 right-2 text-xs">
                {hour > 12 ? `${hour - 12}pm` : hour === 12 ? "12pm" : `${hour}am`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="relative border-r last:border-r-0">
            {/* Hour slots */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="hover:bg-muted/30 h-[60px] cursor-pointer border-b transition-colors"
                onClick={() => onTimeSlotClick?.(day, `${hour.toString().padStart(2, "0")}:00`)}
              />
            ))}

            {/* Appointments */}
            <div className="absolute inset-x-1 top-0">
              {getAppointmentsForDay(day).map((apt) => (
                <button
                  key={apt.id}
                  className={cn(
                    "absolute right-0 left-0 overflow-hidden rounded border px-1.5 py-0.5 text-left text-xs transition-all hover:shadow-md",
                    statusColors[apt.status] || "bg-muted"
                  )}
                  style={getAppointmentStyle(apt)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick?.(apt);
                  }}
                >
                  <div className="truncate font-medium">{apt.patient_name}</div>
                  <div className="truncate text-[10px] opacity-80">
                    {apt.start_time.slice(0, 5)} - {apt.appointment_type || apt.service_type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
