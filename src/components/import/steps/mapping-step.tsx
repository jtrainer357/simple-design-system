"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";
import { AlertCircleIcon, ArrowRightIcon } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import type { ColumnMapping } from "@/src/lib/ai/gemini-import";

const TARGET_FIELD_OPTIONS = [
  { value: "", label: "(Do Not Import)" },
  { value: "first_name", label: "First Name" },
  { value: "last_name", label: "Last Name" },
  { value: "date_of_birth", label: "Date of Birth" },
  { value: "email", label: "Email" },
  { value: "phone_mobile", label: "Phone (Mobile)" },
  { value: "phone_home", label: "Phone (Home)" },
  { value: "address_street", label: "Street Address" },
  { value: "address_city", label: "City" },
  { value: "address_state", label: "State" },
  { value: "address_zip", label: "ZIP Code" },
  { value: "insurance_name", label: "Insurance Name" },
  { value: "insurance_member_id", label: "Insurance Member ID" },
  { value: "primary_diagnosis_code", label: "Primary Diagnosis Code" },
  { value: "notes", label: "Notes" },
] as const;

const REQUIRED_FIELDS = ["first_name", "last_name", "date_of_birth"];

interface MappingStepProps {
  mappings: ColumnMapping[];
  onComplete: (confirmedMappings: ColumnMapping[]) => void;
}

export function MappingStep({ mappings: initialMappings, onComplete }: MappingStepProps) {
  const [mappings, setMappings] = React.useState<ColumnMapping[]>(initialMappings);

  const handleConfirm = () => {
    onComplete(mappings);
  };

  const handleTargetChange = (idx: number, newTarget: string) => {
    setMappings((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, targetField: newTarget || null } : m))
    );
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return "High";
    if (confidence >= 0.7) return "Medium";
    return "Low";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-emerald-600 text-white";
    if (confidence >= 0.7) return "bg-amber-500 text-white";
    return "bg-red-500 text-white";
  };

  const mappedTargets = mappings.map((m) => m.targetField).filter(Boolean);
  const missingRequired = REQUIRED_FIELDS.filter((f) => !mappedTargets.includes(f));

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Review Data Mapping</h2>
        <p className="text-gray-500">
          We&apos;ve mapped your file columns to our system. Adjust any fields as needed.
        </p>
      </div>

      {missingRequired.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircleIcon className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-gray-900">
            <span className="font-semibold">Required fields not mapped:</span>{" "}
            {missingRequired
              .map((f) => TARGET_FIELD_OPTIONS.find((o) => o.value === f)?.label ?? f)
              .join(", ")}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {mappings.map((mapping, idx) => {
          const isLowConfidence = mapping.confidence < 0.7;
          return (
            <Card
              key={idx}
              className={cn(
                "flex items-center justify-between p-4",
                isLowConfidence && "border-2 border-amber-400"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-semibold text-gray-500 uppercase">Source Column</p>
                <span className="block truncate font-medium text-gray-900">
                  {mapping.sourceColumn}
                </span>
              </div>

              <div className="mx-4 shrink-0 text-gray-400">
                <ArrowRightIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-semibold text-gray-500 uppercase">Target Field</p>
                <div className="flex items-center gap-2">
                  <select
                    value={mapping.targetField ?? ""}
                    onChange={(e) => handleTargetChange(idx, e.target.value)}
                    className={cn(
                      "h-9 flex-1 rounded-md border bg-white px-2 text-sm font-medium text-gray-900",
                      "focus:ring-2 focus:ring-teal-500 focus:outline-none",
                      isLowConfidence ? "border-amber-400" : "border-gray-300"
                    )}
                  >
                    {TARGET_FIELD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <Badge className={cn("shrink-0", getConfidenceColor(mapping.confidence))}>
                    {getConfidenceLevel(mapping.confidence)}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button className="bg-teal-600 hover:bg-teal-700" size="lg" onClick={handleConfirm}>
          Confirm Mappings
        </Button>
      </div>
    </div>
  );
}
