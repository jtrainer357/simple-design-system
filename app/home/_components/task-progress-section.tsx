"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

interface TaskItem {
  id: string;
  label: string;
  completed: boolean;
  step?: number;
}

interface TaskProgressSectionProps {
  className?: string;
}

// Demo task progress data
const taskItems: TaskItem[] = [
  { id: "1", label: "Opened patient record", completed: true },
  { id: "2", label: "Send message", completed: false, step: 2 },
  { id: "3", label: "Order follow-up", completed: false, step: 3 },
];

export function TaskProgressSection({ className }: TaskProgressSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
        Task Progress
      </h4>

      <div className="rounded-lg border border-stone-200 bg-white">
        {taskItems.map((task, index) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              index !== taskItems.length - 1 && "border-b border-stone-100",
              task.completed && "bg-priority-bg/30"
            )}
          >
            {task.completed ? (
              <div className="bg-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-sm font-medium text-stone-500">
                {task.step}
              </div>
            )}
            <span
              className={cn(
                "text-sm font-medium",
                task.completed ? "text-primary" : "text-stone-600"
              )}
            >
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
