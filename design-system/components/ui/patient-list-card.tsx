"use client";

import * as React from "react";
import { Mail, MessageSquare, MoreHorizontal } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Button } from "@/design-system/components/ui/button";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

type PatientStatus = "ACTIVE" | "INACTIVE" | "NEW";

interface PatientListCardProps {
  name: string;
  age: number;
  dob: string;
  phone: string;
  lastActivity: string;
  status: PatientStatus;
  avatarSrc?: string;
  selected?: boolean;
  onSelect?: () => void;
  onMessage?: () => void;
  onEmail?: () => void;
  onMore?: () => void;
  className?: string;
}

export function PatientListCard({
  name,
  age,
  dob,
  phone,
  lastActivity,
  status,
  avatarSrc,
  selected = false,
  onSelect,
  onMessage,
  onEmail,
  onMore,
  className,
}: PatientListCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card
      className={cn(
        "hover:bg-card-hover/70 cursor-pointer p-3 transition-all hover:border-white hover:shadow-md sm:p-4",
        selected && "border-selected-border bg-accent/30",
        className
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0 sm:h-11 sm:w-11">
          {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
          <AvatarFallback className="bg-avatar-fallback text-xs font-medium text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Patient Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-card-foreground truncate text-sm font-bold">{name}</h4>
            <Badge
              variant={status === "ACTIVE" ? "active" : status === "NEW" ? "new" : "inactive"}
              className="shrink-0 rounded-md border-none px-2 py-0.5 text-xs font-bold"
            >
              {status}
            </Badge>
          </div>
          <Text size="xs" muted className="mt-0.5">
            Age {age} &bull; {dob}
          </Text>
          <Text size="xs" muted className="mt-0.5">
            {phone}
          </Text>
        </div>
      </div>

      {/* Bottom row - Last Activity and Actions */}
      <div className="border-border/50 mt-2 -mb-1 flex items-center justify-between border-t pt-1">
        <Text size="xs" muted className="font-medium tracking-wide uppercase">
          Last Activity: {lastActivity}
        </Text>
        <div className="-mr-1 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative h-11 w-11"
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.();
            }}
            aria-label={`Send message to ${name}`}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative h-11 w-11"
            onClick={(e) => {
              e.stopPropagation();
              onEmail?.();
            }}
            aria-label={`Send email to ${name}`}
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative h-11 w-11"
            onClick={(e) => {
              e.stopPropagation();
              onMore?.();
            }}
            aria-label={`More options for ${name}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export type { PatientListCardProps, PatientStatus };
