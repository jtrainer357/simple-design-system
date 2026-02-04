"use client";

import * as React from "react";
import Link from "next/link";
import { ScheduleRowCard } from "@/design-system/components/ui/schedule-row-card";
import { Heading } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

type AppointmentStatus = "ENDED" | "IN PROGRESS" | "CHECKED IN" | "SCHEDULED";

interface Appointment {
  id: string;
  patientId: string;
  time: string;
  patient: string;
  type: string;
  provider: string;
  status: AppointmentStatus;
  room: string;
  avatarSrc?: string;
}

const appointments: Appointment[] = [
  {
    id: "apt-1",
    patientId: "michael-chen",
    time: "9:30 AM",
    patient: "Michael Chen",
    type: "DIABETES FOLLOW-UP",
    provider: "Dr. Patel",
    status: "IN PROGRESS",
    room: "Room 101",
    avatarSrc: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    id: "apt-2",
    patientId: "emma-johnson",
    time: "9:45 AM",
    patient: "Emma Johnson",
    type: "SPORTS PHYSICAL",
    provider: "Dr. Chen",
    status: "CHECKED IN",
    room: "Room 103",
    avatarSrc: "https://randomuser.me/api/portraits/women/63.jpg",
  },
  {
    id: "apt-3",
    patientId: "emily-rodriguez",
    time: "10:00 AM",
    patient: "Emily Rodriguez",
    type: "PHYSICAL",
    provider: "Dr. Patel",
    status: "SCHEDULED",
    room: "Room 101",
    avatarSrc: "https://randomuser.me/api/portraits/women/28.jpg",
  },
  {
    id: "apt-4",
    patientId: "james-wilson",
    time: "10:15 AM",
    patient: "James Wilson",
    type: "BLOOD PRESSURE CHECK",
    provider: "Dr. Morrison",
    status: "SCHEDULED",
    room: "Room 201",
  },
  {
    id: "apt-5",
    patientId: "lisa-thompson",
    time: "10:30 AM",
    patient: "Lisa Thompson",
    type: "PRENATAL VISIT",
    provider: "Dr. Chen",
    status: "SCHEDULED",
    room: "Room 103",
    avatarSrc: "https://randomuser.me/api/portraits/women/17.jpg",
  },
  {
    id: "apt-6",
    patientId: "robert-garcia",
    time: "10:45 AM",
    patient: "Robert Garcia",
    type: "FOLLOW-UP",
    provider: "Dr. Patel",
    status: "SCHEDULED",
    room: "Room 101",
  },
];

interface TodaysPatientsListProps {
  className?: string;
}

export function TodaysPatientsList({ className }: TodaysPatientsListProps) {
  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <Heading
        level={6}
        className="text-muted-foreground mb-3 shrink-0 text-xs font-semibold tracking-wider uppercase"
      >
        Today&apos;s Patients
      </Heading>

      <div className="-mx-2 min-h-0 flex-1 space-y-2 overflow-y-auto px-2">
        {appointments.map((apt) => (
          <Link key={apt.id} href={`/patients/${apt.patientId}`} className="block">
            <ScheduleRowCard
              time={apt.time}
              patient={apt.patient}
              type={apt.type}
              provider={apt.provider}
              status={apt.status}
              room={apt.room}
              avatarSrc={apt.avatarSrc}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
