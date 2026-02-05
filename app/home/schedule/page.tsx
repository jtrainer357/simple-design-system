"use client";

import * as React from "react";
import { LeftNav } from "../_components/left-nav";
import { HeaderSearch } from "../_components/header-search";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { CalendarHeader, CalendarViewType } from "@/design-system/components/ui/calendar-header";
import { CalendarWeekView, CalendarEvent } from "@/design-system/components/ui/calendar-week-view";
import { CalendarDayView, DayEvent } from "@/design-system/components/ui/calendar-day-view";
import { CalendarDateStrip } from "@/design-system/components/ui/calendar-date-strip";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { Plus, Calendar, Trash2, Loader2 } from "lucide-react";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  subWeeks,
  addWeeks,
  isSameDay,
  parseISO,
} from "date-fns";
import {
  getUpcomingAppointments,
  type AppointmentWithPatient,
} from "@/src/lib/queries/appointments";
import { DEMO_DATE_OBJECT } from "@/src/lib/utils/demo-date";

// Color mapping based on appointment type
function getEventColor(serviceType: string, status: string): CalendarEvent["color"] {
  if (status === "Completed") return "gray";
  if (status === "Cancelled" || status === "No-Show") return "pink";
  if (serviceType.toLowerCase().includes("initial") || serviceType.toLowerCase().includes("intake"))
    return "green";
  if (serviceType.toLowerCase().includes("crisis")) return "pink";
  return "blue";
}

// Convert DB appointment to CalendarEvent
function appointmentToEvent(apt: AppointmentWithPatient): CalendarEvent {
  const [hours, minutes] = apt.start_time.split(":").map(Number);
  const [endHours, endMinutes] = apt.end_time.split(":").map(Number);
  const date = parseISO(apt.date);

  const startTime = new Date(date);
  startTime.setHours(hours!, minutes!, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHours!, endMinutes!, 0, 0);

  return {
    id: apt.id,
    title: `${apt.patient.first_name} ${apt.patient.last_name} - ${apt.service_type}`,
    startTime,
    endTime,
    color: getEventColor(apt.service_type, apt.status),
    hasNotification: apt.patient.risk_level === "high",
  };
}

const filterTabs = [
  { id: "all", label: "All Appointments" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
];

export default function SchedulePage() {
  // Use demo date as starting point
  const [currentDate, setCurrentDate] = React.useState(DEMO_DATE_OBJECT);
  const [selectedDate, setSelectedDate] = React.useState(DEMO_DATE_OBJECT);
  const [viewType, setViewType] = React.useState<CalendarViewType>("week");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [completedEvents, setCompletedEvents] = React.useState<Set<string>>(new Set());
  const [appointments, setAppointments] = React.useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load appointments from Supabase
  React.useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);
        // Fetch 2 weeks of appointments (all statuses for filter tabs to work)
        const data = await getUpcomingAppointments(undefined, 14, "all");
        setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, []);

  // Calculate week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = React.useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  // Convert appointments to calendar events
  const events: CalendarEvent[] = React.useMemo(() => {
    return appointments
      .filter((apt) => {
        if (activeFilter === "scheduled") return apt.status === "Scheduled";
        if (activeFilter === "completed") return apt.status === "Completed";
        return true;
      })
      .map(appointmentToEvent);
  }, [appointments, activeFilter]);

  const dateRange = `${format(weekStart, "MMM d, yyyy")} - ${format(weekEnd, "MMM d, yyyy")}`;

  const handlePrevious = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const handleNext = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(DEMO_DATE_OBJECT);
    setSelectedDate(DEMO_DATE_OBJECT);
  };

  const handleEventToggle = (eventId: string, completed: boolean) => {
    setCompletedEvents((prev) => {
      const next = new Set(prev);
      if (completed) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return next;
    });
  };

  // Convert events to DayEvent format for day view
  const dayEvents: DayEvent[] = events
    .filter((e) => isSameDay(e.startTime, selectedDate))
    .map((e) => ({
      ...e,
      completed: completedEvents.has(e.id),
    }));

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <AnimatedBackground />

      {/* Left Nav */}
      <LeftNav activePage="schedule" />

      {/* Main Content Wrapper */}
      <div className="lg:pl-36">
        <HeaderSearch />

        <main className="px-4 py-4 sm:px-6 sm:py-6 md:py-8">
          <PageTransition>
            <div className="mx-auto flex max-w-[1600px] flex-col overflow-hidden lg:h-[calc(100vh-8.5rem)]">
              {/* Desktop: Filter tabs and Add Appointment button */}
              <div className="mb-4 flex items-center justify-between">
                <FilterTabs
                  tabs={filterTabs}
                  activeTab={activeFilter}
                  onTabChange={setActiveFilter}
                />
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Appointment
                </Button>
              </div>

              {/* Calendar Card */}
              <CardWrapper className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
                {/* Loading State */}
                {loading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="text-primary h-8 w-8 animate-spin" />
                      <Text size="sm" muted>
                        Loading schedule...
                      </Text>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Desktop View */}
                    <div className="hidden h-full flex-col lg:flex">
                      <CalendarHeader
                        currentDate={currentDate}
                        dateRange={dateRange}
                        viewType={viewType}
                        onViewTypeChange={setViewType}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onToday={handleToday}
                        className="mb-6"
                      />

                      <CalendarWeekView
                        weekDays={weekDays}
                        events={events}
                        startHour={8}
                        endHour={18}
                        className="min-h-0 flex-1"
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Google
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Outlook
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Apple
                        </Button>
                      </div>
                    </div>

                    {/* Mobile/Tablet View */}
                    <div className="lg:hidden">
                      {/* Mobile Header */}
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                          {format(currentDate, "MMMM yyyy")}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={handleToday}>
                          Today
                        </Button>
                      </div>

                      {/* Date Strip */}
                      <CalendarDateStrip
                        dates={weekDays}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        className="mb-4"
                      />

                      {/* Day View */}
                      <div className="border-border bg-card rounded-lg border p-3">
                        <CalendarDayView
                          date={selectedDate}
                          events={dayEvents}
                          onEventToggle={handleEventToggle}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Google
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Outlook
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Connect Apple
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardWrapper>

              {/* Mobile FAB */}
              <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-2 lg:hidden">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-full bg-white shadow-lg"
                >
                  <Trash2 className="h-5 w-5 text-orange-500" />
                </Button>
                <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-full bg-white shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
