"use client";

import * as React from "react";
import {
  Calendar,
  AlertTriangle,
  Pill,
  FileText,
  Clock,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";

export type PriorityLevel = "urgent" | "high" | "medium" | "low";
export type ActionType =
  | "medication"
  | "followup"
  | "documentation"
  | "screening"
  | "risk"
  | "care-gap";

export interface PriorityActionCardProps {
  /** Unique identifier for the action */
  id?: string;
  /** Type of action - determines the icon displayed */
  type: ActionType;
  /** Main title of the priority action */
  title: string;
  /** Detailed description of the action */
  description: string;
  /** Priority level - determines color scheme */
  priority: PriorityLevel;
  /** Optional due date or timeframe */
  dueDate?: string;
  /** Optional AI confidence percentage (0-100) */
  aiConfidence?: number;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for the card */
  onClick?: () => void;
}

const actionTypeConfig: Record<ActionType, { icon: LucideIcon; color: string }> = {
  medication: { icon: Pill, color: "text-primary bg-primary/10" },
  followup: { icon: Clock, color: "text-primary bg-primary/10" },
  documentation: { icon: FileText, color: "text-muted-foreground bg-muted" },
  screening: { icon: TrendingUp, color: "text-success bg-success/10" },
  risk: { icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
  "care-gap": { icon: Calendar, color: "text-teal bg-teal/10" },
};

const priorityStyles: Record<PriorityLevel, string> = {
  urgent: "border-l-destructive bg-destructive/5 border-[0.5px] border-l-4 border-destructive/20",
  high: "border-l-primary bg-primary/5 border-[0.5px] border-l-4 border-primary/20",
  medium: "border-l-teal bg-teal/5 border-[0.5px] border-l-4 border-teal/20",
  low: "border-l-muted-foreground bg-muted/50 border-[0.5px] border-l-4 border-border",
};

const priorityBadgeStyles: Record<PriorityLevel, string> = {
  urgent: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-primary/10 text-primary border-primary/20",
  medium: "bg-teal/10 text-teal border-teal/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function PriorityActionCard({
  type,
  title,
  description,
  priority,
  dueDate,
  aiConfidence,
  className,
  onClick,
}: PriorityActionCardProps) {
  const config = actionTypeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg p-3 shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] sm:gap-4 sm:p-4",
        priorityStyles[priority],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
          config.color
        )}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-foreground-strong text-sm font-semibold sm:text-base">{title}</h4>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">{description}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase sm:text-xs",
              priorityBadgeStyles[priority]
            )}
          >
            {priority}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-3">
          {dueDate && (
            <span className="text-muted-foreground flex items-center gap-1 text-[10px] sm:text-xs">
              <Clock className="h-3 w-3" />
              {dueDate}
            </span>
          )}
          {aiConfidence && (
            <span className="text-primary flex items-center gap-1 text-[10px] sm:text-xs">
              <Sparkles className="h-3 w-3" />
              {aiConfidence}% confidence
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
