"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MessageSquare, FileText, Pill, ClipboardList, FileCheck, Sparkles } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import type { SuggestedAction, ActionType } from "@/src/lib/orchestration/types";

interface SuggestedActionsSectionProps {
  actions: SuggestedAction[];
  onToggle: (actionId: string) => void;
  disabled?: boolean;
  className?: string;
}

const actionIcons: Record<ActionType, React.ComponentType<{ className?: string }>> = {
  message: MessageSquare,
  order: FileText,
  medication: Pill,
  task: ClipboardList,
  document: FileCheck,
};

const actionColors: Record<ActionType, string> = {
  message: "text-blue-600 bg-blue-50",
  order: "text-purple-600 bg-purple-50",
  medication: "text-emerald-600 bg-emerald-50",
  task: "text-amber-600 bg-amber-50",
  document: "text-stone-600 bg-stone-50",
};

export function SuggestedActionsSection({
  actions,
  onToggle,
  disabled = false,
  className,
}: SuggestedActionsSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-teal-600" />
        <h4 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
          AI Suggested Actions
        </h4>
      </div>

      <div className="rounded-lg border-2 border-dashed border-teal-200 bg-teal-50/30 p-3">
        <div className="space-y-2">
          {actions.map((action, index) => {
            const Icon = actionIcons[action.type];
            const colorClass = actionColors[action.type];

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 bg-white p-3",
                    "transition-all hover:border-teal-300 hover:shadow-sm",
                    disabled && "cursor-not-allowed opacity-60",
                    action.checked && !disabled && "border-teal-400 bg-teal-50/50"
                  )}
                >
                  <Checkbox
                    checked={action.checked}
                    onCheckedChange={() => onToggle(action.id)}
                    disabled={disabled}
                    className="h-5 w-5 border-2 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600"
                  />
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "flex-1 text-sm font-medium text-stone-700",
                      action.checked && "text-stone-900"
                    )}
                  >
                    {action.label}
                  </span>
                </label>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
