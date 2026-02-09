"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { PatientCardBaseProps } from "./types";
import { ROSTER_ANIMATION_CONFIG } from "./types";

/**
 * Compact patient card for summary/note states (140px width)
 * Shows avatar with status overlay, truncated name, and phone icon
 */
export function PatientCardCompact({
  patient,
  selected = false,
  onSelect,
  className,
}: PatientCardBaseProps) {
  const initials = `${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`;

  // Map status to badge variant and color for overlay
  const statusConfig = React.useMemo(() => {
    switch (patient.status) {
      case "ACTIVE":
        return { variant: "active" as const, dotClass: "bg-success" };
      case "NEW":
        return { variant: "new" as const, dotClass: "bg-blue-500" };
      case "INACTIVE":
        return { variant: "inactive" as const, dotClass: "bg-gray-400" };
      default:
        return { variant: "secondary" as const, dotClass: "bg-gray-400" };
    }
  }, [patient.status]);

  // Truncate name for compact display
  const truncatedName = React.useMemo(() => {
    const maxLength = 12;
    if (patient.name.length <= maxLength) return patient.name;
    return patient.name.substring(0, maxLength - 1) + "...";
  }, [patient.name]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: ROSTER_ANIMATION_CONFIG.duration,
        ease: ROSTER_ANIMATION_CONFIG.ease,
      }}
      layout
    >
      <button
        type="button"
        className={cn(
          "flex w-full flex-col items-center gap-1.5 rounded-lg p-2 transition-colors",
          "hover:bg-card-hover/70 focus-visible:outline-ring",
          "min-h-[72px]", // Ensure 44px+ touch target
          selected && "bg-accent/30",
          className
        )}
        onClick={onSelect}
        aria-label={`Select ${patient.name}, ${patient.status.toLowerCase()}`}
        aria-pressed={selected}
      >
        {/* Avatar with status overlay - 32px as specified */}
        <div className="relative">
          <Avatar className="h-8 w-8 shrink-0">
            {patient.avatarSrc && <AvatarImage src={patient.avatarSrc} alt={patient.name} />}
            <AvatarFallback className="bg-avatar-fallback text-xs font-medium text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Status dot overlay on avatar */}
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white",
              statusConfig.dotClass
            )}
            aria-label={`Status: ${patient.status}`}
          />
        </div>

        {/* Truncated name */}
        <Text
          size="xs"
          className={cn(
            "w-full truncate text-center font-medium",
            selected ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {truncatedName}
        </Text>

        {/* Phone icon only */}
        <div
          className="text-muted-foreground flex items-center justify-center"
          aria-label={`Phone: ${patient.phone}`}
        >
          <Phone className="h-3 w-3" aria-hidden="true" />
        </div>
      </button>
    </motion.div>
  );
}

/**
 * Alternative compact card with horizontal layout
 * Can be used when more width is available
 */
export function PatientCardCompactHorizontal({
  patient,
  selected = false,
  onSelect,
  className,
}: PatientCardBaseProps) {
  const initials = `${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`;

  const statusConfig = React.useMemo(() => {
    switch (patient.status) {
      case "ACTIVE":
        return { dotClass: "bg-success" };
      case "NEW":
        return { dotClass: "bg-blue-500" };
      case "INACTIVE":
        return { dotClass: "bg-gray-400" };
      default:
        return { dotClass: "bg-gray-400" };
    }
  }, [patient.status]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{
        duration: ROSTER_ANIMATION_CONFIG.duration,
        ease: ROSTER_ANIMATION_CONFIG.ease,
      }}
      layout
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 rounded-lg p-2 transition-colors",
          "hover:bg-card-hover/70 focus-visible:outline-ring",
          "min-h-[44px]", // Minimum touch target
          selected && "bg-accent/30",
          className
        )}
        onClick={onSelect}
        aria-label={`Select ${patient.name}, ${patient.status.toLowerCase()}`}
        aria-pressed={selected}
      >
        {/* Avatar with status overlay */}
        <div className="relative shrink-0">
          <Avatar className="h-8 w-8">
            {patient.avatarSrc && <AvatarImage src={patient.avatarSrc} alt={patient.name} />}
            <AvatarFallback className="bg-avatar-fallback text-xs font-medium text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
              statusConfig.dotClass
            )}
            aria-hidden="true"
          />
        </div>

        {/* Name */}
        <Text
          size="xs"
          className={cn(
            "min-w-0 flex-1 truncate text-left font-medium",
            selected ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {patient.firstName}
        </Text>
      </button>
    </motion.div>
  );
}
