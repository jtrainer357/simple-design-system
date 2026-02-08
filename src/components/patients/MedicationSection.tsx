"use client";

import { useState } from "react";
import { Plus, Pill, AlertTriangle, MoreVertical, Archive, Trash2 } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Badge } from "@/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/design-system/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/design-system/components/ui/dropdown-menu";
import { cn } from "@/design-system/lib/utils";
import type { PatientMedication } from "@/src/lib/session";

interface MedicationSectionProps {
  medications: PatientMedication[];
  onAdd: (data: Partial<PatientMedication>) => Promise<void>;
  onUpdate: (id: string, data: Partial<PatientMedication>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function MedicationSection({
  medications,
  onAdd,
  onUpdate,
  onRemove,
  isLoading = false,
  readOnly = false,
}: MedicationSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    prescriber: "",
    startDate: "",
    refillsRemaining: "",
    nextRefillDate: "",
  });

  const activeMedications = medications.filter((m) => m.isActive);
  const discontinuedMedications = medications.filter((m) => !m.isActive);

  const handleSubmit = async () => {
    await onAdd({
      medicationName: formData.medicationName,
      dosage: formData.dosage || undefined,
      frequency: formData.frequency || undefined,
      prescriber: formData.prescriber || undefined,
      startDate: formData.startDate || undefined,
      refillsRemaining: formData.refillsRemaining ? parseInt(formData.refillsRemaining) : undefined,
      nextRefillDate: formData.nextRefillDate || undefined,
      isActive: true,
    });
    setFormData({
      medicationName: "",
      dosage: "",
      frequency: "",
      prescriber: "",
      startDate: "",
      refillsRemaining: "",
      nextRefillDate: "",
    });
    setIsDialogOpen(false);
  };

  const isRefillDueSoon = (nextRefillDate?: string) => {
    if (!nextRefillDate) return false;
    const refillDate = new Date(nextRefillDate);
    const today = new Date();
    const daysUntilRefill = Math.ceil(
      (refillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilRefill <= 7 && daysUntilRefill >= 0;
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Medications</CardTitle>
            <CardDescription>
              {activeMedications.length} active medication
              {activeMedications.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          {!readOnly && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Medication</DialogTitle>
                  <DialogDescription>Add a new medication to the patient's list.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Medication Name *</Label>
                    <Input
                      id="medicationName"
                      placeholder="e.g., Sertraline"
                      value={formData.medicationName}
                      onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 50mg"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        placeholder="e.g., Once daily"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prescriber">Prescriber</Label>
                    <Input
                      id="prescriber"
                      placeholder="e.g., Dr. Smith"
                      value={formData.prescriber}
                      onChange={(e) => setFormData({ ...formData, prescriber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextRefillDate">Next Refill Date</Label>
                      <Input
                        id="nextRefillDate"
                        type="date"
                        value={formData.nextRefillDate}
                        onChange={(e) =>
                          setFormData({ ...formData, nextRefillDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.medicationName.trim()}
                  >
                    {isLoading ? "Adding..." : "Add Medication"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <div className="text-muted-foreground py-4 text-center text-sm">
            No medications on file
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {activeMedications.map((medication) => (
                <div
                  key={medication.id}
                  className={cn(
                    "hover:bg-muted/50 rounded-lg border p-3 transition-colors",
                    isRefillDueSoon(medication.nextRefillDate) &&
                      "border-orange-200 bg-orange-50/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Pill className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{medication.medicationName}</span>
                          {medication.dosage && (
                            <Badge variant="outline" className="text-xs">
                              {medication.dosage}
                            </Badge>
                          )}
                        </div>
                        {medication.frequency && (
                          <p className="text-muted-foreground text-sm">{medication.frequency}</p>
                        )}
                        {medication.prescriber && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            Prescribed by: {medication.prescriber}
                          </p>
                        )}
                        {isRefillDueSoon(medication.nextRefillDate) && (
                          <div className="mt-2 flex items-center gap-1 text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">
                              Refill due {formatDate(medication.nextRefillDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Medication options for ${medication.medicationName}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onUpdate(medication.id, { isActive: false })}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Discontinue
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onRemove(medication.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {discontinuedMedications.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowDiscontinued(!showDiscontinued)}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                >
                  <Archive className="h-4 w-4" />
                  <span>
                    {showDiscontinued ? "Hide" : "Show"} {discontinuedMedications.length}{" "}
                    discontinued
                  </span>
                </button>
                {showDiscontinued && (
                  <div className="border-muted space-y-2 border-l-2 pl-6">
                    {discontinuedMedications.map((medication) => (
                      <div
                        key={medication.id}
                        className="rounded-lg border border-dashed p-3 opacity-60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium line-through">
                            {medication.medicationName}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Discontinued
                          </Badge>
                        </div>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdate(medication.id, { isActive: true })}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MedicationSection;
