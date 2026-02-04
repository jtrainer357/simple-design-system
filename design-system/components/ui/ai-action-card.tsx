"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";

type ActionBadgeVariant = "default" | "success" | "warning" | "urgent";

interface AIActionCardProps {
  patientName: string;
  avatarSrc?: string;
  mainAction: string;
  statusIndicators: string;
  readyStatus: string;
  suggestedActions?: number;
  badgeText: string;
  badgeVariant?: ActionBadgeVariant;
  className?: string;
}

export function AIActionCard({
  patientName,
  avatarSrc,
  mainAction,
  statusIndicators,
  readyStatus,
  suggestedActions,
  badgeText,
  badgeVariant = "default",
  className,
}: AIActionCardProps) {
  const initials = patientName
    .split(" ")
    .map((n) => n[0])
    .join("");

  const badgeStyles = {
    default: "bg-stone-100 text-stone-600 border-stone-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    urgent: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <Card
      className={cn(
        "bg-card/80 border-0 p-4 shadow-md transition-all hover:shadow-lg sm:p-5",
        className
      )}
    >
      <div className="flex gap-4">
        {/* Big Avatar */}
        <Avatar className="h-20 w-20 shrink-0 shadow-sm sm:h-[88px] sm:w-[88px]">
          {avatarSrc && <AvatarImage src={avatarSrc} alt={patientName} />}
          <AvatarFallback className="bg-[#8CA7A2] text-sm font-semibold text-white sm:text-base">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Patient Name */}
              <h3 className="text-card-foreground text-base font-bold sm:text-lg">{patientName}</h3>

              {/* Main Action */}
              <p className="text-card-foreground mt-0.5 text-sm sm:text-base">{mainAction}</p>

              {/* Status Indicators */}
              <p className="text-muted-foreground mt-1 text-[10px] font-semibold tracking-wider uppercase sm:text-xs">
                {statusIndicators}
              </p>
            </div>

            {/* Badge */}
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-wide sm:text-xs",
                badgeStyles[badgeVariant]
              )}
            >
              {badgeText}
            </Badge>
          </div>

          {/* Ready Status */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 bg-white">
              <Check className="h-3 w-3 text-stone-500" />
            </div>
            <span className="text-card-foreground text-sm">
              {readyStatus}
              {suggestedActions && suggestedActions > 0 && (
                <span className="text-primary ml-2">
                  • {suggestedActions} suggested action{suggestedActions > 1 ? "s" : ""}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
