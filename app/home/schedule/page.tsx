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
import { Plus, Calendar, Trash2 } from "lucide-react";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  setHours,
  setMinutes,
  subWeeks,
  addWeeks,
  isSameDay,
} from "date-fns";

// Sample events data
const createSampleEvents = (baseDate: Date): CalendarEvent[] => {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });

  return [
    // Monday
    {
      id: "1",
      title: "Monday standup",
      startTime: setMinutes(setHours(weekStart, 9), 0),
      endTime: setMinutes(setHours(weekStart, 9), 30),
      color: "gray",
    },
    {
      id: "2",
      title: "Content planning",
      startTime: setMinutes(setHours(weekStart, 11), 0),
      endTime: setMinutes(setHours(weekStart, 12), 0),
      color: "blue",
    },
    // Tuesday
    {
      id: "3",
      title: "One-on-one with Eva",
      startTime: setMinutes(setHours(addDays(weekStart, 1), 10), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 1), 11), 0),
      color: "pink",
    },
    {
      id: "4",
      title: "Catch up w/ Alex",
      startTime: setMinutes(setHours(addDays(weekStart, 1), 15), 30),
      endTime: setMinutes(setHours(addDays(weekStart, 1), 16), 30),
      color: "blue",
    },
    // Wednesday
    {
      id: "5",
      title: "Deep work",
      startTime: setMinutes(setHours(addDays(weekStart, 2), 9), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 2), 11), 0),
      color: "purple",
    },
    {
      id: "6",
      title: "Design sync",
      startTime: setMinutes(setHours(addDays(weekStart, 2), 10), 30),
      endTime: setMinutes(setHours(addDays(weekStart, 2), 11), 30),
      color: "purple",
    },
    {
      id: "7",
      title: "Lunch with Olivia",
      startTime: setMinutes(setHours(addDays(weekStart, 2), 12), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 2), 13), 0),
      color: "green",
      hasNotification: true,
    },
    {
      id: "8",
      title: "SEO planning",
      startTime: setMinutes(setHours(addDays(weekStart, 2), 13), 30),
      endTime: setMinutes(setHours(addDays(weekStart, 2), 14), 30),
      color: "purple",
    },
    {
      id: "9",
      title: "Meetup event",
      startTime: setMinutes(setHours(addDays(weekStart, 2), 15), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 2), 17), 0),
      color: "yellow",
    },
    // Thursday
    {
      id: "10",
      title: "Research new project",
      startTime: setMinutes(setHours(addDays(weekStart, 3), 8), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 3), 9), 0),
      color: "purple",
    },
    {
      id: "11",
      title: "Design onboarding",
      startTime: setMinutes(setHours(addDays(weekStart, 3), 9), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 3), 10), 0),
      color: "pink",
    },
    {
      id: "12",
      title: "Learn Webflow",
      startTime: setMinutes(setHours(addDays(weekStart, 3), 10), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 3), 11), 0),
      color: "green",
    },
    {
      id: "13",
      title: "Lunch break",
      startTime: setMinutes(setHours(addDays(weekStart, 3), 12), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 3), 13), 0),
      color: "red",
    },
    {
      id: "14",
      title: "Report progress with client",
      startTime: setMinutes(setHours(addDays(weekStart, 3), 16), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 3), 17), 0),
      color: "green",
    },
    // Friday
    {
      id: "15",
      title: "Friday standup",
      startTime: setMinutes(setHours(addDays(weekStart, 4), 9), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 4), 9), 30),
      color: "gray",
    },
    {
      id: "16",
      title: "Olivia x Riley",
      startTime: setMinutes(setHours(addDays(weekStart, 4), 10), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 4), 11), 30),
      color: "purple",
    },
    {
      id: "17",
      title: "Product demo",
      startTime: setMinutes(setHours(addDays(weekStart, 4), 13), 30),
      endTime: setMinutes(setHours(addDays(weekStart, 4), 15), 30),
      color: "gray",
    },
    // Saturday
    {
      id: "18",
      title: "House inspection",
      startTime: setMinutes(setHours(addDays(weekStart, 5), 11), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 5), 12), 0),
      color: "pink",
      hasNotification: true,
    },
    // Sunday
    {
      id: "19",
      title: "Ava's engagement party",
      startTime: setMinutes(setHours(addDays(weekStart, 6), 13), 0),
      endTime: setMinutes(setHours(addDays(weekStart, 6), 15), 0),
      color: "blue",
      hasNotification: true,
    },
  ];
};

const filterTabs = [
  { id: "all", label: "All events" },
  { id: "shared", label: "Shared" },
  { id: "public", label: "Public" },
  { id: "archived", label: "Archived" },
];

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [viewType, setViewType] = React.useState<CalendarViewType>("week");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [completedEvents, setCompletedEvents] = React.useState<Set<string>>(new Set());

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

  const events = React.useMemo(() => createSampleEvents(currentDate), [currentDate]);

  const dateRange = `${format(weekStart, "MMM d, yyyy")} - ${format(weekEnd, "MMM d, yyyy")}`;

  const handlePrevious = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const handleNext = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
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
              {/* Desktop: Filter tabs and Add Event button */}
              <div className="mb-4 flex items-center justify-between">
                <FilterTabs
                  tabs={filterTabs}
                  activeTab={activeFilter}
                  onTabChange={setActiveFilter}
                />
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </div>

              {/* Calendar Card */}
              <CardWrapper className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
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
                    startHour={7}
                    endHour={20}
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
                    <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
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
