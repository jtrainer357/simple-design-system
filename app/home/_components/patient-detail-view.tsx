"use client";

import * as React from "react";
import {
  Calendar,
  Phone,
  Mail,
  Shield,
  MoreVertical,
  CalendarClock,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { PatientStatCard } from "@/design-system/components/ui/patient-stat-card";
import { AppointmentPreviewCard } from "@/design-system/components/ui/appointment-preview-card";
import { ActivityRow } from "@/design-system/components/ui/activity-row";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system/components/ui/tabs";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { PatientStatus } from "@/design-system/components/ui/patient-list-card";
import {
  PriorityActionCard,
  type PriorityLevel,
  type ActionType,
} from "@/design-system/components/ui/priority-action-card";

const tabTriggerStyles =
  "data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-3 py-2 text-xl font-light text-foreground-strong whitespace-nowrap data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4";

export interface PriorityAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  priority: PriorityLevel;
  dueDate?: string;
  aiConfidence?: number;
}

export interface PatientDetail {
  id: string;
  name: string;
  status: PatientStatus;
  dob: string;
  age: number;
  phone: string;
  phoneExt?: string;
  email: string;
  insurance?: string;
  avatarSrc?: string;
  lastVisit: {
    date: string;
    type: string;
  };
  appointments: {
    total: number;
    dateRange: string;
  };
  balance: {
    amount: string;
    type: string;
  };
  upcomingAppointments: Array<{
    id: string;
    status: "Scheduled" | "Confirmed" | "Checked In" | "In Progress" | "Completed" | "Cancelled";
    date: string;
    time: string;
    type: string;
    provider: string;
  }>;
  prioritizedActions?: PriorityAction[];
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
}

interface PatientDetailViewProps {
  patient: PatientDetail | null;
  className?: string;
}

// Default AI-surfaced prioritized actions for demo
const defaultPrioritizedActions: PriorityAction[] = [
  {
    id: "1",
    type: "risk",
    title: "Elevated A1C Levels Detected",
    description: "Latest lab results show A1C at 7.8%. Consider diabetes management review.",
    priority: "urgent",
    dueDate: "Immediate",
    aiConfidence: 94,
  },
  {
    id: "2",
    type: "medication",
    title: "Medication Refill Due",
    description: "Metformin prescription expires in 5 days. Patient has 3-day supply remaining.",
    priority: "high",
    dueDate: "Within 3 days",
    aiConfidence: 98,
  },
  {
    id: "3",
    type: "care-gap",
    title: "Annual Wellness Visit Overdue",
    description: "Last comprehensive exam was 14 months ago. Schedule preventive care visit.",
    priority: "medium",
    dueDate: "This month",
    aiConfidence: 87,
  },
  {
    id: "4",
    type: "screening",
    title: "Depression Screening Recommended",
    description: "PHQ-9 indicated mild symptoms at last visit. Follow-up assessment suggested.",
    priority: "medium",
    dueDate: "Next visit",
    aiConfidence: 82,
  },
];

export function PatientDetailView({ patient, className }: PatientDetailViewProps) {
  if (!patient) {
    return (
      <CardWrapper className={cn("flex h-full items-center justify-center", className)}>
        <Text muted className="text-center">
          Select a patient to view their details
        </Text>
      </CardWrapper>
    );
  }

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      {/* Patient Header Card */}
      <CardWrapper className="relative">
        <div className="flex flex-col gap-4 pr-8 sm:gap-6 sm:pr-0 lg:flex-row lg:items-start lg:justify-between">
          {/* Left - Avatar and Info */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
              {patient.avatarSrc && <AvatarImage src={patient.avatarSrc} alt={patient.name} />}
              <AvatarFallback className="bg-avatar-fallback text-base font-medium text-white sm:text-lg lg:text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Heading level={3} className="truncate text-xl sm:text-2xl">
                  {patient.name}
                </Heading>
                <Badge
                  variant={
                    patient.status === "ACTIVE"
                      ? "default"
                      : patient.status === "NEW"
                        ? "secondary"
                        : "outline"
                  }
                  className={cn(
                    "shrink-0 rounded-md border-none px-2 py-0.5 text-xs font-bold sm:px-2.5 sm:py-1",
                    patient.status === "INACTIVE" && "bg-muted text-muted-foreground"
                  )}
                >
                  {patient.status}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:mt-3 sm:gap-x-6 sm:gap-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Text size="xs" className="sm:text-sm">
                    DOB: {patient.dob} ({patient.age} yrs)
                  </Text>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Phone className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Text size="xs" className="sm:text-sm">
                    {patient.phone}
                    {patient.phoneExt && ` x${patient.phoneExt}`}
                  </Text>
                </div>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:mt-2 sm:gap-x-6 sm:gap-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Mail className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Text size="xs" className="truncate sm:text-sm">
                    {patient.email}
                  </Text>
                </div>
                {patient.insurance && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Shield className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <Text size="xs" className="sm:text-sm">
                      {patient.insurance}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right - More Actions */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 shrink-0 sm:relative sm:top-auto sm:right-auto sm:self-start"
          >
            <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
          <PatientStatCard
            icon={Calendar}
            label="Last Visit"
            value={patient.lastVisit.date}
            subtitle={patient.lastVisit.type}
          />
          <PatientStatCard
            icon={CalendarClock}
            label="Appointments"
            value={`${patient.appointments.total} Total`}
            subtitle={patient.appointments.dateRange}
          />
          <PatientStatCard
            icon={DollarSign}
            label="Balance"
            value={patient.balance.amount}
            subtitle={patient.balance.type}
          />
        </div>
      </CardWrapper>

      {/* Tabs Section */}
      <CardWrapper className="flex flex-1 flex-col overflow-hidden">
        <Tabs defaultValue="overview" className="flex h-full w-full flex-col">
          <TabsList className="mb-4 h-auto w-full justify-start gap-0 overflow-x-auto bg-transparent p-0 sm:mb-6">
            <TabsTrigger value="overview" className={tabTriggerStyles}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="appointments" className={tabTriggerStyles}>
              Appointments
            </TabsTrigger>
            <TabsTrigger value="medical-records" className={tabTriggerStyles}>
              Medical Records
            </TabsTrigger>
            <TabsTrigger value="messages" className={tabTriggerStyles}>
              Messages
            </TabsTrigger>
            <TabsTrigger value="billing" className={tabTriggerStyles}>
              Billing
            </TabsTrigger>
            <TabsTrigger value="reviews" className={tabTriggerStyles}>
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-0 flex-1 overflow-y-auto pr-1">
            {/* Prioritized Actions - AI Surfaced */}
            <div className="mb-4 sm:mb-6">
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <div className="flex items-center gap-2">
                  <Heading level={5} className="text-base sm:text-lg">
                    Prioritized Actions
                  </Heading>
                  <span className="text-primary flex items-center gap-1 text-[10px] font-medium sm:text-xs">
                    <Sparkles className="h-3 w-3" />
                    AI Surfaced
                  </span>
                </div>
                <Button variant="link" className="h-auto p-0 text-xs sm:text-sm">
                  View All
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {(patient.prioritizedActions || defaultPrioritizedActions)
                  .slice(0, 4)
                  .map((action) => (
                    <PriorityActionCard
                      key={action.id}
                      type={action.type}
                      title={action.title}
                      description={action.description}
                      priority={action.priority}
                      dueDate={action.dueDate}
                      aiConfidence={action.aiConfidence}
                    />
                  ))}
                {patient.prioritizedActions?.length === 0 && (
                  <Text size="sm" muted className="py-4 text-center">
                    No prioritized actions at this time
                  </Text>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <Heading level={5} className="mb-3 text-base sm:mb-4 sm:text-lg">
                Recent Activity
              </Heading>
              <div className="space-y-2">
                {patient.recentActivity.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    title={activity.title}
                    description={activity.description}
                    date={activity.date}
                  />
                ))}
                {patient.recentActivity.length === 0 && (
                  <Text size="sm" muted className="py-4 text-center">
                    No recent activity
                  </Text>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Placeholder content for other tabs */}
          <TabsContent value="appointments" className="mt-0">
            <div className="space-y-2">
              {patient.upcomingAppointments.map((apt) => (
                <AppointmentPreviewCard
                  key={apt.id}
                  status={apt.status}
                  date={apt.date}
                  time={apt.time}
                  type={apt.type}
                  provider={apt.provider}
                />
              ))}
              {patient.upcomingAppointments.length === 0 && (
                <Text size="sm" muted className="py-8 text-center">
                  No appointments found
                </Text>
              )}
            </div>
          </TabsContent>

          <TabsContent value="medical-records" className="mt-0">
            <Text size="sm" muted className="py-8 text-center">
              Medical records will be displayed here
            </Text>
          </TabsContent>

          <TabsContent value="messages" className="mt-0">
            <Text size="sm" muted className="py-8 text-center">
              Messages will be displayed here
            </Text>
          </TabsContent>

          <TabsContent value="billing" className="mt-0">
            <Text size="sm" muted className="py-8 text-center">
              Billing information will be displayed here
            </Text>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <Text size="sm" muted className="py-8 text-center">
              Patient reviews will be displayed here
            </Text>
          </TabsContent>
        </Tabs>
      </CardWrapper>
    </div>
  );
}

export type { PatientDetailViewProps };
