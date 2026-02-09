"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Video,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Repeat,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/design-system/components/ui/sheet";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";
import { Separator } from "@/design-system/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/design-system/components/ui/alert-dialog";
import { cn } from "@/design-system/lib/utils";
import {
  type AppointmentStatus,
  APPOINTMENT_STATUS_TRANSITIONS,
  APPOINTMENT_TYPES,
} from "@/src/lib/supabase/scheduling-types";
import { appointmentKeys } from "@/src/lib/queries/keys";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  phone_mobile?: string | null;
  email?: string | null;
  risk_level?: "low" | "medium" | "high" | null;
  date_of_birth?: string;
}

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  service_type?: string;
  appointment_type?: string;
  cpt_code?: string | null;
  format?: "in_person" | "telehealth";
  room?: string | null;
  notes?: string | null;
  recurring_group_id?: string | null;
  recurring_pattern?: string | null;
  patient?: Patient;
}

interface AppointmentDetailPanelProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

const STATUS_STYLES: Record<
  AppointmentStatus,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  Scheduled: {
    bg: "bg-growth-4 dark:bg-growth-1/30",
    text: "text-growth-1 dark:text-growth-4",
    icon: <Calendar className="h-4 w-4" />,
  },
  Confirmed: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  "Checked-In": {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-300",
    icon: <User className="h-4 w-4" />,
  },
  "In Session": {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    icon: <Play className="h-4 w-4" />,
  },
  Completed: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  "No-Show": {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    icon: <XCircle className="h-4 w-4" />,
  },
  Cancelled: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-700 dark:text-gray-300",
    icon: <XCircle className="h-4 w-4" />,
  },
};

const STATUS_ACTIONS: Record<
  AppointmentStatus,
  { label: string; next: AppointmentStatus; variant: "default" | "outline" | "destructive" }[]
> = {
  Scheduled: [{ label: "Confirm", next: "Confirmed", variant: "default" }],
  Confirmed: [{ label: "Check In", next: "Checked-In", variant: "default" }],
  "Checked-In": [
    { label: "Begin Session", next: "In Session", variant: "default" },
    { label: "No-Show", next: "No-Show", variant: "destructive" },
  ],
  "In Session": [{ label: "Complete", next: "Completed", variant: "default" }],
  Completed: [],
  "No-Show": [],
  Cancelled: [],
};

export function AppointmentDetailPanel({
  appointment,
  open,
  onOpenChange,
  onStatusChange,
}: AppointmentDetailPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  const statusMutation = useMutation({
    mutationFn: async (newStatus: AppointmentStatus) => {
      const response = await fetch(`/api/appointments/${appointment?.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      onStatusChange?.();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/appointments/${appointment?.id}?reason=provider`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to cancel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      setCancelDialogOpen(false);
      onOpenChange(false);
      onStatusChange?.();
    },
  });

  if (!appointment) return null;

  const patient = appointment.patient;
  const statusStyle = STATUS_STYLES[appointment.status] || STATUS_STYLES.Scheduled;
  const actions = STATUS_ACTIONS[appointment.status] || [];
  const allowedTransitions = APPOINTMENT_STATUS_TRANSITIONS[appointment.status] || [];
  const appointmentTypeConfig = APPOINTMENT_TYPES.find(
    (t) => t.code === appointment.appointment_type
  );
  const formattedDate = format(
    parse(appointment.date, "yyyy-MM-dd", new Date()),
    "EEEE, MMMM d, yyyy"
  );
  const formattedTime = `${appointment.start_time.slice(0, 5)} - ${appointment.end_time.slice(0, 5)}`;

  const handleBeginSession = () => {
    statusMutation.mutate("In Session");
    if (patient) router.push(`/patients/${patient.id}?tab=session`);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] overflow-y-auto sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Appointment Details</span>
              <Badge className={cn(statusStyle.bg, statusStyle.text, "flex items-center gap-1")}>
                {statusStyle.icon}
                {appointment.status}
              </Badge>
            </SheetTitle>
            <SheetDescription>
              {appointmentTypeConfig?.label || appointment.service_type}
              {appointment.cpt_code && (
                <span className="ml-2 text-xs">({appointment.cpt_code})</span>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {patient && (
              <div className="space-y-3">
                <h3 className="text-muted-foreground text-sm font-medium">Patient</h3>
                <div className="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                    <User className="text-primary h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium">
                      {patient.first_name} {patient.last_name}
                      {patient.risk_level === "high" && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {patient.phone_mobile && (
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {patient.phone_mobile}
                      </div>
                    )}
                    {patient.email && (
                      <div className="text-muted-foreground flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/patients/${patient.id}`)}
                    className="min-h-[44px]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">When</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span>
                    {formattedTime} ({appointment.duration_minutes} minutes)
                  </span>
                </div>
                {appointment.recurring_pattern && (
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    <span className="text-sm">Recurring {appointment.recurring_pattern}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">Format</h3>
              <div className="flex items-center gap-2">
                {appointment.format === "telehealth" ? (
                  <>
                    <Video className="text-growth-2 h-4 w-4" />
                    <span>Telehealth</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span>In-Person{appointment.room && ` • ${appointment.room}`}</span>
                  </>
                )}
              </div>
            </div>

            {appointment.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-muted-foreground text-sm font-medium">Notes</h3>
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.next}
                    variant={action.variant}
                    onClick={() => {
                      if (action.next === "In Session") handleBeginSession();
                      else statusMutation.mutate(action.next);
                    }}
                    disabled={statusMutation.isPending}
                    className="min-h-[44px]"
                  >
                    {action.label}
                  </Button>
                ))}
                {allowedTransitions.includes("Cancelled") && (
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(true)}
                    className="min-h-[44px] text-red-600 hover:text-red-700"
                  >
                    Cancel Appointment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment with {patient?.first_name}{" "}
              {patient?.last_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
