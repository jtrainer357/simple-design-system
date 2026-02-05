"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/design-system/components/ui/card";
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
      opacity="solid"
      className={cn(
        "cursor-pointer border-0 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Three column table: avatar | content | badge */}
        <div className="table w-full table-fixed">
          {/* Avatar column - fixed width with gap */}
          <div className="table-cell w-[100px] align-middle">
            <Avatar className="h-16 w-16 border-4 border-white sm:h-20 sm:w-20">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={patientName} />}
              <AvatarFallback className="bg-avatar-fallback text-base font-semibold text-white sm:text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content column - takes remaining space */}
          <div className="table-cell align-middle">
            {/* Patient Name */}
            <div className="text-card-foreground truncate text-base font-bold sm:text-lg">
              {patientName}
            </div>

            {/* Main Action */}
            <div className="text-card-foreground truncate text-sm sm:text-base">{mainAction}</div>

            {/* Status Indicators */}
            <div className="text-muted-foreground mt-0.5 truncate text-sm">{statusIndicators}</div>

            {/* Ready Status */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white">
                <Check className="h-3 w-3 text-stone-500" />
              </div>
              <span className="text-card-foreground truncate text-sm">
                {readyStatus}
                {suggestedActions && suggestedActions > 0 && (
                  <span className="text-primary ml-2 cursor-pointer hover:underline">
                    + {suggestedActions} suggested action{suggestedActions > 1 ? "s" : ""}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Badge column - fixed width, positioned with flex */}
          <div className="table-cell w-[120px] pl-3 align-top">
            <div className="flex justify-end">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap sm:text-xs",
                  badgeStyles[badgeVariant]
                )}
              >
                {badgeText}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
