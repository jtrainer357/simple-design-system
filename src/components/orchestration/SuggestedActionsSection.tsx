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
  message: "text-[#6B8A85] bg-[#8CA7A2]/20",
  order: "text-[#6B8A85] bg-[#8CA7A2]/20",
  medication: "text-[#6B8A85] bg-[#8CA7A2]/20",
  task: "text-[#6B8A85] bg-[#8CA7A2]/20",
  document: "text-[#6B8A85] bg-[#8CA7A2]/20",
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
        <Sparkles className="h-4 w-4 text-[#8CA7A2]" />
        <h4 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
          AI Suggested Actions
        </h4>
      </div>

      <div className="rounded-lg border-2 border-dashed border-[#8CA7A2]/40 bg-[#8CA7A2]/10 p-3">
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
                    "transition-all hover:border-[#8CA7A2]/60 hover:shadow-sm",
                    disabled && "cursor-not-allowed opacity-60",
                    action.checked && !disabled && "border-[#8CA7A2] bg-[#8CA7A2]/10"
                  )}
                >
                  <Checkbox
                    checked={action.checked}
                    onCheckedChange={() => onToggle(action.id)}
                    disabled={disabled}
                    className="h-5 w-5 border-2 data-[state=checked]:border-[#8CA7A2] data-[state=checked]:bg-[#8CA7A2]"
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
