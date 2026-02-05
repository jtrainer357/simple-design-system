"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { Button } from "@/design-system/components/ui/button";
import { Paperclip, Image, Wand2, Smile, Send } from "lucide-react";

interface ChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: (message: string) => void;
  onAttachFile?: () => void;
  onAttachImage?: () => void;
  onAiAssist?: () => void;
  onEmoji?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({
  value = "",
  onChange,
  onSend,
  onAttachFile,
  onAttachImage,
  onAiAssist,
  onEmoji,
  placeholder = "Write a message",
  disabled = false,
  className,
}: ChatInputProps) {
  const [internalValue, setInternalValue] = React.useState(value);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const currentValue = onChange ? value : internalValue;
  const setValue = onChange || setInternalValue;

  const handleSend = () => {
    if (currentValue.trim() && onSend) {
      onSend(currentValue.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [currentValue]);

  return (
    <div className={cn("border-border bg-card border-t p-4", className)}>
      <div className="flex items-center gap-3">
        <div className="border-border bg-background focus-within:ring-ring flex h-10 flex-1 items-center rounded-full border pr-2 pl-4 focus-within:ring-2">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1 bg-transparent text-sm outline-none",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-8 w-8 before:absolute before:inset-[-4px] before:content-['']"
              onClick={onAttachFile}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-8 w-8 before:absolute before:inset-[-4px] before:content-['']"
              onClick={onAttachImage}
              disabled={disabled}
            >
              <Image className="h-4 w-4" />
              <span className="sr-only">Attach image</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-8 w-8 before:absolute before:inset-[-4px] before:content-['']"
              onClick={onAiAssist}
              disabled={disabled}
            >
              <Wand2 className="h-4 w-4" />
              <span className="sr-only">AI assist</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative h-8 w-8 before:absolute before:inset-[-4px] before:content-['']"
              onClick={onEmoji}
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </div>
        </div>

        <Button onClick={handleSend} disabled={disabled || !currentValue.trim()} className="gap-2">
          Send
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export type { ChatInputProps };
