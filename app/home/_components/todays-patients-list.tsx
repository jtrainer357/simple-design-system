"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
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
  {
    id: "apt-7",
    patientId: "amanda-lee",
    time: "11:00 AM",
    patient: "Amanda Lee",
    type: "NEW PATIENT",
    provider: "Dr. Morrison",
    status: "SCHEDULED",
    room: "Room 201",
    avatarSrc: "https://randomuser.me/api/portraits/women/51.jpg",
  },
  {
    id: "apt-8",
    patientId: "daniel-brown",
    time: "11:15 AM",
    patient: "Daniel Brown",
    type: "SKIN CHECK",
    provider: "Dr. Chen",
    status: "SCHEDULED",
    room: "Room 103",
  },
];

interface PatientRowProps {
  appointment: Appointment;
}

function PatientRow({ appointment }: PatientRowProps) {
  const initials = appointment.patient
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Link
      href={`/home/patients/${appointment.patientId}`}
      className="hover:bg-accent/50 block rounded-lg transition-colors"
    >
      <div className="flex items-center gap-4 p-3 sm:p-4">
        {/* Time */}
        <div className="flex w-20 shrink-0 items-center gap-1.5">
          <Clock className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-semibold">{appointment.time}</span>
        </div>

        {/* Patient info */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar className="h-10 w-10 shrink-0">
            {appointment.avatarSrc && (
              <AvatarImage src={appointment.avatarSrc} alt={appointment.patient} />
            )}
            <AvatarFallback className="bg-[#8CA7A2] text-xs text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold">{appointment.patient}</h4>
            <p className="text-muted-foreground truncate text-xs font-bold tracking-wider uppercase">
              {appointment.type}
            </p>
          </div>
        </div>

        {/* Status */}
        <Badge
          variant={
            appointment.status === "IN PROGRESS"
              ? "default"
              : appointment.status === "CHECKED IN"
                ? "secondary"
                : "outline"
          }
          className={cn(
            "shrink-0 rounded-md border-none px-2 py-0.5 text-xs font-bold",
            appointment.status === "ENDED" && "bg-muted text-muted-foreground",
            appointment.status === "SCHEDULED" &&
              "border-muted text-muted-foreground border bg-transparent"
          )}
        >
          {appointment.status}
        </Badge>

        {/* Room */}
        <div className="text-muted-foreground hidden shrink-0 items-center gap-1 text-xs font-bold sm:flex">
          <MapPin className="h-3.5 w-3.5" />
          {appointment.room}
        </div>
      </div>
    </Link>
  );
}

interface TodaysPatientsListProps {
  className?: string;
}

export function TodaysPatientsList({ className }: TodaysPatientsListProps) {
  return (
    <CardWrapper className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between pb-4">
        <div>
          <Heading level={4} className="text-lg">
            Today&apos;s Patients
          </Heading>
          <p className="text-muted-foreground mt-1 text-xs font-semibold tracking-wider uppercase">
            {appointments.length} appointments scheduled
          </p>
        </div>
      </div>

      <div className="divide-border/50 -mx-2 divide-y">
        {appointments.map((apt) => (
          <PatientRow key={apt.id} appointment={apt} />
        ))}
      </div>
    </CardWrapper>
  );
}
