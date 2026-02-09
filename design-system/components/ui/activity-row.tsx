"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

interface ActivityRowProps {
  title: string;
  description: string;
  date: string;
  isRecent?: boolean;
  isLast?: boolean;
  /** Whether this activity is currently selected */
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ActivityRow({
  title,
  description,
  date,
  isRecent = false,
  isLast = false,
  selected = false,
  className,
  onClick,
}: ActivityRowProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      className={cn("flex items-stretch gap-4 pl-0.5", className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View ${title}` : undefined}
      aria-selected={selected}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {/* Timeline column with dot and connecting line */}
      <div className="relative flex flex-col items-center">
        {/* Dot - solid fill with white ring outline */}
        <motion.div
          className={cn(
            "relative z-10 mt-4 h-2.5 w-2.5 shrink-0 rounded-full ring-2 transition-colors",
            selected
              ? "bg-primary ring-primary/30"
              : isRecent
                ? "bg-activity-indicator ring-white"
                : "bg-stone-300 ring-white"
          )}
          animate={selected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        {/* Vertical dashed line (hidden for last item) */}
        {!isLast && (
          <div className="absolute top-7 bottom-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-stone-300" />
        )}
      </div>

      {/* Card content */}
      <div
        className={cn(
          "mb-3 flex-1 cursor-pointer rounded-lg p-4 shadow-sm transition-all",
          selected
            ? "bg-primary/5 ring-primary/20 shadow-md ring-2"
            : "border border-stone-100 bg-white hover:shadow-md"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                "text-sm font-semibold",
                selected ? "text-primary" : "text-card-foreground"
              )}
            >
              {title}
            </h4>
            <Text size="sm" muted className="mt-1 line-clamp-2">
              {description}
            </Text>
          </div>
          <Text size="xs" muted className="shrink-0 whitespace-nowrap">
            {date}
          </Text>
        </div>
      </div>
    </motion.div>
  );
}

export type { ActivityRowProps };
