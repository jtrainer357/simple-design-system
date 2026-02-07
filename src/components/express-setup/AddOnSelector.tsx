"use client";

import * as React from "react";
import { Card } from "@/design-system/components/ui/card";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/design-system/components/ui/tooltip";
import { cn } from "@/design-system/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import type { AddOn } from "@/src/lib/addOnsData";

interface AddOnSelectorProps {
  addon: AddOn;
  isSelected: boolean;
  onToggle: (addon: AddOn) => void;
}

export function AddOnSelector({ addon, isSelected, onToggle }: AddOnSelectorProps) {
  const handleClick = () => {
    onToggle(addon);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(addon);
    }
  };

  return (
    <Card
      className={cn(
        "relative cursor-pointer overflow-hidden p-4 transition-all duration-200",
        "focus-visible:ring-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isSelected
          ? "border-teal-dark border-2 bg-gray-50/50 shadow-sm"
          : "bg-card/65 border-border/40 hover:border-border/60 hover:bg-card/80"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${addon.name} - $${addon.price}/month`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(addon)}
          aria-hidden="true"
          tabIndex={-1}
          className="border-border data-[state=checked]:bg-teal-dark data-[state=checked]:border-teal-dark mt-0.5 h-5 w-5 rounded"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h4 className="text-foreground text-base font-medium">{addon.name}</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground -m-1 p-1 transition-colors"
                  aria-label={`Learn more about ${addon.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-4" strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-medium">{addon.name}</p>
                  <ul className="space-y-1 text-xs">
                    {addon.detailedFeatures.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">{addon.description}</p>
          <p className="text-growth-2 text-lg font-bold">
            +${addon.price}
            <span className="text-muted-foreground font-normal">/month</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
