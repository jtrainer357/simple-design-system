"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import type { LabResult, TrendDirection, LabStatus } from "@/src/lib/orchestration/types";

interface LabResultsSectionProps {
  labResults: LabResult[];
  className?: string;
}

const statusColors: Record<LabStatus, string> = {
  normal: "text-emerald-600",
  elevated: "text-amber-600",
  critical: "text-red-600",
};

const statusBgColors: Record<LabStatus, string> = {
  normal: "bg-emerald-50",
  elevated: "bg-amber-50",
  critical: "bg-red-50",
};

const statusLabels: Record<LabStatus, string> = {
  normal: "Normal",
  elevated: "Elevated",
  critical: "Critical",
};

function TrendIndicator({ trend, trendValue }: { trend?: TrendDirection; trendValue?: string }) {
  if (!trend || trend === "stable") {
    return (
      <div className="flex items-center gap-1 text-sm text-stone-500">
        <Minus className="h-4 w-4" />
        <span>{trendValue || "Stable"}</span>
      </div>
    );
  }

  const isDown = trend === "down";
  const Icon = isDown ? TrendingDown : TrendingUp;
  const colorClass = isDown ? "text-emerald-600" : "text-amber-600";

  return (
    <div className={cn("flex items-center gap-1 text-sm", colorClass)}>
      <Icon className="h-4 w-4" />
      <span>{trendValue}</span>
    </div>
  );
}

export function LabResultsSection({ labResults, className }: LabResultsSectionProps) {
  if (!labResults || labResults.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">Lab Results</h4>
      <div className="space-y-2">
        {labResults.map((lab, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3",
              "transition-colors hover:border-stone-300"
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-900">{lab.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    statusBgColors[lab.status],
                    statusColors[lab.status]
                  )}
                >
                  {statusLabels[lab.status]}
                </span>
              </div>
              {(lab.trend || lab.trendValue) && (
                <TrendIndicator trend={lab.trend} trendValue={lab.trendValue} />
              )}
            </div>
            <div className="text-right">
              <span className={cn("text-xl font-semibold", statusColors[lab.status])}>
                {lab.value}
              </span>
              <span className="ml-1 text-sm text-stone-500">{lab.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
