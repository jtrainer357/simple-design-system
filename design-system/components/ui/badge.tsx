import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/design-system/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default - teal/primary color for active states
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        // Secondary - neutral gray for inactive/default states
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Destructive - red for urgent/critical
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        // Outline - bordered style
        outline: "text-foreground",
        // Status-specific variants for consistency across the app
        // URGENT -> Red
        urgent: "border-transparent bg-red-500 text-white",
        // HIGH -> Orange
        high: "border-transparent bg-orange-500 text-white",
        // MEDIUM -> Teal
        medium: "border-transparent bg-teal text-white",
        // LOW -> Gray
        low: "border-transparent bg-gray-400 text-white",
        // Active -> Green
        active: "border-transparent bg-emerald-500 text-white",
        // Inactive -> Gray
        inactive: "border-transparent bg-gray-300 text-gray-600",
        // New Patient -> Blue
        new: "border-transparent bg-blue-500 text-white",
        // Success -> Green (for completed actions)
        success: "border-transparent bg-emerald-500 text-white",
        // Warning -> Amber
        warning: "border-transparent bg-amber-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
