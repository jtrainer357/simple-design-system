"use client";

import * as React from "react";

const ReactDOM = require("react-dom") as {
  createPortal: (children: React.ReactNode, container: Element) => React.ReactPortal;
};
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

interface ExecutionOverlayProps {
  isVisible: boolean;
  taskProgress: TaskProgress[];
  actions: SuggestedAction[];
  patientName?: string;
  onComplete?: () => void;
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
    color: "text-teal",
    bgColor: "bg-teal/10",
    label: "Executing...",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-teal",
    bgColor: "bg-teal/10",
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

export function ExecutionOverlay({
  isVisible,
  taskProgress,
  actions,
  patientName,
  onComplete,
}: ExecutionOverlayProps) {
  const actionsMap = new Map(actions.map((action) => [action.id, action]));

  const allCompleted =
    taskProgress.length > 0 && taskProgress.every((t) => t.status === "completed");

  // Auto-close after all completed
  React.useEffect(() => {
    if (allCompleted && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [allCompleted, onComplete]);

  // Use portal to render at document body level, avoiding transform stacking context issues
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  const content = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Dark overlay backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content card */}
          <motion.div
            className="relative z-10 mx-2 w-full max-w-lg rounded-xl bg-white p-4 shadow-2xl sm:mx-4 sm:rounded-2xl sm:p-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Header */}
            <div className="mb-6 text-center">
              <motion.div
                className="bg-teal/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                animate={!allCompleted ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={!allCompleted ? { repeat: Infinity, duration: 2 } : undefined}
              >
                {allCompleted ? (
                  <CheckCircle2 className="text-teal h-8 w-8" />
                ) : (
                  <Loader2 className="text-teal h-8 w-8 animate-spin" />
                )}
              </motion.div>
              <h2 className="text-xl font-semibold text-stone-900">
                {allCompleted ? "Actions Completed" : "Executing Actions..."}
              </h2>
              {patientName && <p className="mt-1 text-sm text-stone-500">for {patientName}</p>}
            </div>

            {/* Task list */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/50">
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3",
                        index !== taskProgress.length - 1 && "border-b border-stone-200"
                      )}
                    >
                      {/* Status Icon */}
                      <motion.div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          config.bgColor
                        )}
                        animate={
                          task.status === "executing" ? { scale: [1, 1.1, 1] } : { scale: 1 }
                        }
                        transition={
                          task.status === "executing"
                            ? { repeat: Infinity, duration: 1 }
                            : undefined
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
                          <ActionIcon className="h-4 w-4 shrink-0 text-stone-400" />
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
                          <span className={cn("text-xs font-medium", config.color)}>
                            {config.label}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Completion message */}
            <AnimatePresence>
              {allCompleted && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center text-sm text-stone-500"
                >
                  Returning to Today&apos;s Actions...
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render via portal if container is available, otherwise render inline (SSR)
  if (portalContainer) {
    return ReactDOM.createPortal(content, portalContainer);
  }

  return content;
}
