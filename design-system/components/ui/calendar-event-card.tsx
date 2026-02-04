"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";

export type EventColor =
  | "blue"
  | "pink"
  | "purple"
  | "green"
  | "yellow"
  | "gray"
  | "red"
  | "orange";

interface CalendarEventCardProps {
  title: string;
  time: string;
  color?: EventColor;
  hasNotification?: boolean;
  onClick?: () => void;
  className?: string;
}

const colorStyles: Record<
  EventColor,
  { bg: string; text: string; borderLeft: string; borderOuter: string }
> = {
  blue: {
    bg: "bg-[#CBDDE0]/60",
    text: "text-teal",
    borderLeft: "border-l-teal",
    borderOuter: "border-teal/30",
  },
  pink: {
    bg: "bg-primary/10",
    text: "text-primary",
    borderLeft: "border-l-primary",
    borderOuter: "border-primary/20",
  },
  purple: {
    bg: "bg-[#E8E4DF]/80",
    text: "text-foreground",
    borderLeft: "border-l-[#9B8F85]",
    borderOuter: "border-[#9B8F85]/30",
  },
  green: {
    bg: "bg-[#C6DCCE]/50",
    text: "text-[#3D6B4F]",
    borderLeft: "border-l-[#6B8B73]",
    borderOuter: "border-[#6B8B73]/30",
  },
  yellow: {
    bg: "bg-[#FEF5D5]/60",
    text: "text-[#8B7355]",
    borderLeft: "border-l-[#D4B896]",
    borderOuter: "border-[#D4B896]/40",
  },
  gray: {
    bg: "bg-muted/80",
    text: "text-muted-foreground",
    borderLeft: "border-l-border",
    borderOuter: "border-border/50",
  },
  red: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    borderLeft: "border-l-destructive",
    borderOuter: "border-destructive/20",
  },
  orange: {
    bg: "bg-primary/15",
    text: "text-primary",
    borderLeft: "border-l-primary/80",
    borderOuter: "border-primary/20",
  },
};

export function CalendarEventCard({
  title,
  time,
  color = "blue",
  hasNotification = false,
  onClick,
  className,
}: CalendarEventCardProps) {
  const styles = colorStyles[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full overflow-hidden rounded-md border border-l-[3px] px-2 py-1.5 text-left transition-all hover:brightness-95",
        styles.bg,
        styles.borderLeft,
        styles.borderOuter,
        className
      )}
    >
      {hasNotification && (
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
      <p className={cn("truncate text-xs leading-tight font-semibold", styles.text)}>{title}</p>
      <p className={cn("mt-0.5 text-[10px] font-medium opacity-60", styles.text)}>{time}</p>
    </button>
  );
}
