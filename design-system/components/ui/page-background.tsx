"use client";

import * as React from "react";
import { cn } from "@/design-system/lib/utils";

interface PageBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageBackground({ children, className, ...props }: PageBackgroundProps) {
  return (
    <div className={cn("relative isolate min-h-screen w-full", className)} {...props}>
      <div className="animated-background" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="relative z-0">{children}</div>
    </div>
  );
}
