"use client";
import * as React from "react";
import { Card, CardContent } from "@/design-system/components/ui/card";
import { Button } from "@/design-system/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";

export interface PriorityActionProps {
  label?: string;
  title: string;
  subtitle: string;
  avatarInitials?: string;
  avatarSrc?: string;
  buttonText: string;
  onButtonClick?: () => void;
  className?: string;
}

export function PriorityAction({
  label = "Priority Action",
  title,
  subtitle,
  avatarInitials,
  avatarSrc,
  buttonText,
  onButtonClick,
  className,
}: PriorityActionProps) {
  return (
    <Card className={cn("overflow-hidden bg-[#FFCFBF]/50 backdrop-blur-xl", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 shrink-0 border-4 border-white sm:h-14 sm:w-14">
              {avatarSrc && <AvatarImage src={avatarSrc} />}
              <AvatarFallback className="bg-[#8CA7A2] text-sm text-white sm:text-base">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-1.5">
                <Text
                  size="xs"
                  muted
                  className="text-[10px] font-bold tracking-wider uppercase sm:text-xs"
                >
                  {label}
                </Text>
                <div className="bg-primary h-1 w-1 rounded-full" />
              </div>
              <Heading level={4} className="truncate text-base sm:text-xl">
                {title}
              </Heading>
              <Text size="sm" muted className="truncate text-xs sm:text-sm">
                {subtitle}
              </Text>
            </div>
          </div>
          <Button onClick={onButtonClick} className="w-full sm:w-auto">
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
