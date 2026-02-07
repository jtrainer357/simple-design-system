"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";

interface FilterTab {
  id: string;
  label: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function FilterTabs({ tabs, activeTab, onTabChange, className }: FilterTabsProps) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div
        className={cn(
          "border-border/30 inline-flex items-center gap-1 rounded-full border bg-white/60 p-1 backdrop-blur-sm",
          className
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "min-h-[44px] shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4",
              activeTab === tab.id
                ? "text-foreground border border-gray-300 bg-white"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
