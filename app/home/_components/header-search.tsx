"use strict";
import * as React from "react";
import { Mic, Sparkles } from "lucide-react";
import { Input } from "@/design-system/components/ui/input";
import { Heading } from "@/design-system/components/ui/typography";

export function HeaderSearch() {
  return (
    <header className="bg-background/80 sticky top-0 z-30 w-full px-4 pt-[18px] pb-4 backdrop-blur-md sm:px-6">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Title - responsive sizing */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Heading level={4} className="truncate text-base sm:text-lg md:text-xl">
            Riverside Family Health & Wellness
          </Heading>
        </div>

        {/* Search bar - full width on mobile, constrained on desktop */}
        <div className="relative w-full sm:max-w-sm md:max-w-md lg:max-w-lg">
          <div className="text-muted-foreground absolute top-1/2 left-3 flex -translate-y-1/2 items-center gap-1">
            <Sparkles className="h-4 w-4" />
          </div>
          <Input
            className="focus-visible:ring-primary/20 h-10 w-full rounded-full border-none bg-white pr-10 pl-10 text-sm ring-1 ring-black/5 focus-visible:ring-2"
            placeholder="Ask me anything..."
          />
          <div className="text-muted-foreground absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
            <Mic className="hover:text-foreground h-4 w-4 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
