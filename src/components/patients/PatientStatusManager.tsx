"use client";

import * as React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
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
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Text } from "@/design-system/components/ui/typography";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";
import {
  useUpdatePatientStatus,
  type PatientStatus,
  type UpdatePatientStatusData,
} from "@/src/lib/queries/use-patients";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import type { Patient } from "@/src/lib/supabase/types";
import { toast } from "sonner";

export interface PatientStatusManagerProps {
  patient: Patient;
  practiceId?: string;
  onStatusChange?: (patient: Patient) => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  PatientStatus,
  { label: string; badgeVariant: "default" | "secondary" | "outline"; description: string }
> = {
  Active: {
    label: "Active",
    badgeVariant: "default",
    description: "Patient is currently receiving care",
  },
  Inactive: {
    label: "Inactive",
    badgeVariant: "secondary",
    description: "Patient is temporarily not receiving care",
  },
  Discharged: {
    label: "Discharged",
    badgeVariant: "outline",
    description: "Patient has completed treatment or left the practice",
  },
};

export function PatientStatusManager({
  patient,
  practiceId = DEMO_PRACTICE_ID,
  onStatusChange,
  className,
}: PatientStatusManagerProps) {
  const [pendingStatus, setPendingStatus] = React.useState<PatientStatus | null>(null);
  const [reason, setReason] = React.useState("");
  const updateStatus = useUpdatePatientStatus();

  const currentStatus = patient.status as PatientStatus;
  const currentConfig = STATUS_CONFIG[currentStatus];

  const handleStatusSelect = (newStatus: PatientStatus) => {
    if (newStatus === currentStatus) return;
    setPendingStatus(newStatus);
    setReason("");
  };

  const handleConfirm = async () => {
    if (!pendingStatus) return;

    const data: UpdatePatientStatusData = {
      status: pendingStatus,
      reason: reason.trim() || undefined,
    };

    try {
      const updatedPatient = await updateStatus.mutateAsync({
        patientId: patient.id,
        practiceId,
        data,
      });
      onStatusChange?.(updatedPatient);
      toast.success(`Patient status changed to ${pendingStatus}`);
      setPendingStatus(null);
      setReason("");
    } catch (error) {
      console.error("Failed to update patient status:", error);
      toast.error("Failed to update patient status");
    }
  };

  const handleCancel = () => {
    setPendingStatus(null);
    setReason("");
  };

  const pendingConfig = pendingStatus ? STATUS_CONFIG[pendingStatus] : null;
  const isDischarging = pendingStatus === "Discharged";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Text size="sm" muted>
            Status:
          </Text>
          <Badge
            variant={currentConfig.badgeVariant}
            className={cn(
              "rounded-md border-none px-2.5 py-1 text-xs font-bold",
              currentStatus === "Inactive" && "bg-muted text-muted-foreground"
            )}
          >
            {currentConfig.label}
          </Badge>
        </div>
        <Select value={currentStatus} onValueChange={(val) => handleStatusSelect(val as PatientStatus)}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Discharged">Discharged</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Text size="xs" muted>
        {currentConfig.description}
      </Text>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingStatus} onOpenChange={() => handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isDischarging && <AlertTriangle className="h-5 w-5 text-warning" />}
              Change Patient Status
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  You are about to change{" "}
                  <strong>
                    {patient.first_name} {patient.last_name}
                  </strong>
                  &apos;s status from <strong>{currentConfig.label}</strong> to{" "}
                  <strong>{pendingConfig?.label}</strong>.
                </p>
                {isDischarging && (
                  <div className="rounded-md bg-warning/10 p-3 text-warning-foreground">
                    <Text size="sm" weight="medium">
                      Warning: Discharging a patient will:
                    </Text>
                    <ul className="mt-1 list-inside list-disc text-sm">
                      <li>Hide them from the active patient list</li>
                      <li>Cancel any upcoming appointments</li>
                      <li>Keep all records for compliance purposes</li>
                    </ul>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Reason for change {isDischarging && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      isDischarging
                        ? "e.g., Treatment completed, Transferred to another provider"
                        : "Optional: Enter reason for status change"
                    }
                    className="min-h-[44px]"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} className="min-h-[44px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={updateStatus.isPending || (isDischarging && !reason.trim())}
              className={cn("min-h-[44px]", isDischarging && "bg-warning text-warning-foreground hover:bg-warning/90")}
            >
              {updateStatus.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                `Confirm ${pendingConfig?.label}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
