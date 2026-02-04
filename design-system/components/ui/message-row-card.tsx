"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { cn } from "@/design-system/lib/utils";
import { LucideIcon } from "lucide-react";

interface MessageRowCardProps {
  name: string;
  text: string;
  time: string;
  unread?: boolean;
  avatarSrc?: string;
  icon?: LucideIcon;
  className?: string;
}

export function MessageRowCard({
  name,
  text,
  time,
  unread = false,
  avatarSrc,
  icon: Icon,
  className,
}: MessageRowCardProps) {
  return (
    <Card className={cn("p-3", className)}>
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
          <AvatarFallback className="bg-[#8CA7A2] text-sm text-white">
            {Icon ? <Icon className="h-5 w-5" /> : name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <h5 className="truncate text-sm font-bold">{name}</h5>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-muted-foreground text-xs font-bold whitespace-nowrap">
                {time}
              </span>
              {unread && <div className="bg-primary h-2 w-2 rounded-full" />}
            </div>
          </div>
          <p className="text-muted-foreground truncate text-sm font-medium">{text}</p>
        </div>
      </div>
    </Card>
  );
}
