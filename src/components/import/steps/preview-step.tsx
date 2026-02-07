"use client";

import React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Badge } from "@/design-system/components/ui/badge";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import { AlertCircleIcon, File, UserIcon } from "lucide-react";

interface PreviewStepProps {
  batchId: string;
  stats?: {
    patientsReady: number;
    documentsMatched: number;
    issuesCount: number;
  };
  onCommit: () => void;
  isCommitting?: boolean;
}

export function PreviewStep({
  batchId: _batchId,
  stats = { patientsReady: 5, documentsMatched: 5, issuesCount: 1 },
  onCommit,
  isCommitting = false,
}: PreviewStepProps) {
  const [confirmed, setConfirmed] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Ready to Import?</h2>
        <p className="text-gray-500">
          Please review the summary before committing to your practice.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="space-y-2 border-teal-200 bg-teal-50 p-4 text-center sm:p-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
            <UserIcon className="h-6 w-6" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.patientsReady}</div>
          <div className="text-sm font-medium tracking-wider text-gray-600 uppercase">
            Patients Ready
          </div>
        </Card>

        <Card className="space-y-2 p-4 text-center sm:p-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <File className="h-6 w-6" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.documentsMatched}</div>
          <div className="text-sm font-medium tracking-wider text-gray-600 uppercase">
            Documents Matched
          </div>
        </Card>

        <Card className="space-y-2 border-amber-200 bg-amber-50 p-4 text-center sm:p-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertCircleIcon className="h-6 w-6" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.issuesCount}</div>
          <div className="text-sm font-medium tracking-wider text-gray-600 uppercase">
            Issues to Review
          </div>
        </Card>
      </div>

      <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
        <h4 className="font-semibold text-gray-900">Import Preview (First 3 Records)</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between rounded border border-gray-200 bg-white p-2">
            <span>Patient A (DOB: 1985-03-12)</span>
            <Badge className="bg-emerald-600 text-white">Ready</Badge>
          </div>
          <div className="flex justify-between rounded border border-gray-200 bg-white p-2">
            <span>Patient B (DOB: 1990-07-22)</span>
            <Badge className="bg-emerald-600 text-white">Ready</Badge>
          </div>
          <div className="flex justify-between rounded border border-gray-200 bg-white p-2">
            <span>Patient C (DOB: 1978-11-30)</span>
            <Badge className="bg-amber-500 text-white">Duplicate?</Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 rounded-lg border border-teal-200 bg-teal-50 p-4">
        <Checkbox
          id="confirm"
          checked={confirmed}
          onCheckedChange={(c: boolean | "indeterminate") => setConfirmed(!!c)}
        />
        <label
          htmlFor="confirm"
          className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I understand this import action cannot be undone.
        </label>
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
        <Button variant="outline" className="order-2 sm:order-1">
          Review Issues
        </Button>
        <Button
          className="order-1 w-full bg-teal-600 hover:bg-teal-700 sm:order-2 sm:w-48"
          size="lg"
          onClick={onCommit}
          disabled={!confirmed || isCommitting}
        >
          {isCommitting ? "Importing..." : "Import Everything"}
        </Button>
      </div>
    </div>
  );
}
