"use client";

import * as React from "react";
import { Pill } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import type { Medication } from "@/src/lib/orchestration/types";

interface CurrentMedicationsSectionProps {
  medications: Medication[];
  className?: string;
}

export function CurrentMedicationsSection({
  medications,
  className,
}: CurrentMedicationsSectionProps) {
  if (!medications || medications.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
        Current Medications
      </h4>
      <div className="rounded-lg border border-stone-200 bg-white">
        {medications.map((medication, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              index !== medications.length - 1 && "border-b border-stone-100"
            )}
          >
            <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
              <Pill className="text-primary h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-stone-900">{medication.name}</div>
              <div className="text-sm text-stone-500">
                {medication.dosage} - {medication.frequency}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
