"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { cn } from "@/design-system/lib/utils";
import { Check, CheckCheck, Smile, Pause, Play } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";

type MessageType = "text" | "voice";
type MessageStatus = "sent" | "delivered" | "read";

interface ChatMessageProps {
  content: string;
  time: string;
  isOwn?: boolean;
  senderName?: string;
  senderAvatar?: string;
  type?: MessageType;
  status?: MessageStatus;
  voiceDuration?: string;
  showAvatar?: boolean;
  className?: string;
}

export function ChatMessage({
  content,
  time,
  isOwn = false,
  senderName,
  senderAvatar,
  type = "text",
  status,
  voiceDuration,
  showAvatar = true,
  className,
}: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const initials = senderName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const StatusIcon = status === "read" ? CheckCheck : status === "delivered" ? CheckCheck : Check;

  return (
    <div className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "flex-row", className)}>
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          {senderAvatar && <AvatarImage src={senderAvatar} alt={senderName} />}
          <AvatarFallback className="bg-avatar-fallback text-primary-foreground text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[70%] space-y-1", isOwn && "items-end")}>
        {!isOwn && senderName && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{senderName}</span>
            <span className="text-muted-foreground text-xs">{time}</span>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "border-border/50 rounded-bl-md border bg-white shadow-sm"
          )}
        >
          {type === "text" ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-11 w-11 rounded-full",
                  isOwn ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
                )}
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex items-center gap-1">
                {[
                  8, 12, 6, 16, 10, 14, 5, 18, 7, 15, 9, 13, 6, 17, 11, 8, 14, 6, 16, 10, 12, 5, 18,
                  9, 15, 7, 13, 11, 17, 8,
                ].map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-0.5 rounded-full",
                      isOwn ? "bg-primary-foreground/60" : "bg-muted-foreground/40"
                    )}
                    style={{
                      height: `${h}px`,
                    }}
                  />
                ))}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isOwn ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {voiceDuration}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-11 w-11 rounded-full",
                  isOwn ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
                )}
                aria-label="Add reaction"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isOwn && (
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-muted-foreground text-xs">{time}</span>
            {status && (
              <StatusIcon
                className={cn(
                  "h-3.5 w-3.5",
                  status === "read" ? "text-primary" : "text-muted-foreground"
                )}
              />
            )}
          </div>
        )}
      </div>

      {isOwn && showAvatar && senderAvatar && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={senderAvatar} alt="You" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export type { ChatMessageProps, MessageType, MessageStatus };
