"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { CalendarEventCard, EventColor } from "./calendar-event-card";
import { format, isSameDay, isToday } from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: EventColor;
  hasNotification?: boolean;
}

interface CalendarWeekViewProps {
  weekDays: Date[];
  events: CalendarEvent[];
  startHour?: number;
  endHour?: number;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

const HOUR_HEIGHT = 64; // pixels per hour

export function CalendarWeekView({
  weekDays,
  events,
  startHour = 9,
  endHour = 17,
  onEventClick,
  className,
}: CalendarWeekViewProps) {
  const hours = React.useMemo(() => {
    const result: number[] = [];
    for (let i = startHour; i <= endHour; i++) {
      result.push(i);
    }
    return result;
  }, [startHour, endHour]);

  const formatHour = (hour: number) => {
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  const getEventPosition = (event: CalendarEvent) => {
    const eventHour = event.startTime.getHours();
    const eventMinutes = event.startTime.getMinutes();
    const endHourEvent = event.endTime.getHours();
    const endMinutes = event.endTime.getMinutes();

    const top = (eventHour - startHour) * HOUR_HEIGHT + (eventMinutes / 60) * HOUR_HEIGHT;
    const duration = (endHourEvent - eventHour) * 60 + (endMinutes - eventMinutes);
    const height = (duration / 60) * HOUR_HEIGHT;

    return { top, height: Math.max(height, 32) };
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.startTime, day));
  };

  // Current time indicator
  const now = new Date();
  const currentTimeTop =
    (now.getHours() - startHour) * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT;
  const showCurrentTime = now.getHours() >= startHour && now.getHours() <= endHour;

  return (
    <div
      className={cn("border-border/40 flex flex-col overflow-hidden rounded-xl border", className)}
    >
      <div className="flex min-h-0 min-w-[800px] flex-1 flex-col overflow-auto">
        {/* Header with day names */}
        <div className="border-border/40 sticky top-0 z-20 grid grid-cols-[56px_repeat(7,1fr)] rounded-t-xl border-b bg-white/80 backdrop-blur-sm">
          <div className="py-3" /> {/* Time column spacer */}
          {weekDays.map((day, idx) => {
            const today = isToday(day);
            return (
              <div
                key={idx}
                className={cn(
                  "border-border/40 border-l-2 py-3 text-center",
                  today && "bg-primary/5"
                )}
              >
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  {format(day, "EEE")}
                </p>
                <p
                  className={cn(
                    "mt-1 text-lg font-semibold",
                    today ? "text-primary" : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative grid grid-cols-[56px_repeat(7,1fr)] bg-white/40">
          {/* Time labels column */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-border/40 relative border-b"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="text-muted-foreground absolute -top-[9px] right-3 bg-transparent px-1 text-[11px] font-medium">
                  {formatHour(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const today = isToday(day);
            return (
              <div
                key={dayIdx}
                className={cn("border-border/40 relative border-l-2", today && "bg-primary/[0.06]")}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-border/40 border-b"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Events */}
                <div className="absolute inset-x-1 top-0">
                  {getEventsForDay(day).map((event) => {
                    const { top, height } = getEventPosition(event);
                    return (
                      <div
                        key={event.id}
                        className="absolute inset-x-0 px-0.5"
                        style={{ top, height }}
                      >
                        <CalendarEventCard
                          title={event.title}
                          time={format(event.startTime, "h:mm a")}
                          color={event.color}
                          hasNotification={event.hasNotification}
                          onClick={() => onEventClick?.(event)}
                          className="h-full"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Current time indicator */}
          {showCurrentTime && (
            <div
              className="pointer-events-none absolute right-0 left-14 z-10 flex items-center"
              style={{ top: currentTimeTop }}
            >
              <div className="bg-primary h-2 w-2 rounded-full" />
              <div className="border-primary flex-1 border-t-2 border-dashed" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
