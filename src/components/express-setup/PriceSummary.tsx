import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { formatPrice, formatTrialEndDate } from "@/src/lib/priceCalculator";
import { BASE_PLAN, type AddOn } from "@/src/lib/addOnsData";
import { Button } from "@/design-system/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewOffIcon, ViewIcon } from "@hugeicons/core-free-icons";

interface PriceSummaryProps {
  basePrice?: number;
  selectedAddOns: AddOn[];
  compact?: boolean;
  className?: string;
}

export function PriceSummary({
  basePrice = 349,
  selectedAddOns,
  compact = false,
  className,
}: PriceSummaryProps) {
  const addOnsTotal = selectedAddOns.reduce((total, addon) => total + addon.price, 0);
  const total = basePrice + addOnsTotal;
  const [showDetails, setShowDetails] = React.useState(false);

  if (compact) {
    return (
      <div className={cn("text-right", className)}>
        <div className="text-muted-foreground text-sm">Total due after trial</div>
        <div className="text-2xl font-bold">{formatPrice(total)}/mo</div>
        {/* Breakdown toggle removed for simplified footer height */}
        {showDetails && (
          <div className="bg-popover border-border animate-in fade-in slide-in-from-bottom-2 absolute right-0 bottom-full z-50 mb-2 w-64 rounded-lg border p-3 shadow-lg">
            <div className="mb-1 flex justify-between text-xs">
              <span>Base Plan</span>
              <span>{formatPrice(basePrice)}</span>
            </div>
            {selectedAddOns.map((addon) => (
              <div key={addon.id} className="text-muted-foreground flex justify-between text-xs">
                <span>{addon.name}</span>
                <span>+{formatPrice(addon.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-backbone-1 space-y-3 rounded-xl p-4", className)}>
      <div className="flex items-center justify-between text-base">
        <span className="text-muted-foreground">Base Plan ({BASE_PLAN.name})</span>
        <span className="font-medium">{formatPrice(basePrice)}/mo</span>
      </div>

      {showDetails && selectedAddOns.length > 0 && (
        <div className="border-border/50 space-y-2 border-t pt-2">
          <p className="text-muted-foreground text-sm font-medium">Selected Add-ons:</p>
          {selectedAddOns.map((addon) => (
            <div key={addon.id} className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">{addon.name}</span>
              <span className="text-growth-2 font-medium">+{formatPrice(addon.price)}</span>
            </div>
          ))}
        </div>
      )}

      {!showDetails && selectedAddOns.length > 0 && (
        <div className="flex items-center justify-between text-base">
          <span className="text-muted-foreground">Add-ons ({selectedAddOns.length})</span>
          <span className="text-growth-2 font-medium">+{formatPrice(addOnsTotal)}</span>
        </div>
      )}

      <div className="border-border flex items-center justify-between border-t pt-3">
        <div>
          <div className="text-xl font-bold">Total {formatPrice(total)}/mo</div>
          <div className="text-muted-foreground text-xs">Billed monthly after trial</div>
        </div>
        {selectedAddOns.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="-mr-2 h-auto px-2 py-1"
          >
            {showDetails ? (
              <HugeiconsIcon icon={ViewOffIcon} className="size-4" />
            ) : (
              <HugeiconsIcon icon={ViewIcon} className="size-4" />
            )}
          </Button>
        )}
      </div>

      <div className="space-y-1 text-center">
        <p className="text-growth-2 text-xs font-medium">14-day free trial • Cancel anytime</p>
        <p className="text-muted-foreground text-xs">
          You won&apos;t be charged until {formatTrialEndDate()}
        </p>
      </div>
    </div>
  );
}
