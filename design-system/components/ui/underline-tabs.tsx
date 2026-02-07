"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";

interface UnderlineTab {
  id: string;
  label: string;
}

interface UnderlineTabsProps {
  tabs: UnderlineTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function UnderlineTabs({ tabs, activeTab, onTabChange, className }: UnderlineTabsProps) {
  return (
    <div className={cn("flex items-center gap-4 sm:gap-8", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative pb-2 text-sm font-medium transition-colors",
            activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-teal-600" />
          )}
        </button>
      ))}
    </div>
  );
}
