"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  Pill,
  ClipboardList,
  FileCheck,
} from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import type {
  TaskProgress,
  TaskStatus,
  SuggestedAction,
  ActionType,
} from "@/src/lib/orchestration/types";

interface TaskProgressTrackerProps {
  taskProgress: TaskProgress[];
  actions: SuggestedAction[];
  className?: string;
}

const actionIcons: Record<ActionType, React.ComponentType<{ className?: string }>> = {
  message: MessageSquare,
  order: FileText,
  medication: Pill,
  task: ClipboardList,
  document: FileCheck,
};

const statusConfig: Record<
  TaskStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  pending: {
    icon: Clock,
    color: "text-stone-400",
    bgColor: "bg-stone-100",
    label: "Pending",
  },
  executing: {
    icon: Loader2,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    label: "Executing...",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    label: "Completed",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Failed",
  },
};

function formatTime(date?: Date): string {
  if (!date) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function TaskProgressTracker({
  taskProgress,
  actions,
  className,
}: TaskProgressTrackerProps) {
  if (taskProgress.length === 0) {
    return null;
  }

  // Create a map of actions for quick lookup
  const actionsMap = new Map(actions.map((action) => [action.id, action]));

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
        Execution Progress
      </h4>
      <div className="rounded-lg border border-stone-200 bg-white">
        <AnimatePresence mode="popLayout">
          {taskProgress.map((task, index) => {
            const action = actionsMap.get(task.actionId);
            if (!action) return null;

            const config = statusConfig[task.status];
            const StatusIcon = config.icon;
            const ActionIcon = actionIcons[action.type];

            return (
              <motion.div
                key={task.actionId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  index !== taskProgress.length - 1 && "border-b border-stone-100"
                )}
              >
                {/* Status Icon */}
                <motion.div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    config.bgColor
                  )}
                  animate={task.status === "executing" ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={
                    task.status === "executing" ? { repeat: Infinity, duration: 1 } : undefined
                  }
                >
                  <StatusIcon
                    className={cn(
                      "h-5 w-5",
                      config.color,
                      task.status === "executing" && "animate-spin"
                    )}
                  />
                </motion.div>

                {/* Action Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <ActionIcon className="h-4 w-4 text-stone-400" />
                    <span
                      className={cn(
                        "truncate text-sm font-medium",
                        task.status === "completed" ? "text-stone-600" : "text-stone-900"
                      )}
                    >
                      {action.label}
                    </span>
                  </div>
                </div>

                {/* Status / Timestamp */}
                <div className="flex shrink-0 items-center gap-2">
                  {task.status === "completed" && task.completedAt ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-stone-400"
                    >
                      {formatTime(task.completedAt)}
                    </motion.span>
                  ) : (
                    <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
