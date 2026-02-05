"use client";

import * as React from "react";
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";

type ActionStatus = "ENDED" | "IN PROGRESS" | "CHECKED IN" | "SCHEDULED";

interface ActionRowCardProps {
  time: string;
  patient: string;
  type: string;
  provider: string;
  status: ActionStatus;
  room: string;
  avatarSrc?: string;
  className?: string;
}

export function ActionRowCard({
  time,
  patient,
  type,
  provider: _provider,
  status,
  room,
  avatarSrc,
  className,
}: ActionRowCardProps) {
  const initials = patient
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className={cn("p-3 shadow-sm transition-all hover:shadow-md sm:p-4", className)}>
      <div className="flex items-center gap-4">
        {/* Time */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Clock className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-semibold">{time}</span>
        </div>

        {/* Patient info */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar className="ml-4 h-10 w-10 shrink-0">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={patient} />}
            <AvatarFallback className="bg-avatar-fallback text-xs text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold">{patient}</h4>
            <p className="text-muted-foreground truncate text-xs font-bold tracking-wider uppercase">
              {type}
            </p>
          </div>
        </div>

        {/* Status */}
        <Badge
          variant={
            status === "IN PROGRESS" ? "default" : status === "CHECKED IN" ? "secondary" : "outline"
          }
          className={cn(
            "shrink-0 rounded-md border-none px-2 py-0.5 text-xs font-bold",
            status === "ENDED" && "bg-muted text-muted-foreground",
            status === "SCHEDULED" && "border-muted text-muted-foreground border bg-transparent"
          )}
        >
          {status}
        </Badge>

        {/* Room */}
        <div className="text-muted-foreground ml-12 flex shrink-0 items-center gap-1 text-xs font-bold">
          <MapPin className="h-3.5 w-3.5" />
          {room}
        </div>
      </div>
    </Card>
  );
}
