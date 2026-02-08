"use client";

import { useEffect, useState } from "react";
import { Clock, Play, Pause, Square, DollarSign } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { Badge } from "@/design-system/components/ui/badge";
import { cn } from "@/design-system/lib/utils";
import {
  useSessionTimer,
  getSuggestedCPTCode,
  getApplicableCPTCodes,
  type NoteType,
  type CPTCode,
} from "@/src/lib/session";

interface SessionTimerProps {
  initialSeconds?: number;
  noteType?: NoteType;
  selectedCPTCode?: string;
  onCPTCodeChange?: (code: string) => void;
  onTimerChange?: (data: {
    isRunning: boolean;
    elapsedSeconds: number;
    elapsedMinutes: number;
  }) => void;
  compact?: boolean;
}

export function SessionTimer({
  initialSeconds = 0,
  noteType = "progress_note",
  selectedCPTCode,
  onCPTCodeChange,
  onTimerChange,
  compact = false,
}: SessionTimerProps) {
  const timer = useSessionTimer(initialSeconds);
  const [suggestedCode, setSuggestedCode] = useState<CPTCode | null>(null);
  const applicableCodes = getApplicableCPTCodes(noteType);

  useEffect(() => {
    const suggested = getSuggestedCPTCode(timer.elapsedMinutes, noteType);
    setSuggestedCode(suggested);
    if (suggested && !selectedCPTCode && timer.isRunning) {
      onCPTCodeChange?.(suggested.code);
    }
  }, [timer.elapsedMinutes, noteType, selectedCPTCode, timer.isRunning, onCPTCodeChange]);

  useEffect(() => {
    onTimerChange?.({
      isRunning: timer.isRunning,
      elapsedSeconds: timer.elapsedSeconds,
      elapsedMinutes: timer.elapsedMinutes,
    });
  }, [timer.isRunning, timer.elapsedSeconds, timer.elapsedMinutes, onTimerChange]);

  const getMinutesToBillable = (): number | null => {
    if (timer.elapsedMinutes >= 16) return null;
    return 16 - timer.elapsedMinutes;
  };

  const minutesToBillable = getMinutesToBillable();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="text-muted-foreground h-4 w-4" />
        <span className="font-mono text-sm">{timer.formattedTime}</span>
        {suggestedCode && (
          <Badge variant="outline" className="text-xs">
            {suggestedCode.code}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              timer.isRunning
                ? "bg-green-100 text-green-700"
                : timer.isPaused
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-muted text-muted-foreground"
            )}
          >
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="font-mono text-3xl font-semibold">{timer.formattedTime}</div>
            <div className="text-muted-foreground text-sm">{timer.elapsedMinutes} minutes</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!timer.isRunning && !timer.isPaused && (
            <Button onClick={timer.start} size="sm">
              <Play className="mr-1 h-4 w-4" />
              Start
            </Button>
          )}
          {timer.isRunning && (
            <Button onClick={timer.pause} variant="outline" size="sm">
              <Pause className="mr-1 h-4 w-4" />
              Pause
            </Button>
          )}
          {timer.isPaused && (
            <Button onClick={timer.resume} size="sm">
              <Play className="mr-1 h-4 w-4" />
              Resume
            </Button>
          )}
          {(timer.isRunning || timer.isPaused) && (
            <Button onClick={timer.stop} variant="destructive" size="sm">
              <Square className="mr-1 h-4 w-4" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {minutesToBillable !== null && (
        <div className="flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-600">
          <DollarSign className="h-4 w-4" />
          <span>
            {minutesToBillable} minute{minutesToBillable !== 1 ? "s" : ""} to billable session
            (90832)
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-muted-foreground mb-1 block text-sm font-medium">CPT Code</label>
          <Select value={selectedCPTCode || ""} onValueChange={(value) => onCPTCodeChange?.(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select CPT code" />
            </SelectTrigger>
            <SelectContent>
              {applicableCodes.map((code) => (
                <SelectItem key={code.code} value={code.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{code.code}</span>
                    <span className="text-muted-foreground text-sm">{code.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {suggestedCode && (
          <div className="pt-5">
            <Badge
              variant={selectedCPTCode === suggestedCode.code ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => onCPTCodeChange?.(suggestedCode.code)}
            >
              Suggested: {suggestedCode.code}
            </Badge>
          </div>
        )}
      </div>

      {selectedCPTCode && (
        <div className="text-muted-foreground text-sm">
          Estimated fee:{" "}
          <span className="text-foreground font-medium">
            ${applicableCodes.find((c) => c.code === selectedCPTCode)?.fee || 0}
          </span>
        </div>
      )}
    </div>
  );
}

export default SessionTimer;
