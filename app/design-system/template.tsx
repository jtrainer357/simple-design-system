"use client";

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Input } from "@/design-system/components/ui/input";
import { Toaster } from "@/design-system/components/ui/toaster";
import { TooltipProvider } from "@/design-system/components/ui/tooltip";
import { AnimatedBackground } from "@/design-system/components/ui/animated-background";

export default function DesignSystemTemplate({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <TooltipProvider>
      <AnimatedBackground />
      <div className="flex min-h-screen">
        {/* Fixed Sidebar */}
        <aside className="bg-card/80 fixed top-0 left-0 z-10 h-screen w-64 overflow-y-auto border-r p-6 backdrop-blur-md">
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Sidebar searchQuery={searchQuery} />
        </aside>

        {/* Main Content */}
        <main className="ml-64 max-w-5xl flex-1 p-8">{children}</main>

        <Toaster />
      </div>
    </TooltipProvider>
  );
}
