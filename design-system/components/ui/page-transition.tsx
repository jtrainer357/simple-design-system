"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/design-system/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  );
}
