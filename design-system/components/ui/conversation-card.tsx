"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { cn } from "@/design-system/lib/utils";

interface ConversationCardProps {
  name: string;
  preview: string;
  time: string;
  unreadCount?: number;
  avatarSrc?: string;
  countryFlag?: string;
  selected?: boolean;
  pinned?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ConversationCard({
  name,
  preview,
  time,
  unreadCount,
  avatarSrc,
  countryFlag,
  selected = false,
  onClick,
  className,
}: ConversationCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <Card
      className={cn(
        "cursor-pointer p-3 transition-all",
        selected && "border-selected-border bg-accent/30",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 shrink-0">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
            <AvatarFallback className="bg-avatar-fallback text-primary-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {countryFlag && (
            <span className="absolute -right-0.5 -bottom-0.5 text-sm">{countryFlag}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <h5 className="truncate text-sm font-bold">{name}</h5>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-muted-foreground text-xs whitespace-nowrap">{time}</span>
              {unreadCount && unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </div>
          <p className="text-muted-foreground truncate text-sm">{preview}</p>
        </div>
      </div>
    </Card>
  );
}

export type { ConversationCardProps };
