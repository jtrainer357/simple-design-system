"use client";
import * as React from "react";
import { cn } from "@/design-system/lib/utils";

interface CardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function CardWrapper({ children, className }: CardWrapperProps) {
  return (
    <div
      className={cn(
        "border-border/40 rounded-xl border bg-white/45 p-6 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
