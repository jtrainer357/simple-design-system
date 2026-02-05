"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { Checkbox } from "./checkbox";
import { format, isSameDay, isToday } from "date-fns";
import { EventColor } from "./calendar-event-card";

export interface DayEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: EventColor;
  completed?: boolean;
}

interface CalendarDayViewProps {
  date: Date;
  events: DayEvent[];
  onEventToggle?: (eventId: string, completed: boolean) => void;
  onEventClick?: (event: DayEvent) => void;
  className?: string;
}

const colorBorderStyles: Record<EventColor, string> = {
  blue: "border-l-teal",
  pink: "border-l-primary",
  neutral: "border-l-event-neutral-border",
  green: "border-l-event-green-border",
  yellow: "border-l-event-warm-border",
  gray: "border-l-border",
  red: "border-l-destructive",
  orange: "border-l-primary/80",
  // purple is an alias for neutral (no actual purple/violet in healthcare app)
  purple: "border-l-event-neutral-border",
};

const colorBgStyles: Record<EventColor, string> = {
  blue: "bg-event-blue-bg/60",
  pink: "bg-primary/10",
  neutral: "bg-event-neutral-bg/80",
  green: "bg-event-green-bg/50",
  yellow: "bg-event-warm-bg/60",
  gray: "bg-muted/80",
  red: "bg-destructive/10",
  orange: "bg-primary/15",
  // purple is an alias for neutral (no actual purple/violet in healthcare app)
  purple: "bg-event-neutral-bg/80",
};

interface TimeSlot {
  hour: number;
  label: string;
  isNoon?: boolean;
}

export function CalendarDayView({
  date,
  events,
  onEventToggle,
  onEventClick,
  className,
}: CalendarDayViewProps) {
  const timeSlots: TimeSlot[] = React.useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour <= 21; hour++) {
      const isNoon = hour === 12;
      let label: string;
      if (isNoon) {
        label = "Noon";
      } else if (hour > 12) {
        label = `${hour - 12}:00 pm`;
      } else {
        label = `${hour}:00 am`;
      }
      slots.push({ hour, label, isNoon });
    }
    return slots;
  }, []);

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventHour = event.startTime.getHours();
      return eventHour === hour && isSameDay(event.startTime, date);
    });
  };

  // Current time indicator
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const showCurrentTime = isToday(date) && currentHour >= 6 && currentHour <= 21;
  const SLOT_HEIGHT = 72;
  const currentTimeTop = (currentHour - 6) * SLOT_HEIGHT + (currentMinutes / 60) * SLOT_HEIGHT;

  return (
    <div className={cn("relative space-y-0", className)}>
      {/* Current time indicator */}
      {showCurrentTime && (
        <div
          className="pointer-events-none absolute right-0 left-20 z-10 flex items-center"
          style={{ top: currentTimeTop }}
        >
          <div className="bg-primary h-2 w-2 rounded-full" />
          <div className="border-primary flex-1 border-t-2 border-dashed" />
        </div>
      )}
      {timeSlots.map((slot) => {
        const hourEvents = getEventsForHour(slot.hour);

        return (
          <div
            key={slot.hour}
            className="border-border/50 flex min-h-[72px] border-b last:border-b-0"
          >
            {/* Time label */}
            <div className="w-20 shrink-0 py-3 pr-3 text-right">
              <span
                className={cn(
                  "text-sm",
                  slot.isNoon ? "font-semibold text-red-500" : "text-muted-foreground"
                )}
              >
                {slot.label}
              </span>
            </div>

            {/* Events for this hour */}
            <div className="flex-1 space-y-2 py-2">
              {hourEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-l-4 px-3 py-3",
                    colorBorderStyles[event.color],
                    colorBgStyles[event.color]
                  )}
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => onEventClick?.(event)}
                  >
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {format(event.startTime, "h:mm")} - {format(event.endTime, "h:mm a")}
                    </p>
                  </button>
                  <Checkbox
                    checked={event.completed}
                    onCheckedChange={(checked) => onEventToggle?.(event.id, checked === true)}
                    className="h-5 w-5 rounded border-2"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
