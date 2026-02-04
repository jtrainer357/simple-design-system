"use client";

import * as React from "react";
import {
  AlertTriangle,
  Pill,
  Calendar,
  Brain,
  Clock,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";

export type UrgencyLevel = "urgent" | "high" | "medium" | "low";
export type ActionIcon = "alert-triangle" | "pill" | "calendar" | "brain";
export type Timeframe =
  | "Immediate"
  | "Today"
  | "Within 3 days"
  | "This week"
  | "This month"
  | "Next visit";

export interface PrioritizedAction {
  id: string;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  timeframe: Timeframe;
  confidence: number; // 0-100
  icon: ActionIcon;
  patientId: string;
  suggestedActions: string[];
}

interface PrioritizedActionCardProps {
  action: PrioritizedAction;
  onClick?: (action: PrioritizedAction) => void;
  className?: string;
}

const iconMap: Record<ActionIcon, LucideIcon> = {
  "alert-triangle": AlertTriangle,
  pill: Pill,
  calendar: Calendar,
  brain: Brain,
};

const iconColorMap: Record<ActionIcon, string> = {
  "alert-triangle": "text-destructive bg-destructive/10",
  pill: "text-primary bg-primary/10",
  calendar: "text-teal bg-teal/10",
  brain: "text-chart-5 bg-chart-5/10",
};

const urgencyBadgeStyles: Record<UrgencyLevel, string> = {
  urgent: "bg-red-500 text-white border-none",
  high: "bg-orange-500 text-white border-none",
  medium: "bg-teal text-white border-none",
  low: "bg-slate-500 text-white border-none",
};

const urgencyCardStyles: Record<UrgencyLevel, string> = {
  urgent: "border-l-red-500 bg-red-500/5 border-[0.5px] border-l-4 border-red-500/20",
  high: "border-l-orange-500 bg-orange-500/5 border-[0.5px] border-l-4 border-orange-500/20",
  medium: "border-l-teal bg-teal/5 border-[0.5px] border-l-4 border-teal/20",
  low: "border-l-slate-500 bg-slate-500/5 border-[0.5px] border-l-4 border-slate-500/20",
};

export function PrioritizedActionCard({ action, onClick, className }: PrioritizedActionCardProps) {
  const Icon = iconMap[action.icon];
  const iconColor = iconColorMap[action.icon];

  const handleClick = () => {
    onClick?.(action);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(action);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg p-3 shadow-[var(--shadow-md)] transition-all hover:shadow-[var(--shadow-lg)] sm:gap-4 sm:p-4",
        urgencyCardStyles[action.urgency],
        onClick && "cursor-pointer",
        className
      )}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
          iconColor
        )}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-foreground-strong text-sm font-semibold sm:text-base">
              {action.title}
            </h4>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">{action.description}</p>
          </div>
          <Badge
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase sm:text-xs",
              urgencyBadgeStyles[action.urgency]
            )}
          >
            {action.urgency}
          </Badge>
        </div>

        {/* Metadata Row */}
        <div className="mt-2 flex items-center gap-3">
          <span className="text-muted-foreground flex items-center gap-1 text-[10px] sm:text-xs">
            <Clock className="h-3 w-3" />
            {action.timeframe}
          </span>
          <span className="text-primary flex items-center gap-1 text-[10px] sm:text-xs">
            <Sparkles className="h-3 w-3" />
            {action.confidence}% confidence
          </span>
        </div>
      </div>
    </div>
  );
}

export type { PrioritizedActionCardProps };
