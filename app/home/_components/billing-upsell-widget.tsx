"use client";

import * as React from "react";
import { DollarSign } from "lucide-react";
import { OutstandingCard } from "@/design-system/components/ui/outstanding-card";
import { cn } from "@/design-system/lib/utils";

interface BillingUpsellWidgetProps {
  className?: string;
}

export function BillingUpsellWidget({ className }: BillingUpsellWidgetProps) {
  return (
    <OutstandingCard
      title="Try Our Billing Solution"
      count={30}
      suffix="%"
      subtitle="Increase collections"
      buttonText="Learn More"
      icon={DollarSign}
      className={cn(className)}
    />
  );
}
