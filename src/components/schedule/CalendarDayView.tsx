"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/design-system/lib/utils";
import { type AppointmentStatus } from "@/src/lib/supabase/scheduling-types";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  risk_level?: "low" | "medium" | "high" | null;
}

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  service_type?: string;
  format?: "in_person" | "telehealth";
  patient?: Patient;
}

interface CalendarDayViewProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Scheduled:
    "bg-growth-4 border-growth-3 text-growth-1 dark:bg-growth-1/30 dark:border-growth-2 dark:text-growth-4",
  Confirmed:
    "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
  "Checked-In":
    "bg-teal-100 border-teal-300 text-teal-800 dark:bg-teal-900/30 dark:border-teal-700 dark:text-teal-300",
  "In Session":
    "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300",
  Completed:
    "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300",
  "No-Show":
    "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300",
  Cancelled:
    "bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-400",
};

export function CalendarDayView({
  date,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
}: CalendarDayViewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isToday = isSameDay(date, new Date());

  const dayAppointments = appointments.filter(
    (apt) => apt.date === format(date, "yyyy-MM-dd") && apt.status !== "Cancelled"
  );

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const showCurrentTime = isToday && currentHour >= 8 && currentHour < 18;
  const currentTimeTop = showCurrentTime ? ((currentHour - 8) * 60 + currentMinute) * (64 / 60) : 0;

  React.useEffect(() => {
    if (containerRef.current && showCurrentTime) {
      containerRef.current.scrollTop = Math.max(0, currentTimeTop - 100);
    }
  }, [currentTimeTop, showCurrentTime]);

  const getAppointmentStyle = (apt: Appointment) => {
    const startParts = apt.start_time.split(":").map(Number);
    const startHour = startParts[0] ?? 9;
    const startMin = startParts[1] ?? 0;
    const top = ((startHour - 8) * 60 + startMin) * (64 / 60);
    const height = apt.duration_minutes * (64 / 60);
    return { top: `${top}px`, height: `${Math.max(height, 32)}px` };
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="relative min-h-[704px]">
        <div className="absolute inset-0">
          {HOURS.map((hour) => (
            <div key={hour} className="border-border flex h-16 border-b">
              <div className="text-muted-foreground w-16 flex-shrink-0 px-2 py-1 text-xs">
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
              <div
                className="hover:bg-muted/50 flex-1 cursor-pointer transition-colors"
                onClick={() => onTimeSlotClick(date, `${hour.toString().padStart(2, "0")}:00`)}
              />
            </div>
          ))}
        </div>

        {showCurrentTime && (
          <div
            className="pointer-events-none absolute right-0 left-16 z-10 flex items-center"
            style={{ top: `${currentTimeTop}px` }}
          >
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <div className="h-0.5 flex-1 bg-red-500" />
          </div>
        )}

        <div className="absolute top-0 right-2 left-16">
          {dayAppointments.map((apt) => (
            <button
              key={apt.id}
              onClick={() => onAppointmentClick(apt)}
              className={cn(
                "focus:ring-primary absolute right-0 left-0 rounded-md border p-2 text-left transition-all hover:shadow-md focus:ring-2 focus:outline-none",
                STATUS_COLORS[apt.status]
              )}
              style={getAppointmentStyle(apt)}
            >
              <div className="truncate text-sm font-medium">
                {apt.patient
                  ? `${apt.patient.first_name} ${apt.patient.last_name}`
                  : "Unknown Patient"}
              </div>
              <div className="truncate text-xs opacity-75">
                {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                {apt.service_type && ` • ${apt.service_type}`}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
