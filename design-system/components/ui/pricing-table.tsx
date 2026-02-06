"use client";

import type React from "react";

import { Check, Info } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { Card } from "@/design-system/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { cn } from "@/design-system/lib/utils";
import { useState } from "react";

export interface PricingFeature {
  text: string;
  hasInfo?: boolean;
}

export interface PricingTier {
  name: string;
  description: string;
  price?: number;
  priceLabel?: string;
  priceByOption?: Record<string, number | string>;
  billingPeriod?: string;
  buttonText: string;
  buttonVariant?:
    | "default"
    | "secondary"
    | "outline"
    | "outline-dark"
    | "primaryVitality"
    | "marketing";
  isPrimary?: boolean;
  features: PricingFeature[];
  hasAnnualToggle?: boolean;
  creditOptions?: string[];
  defaultCredits?: string;
  featuresTitle?: string;
  popularTag?: string;
}

export interface PricingProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  tiers: PricingTier[];
  footerTitle?: string;
  footerDescription?: string;
  footerButtonText?: string;
  className?: string;
  onTierAction?: (tier: PricingTier) => void;
}

export function Pricing({
  icon,
  title,
  subtitle,
  tiers,
  footerTitle,
  footerDescription,
  footerButtonText,
  className,
  onTierAction,
}: PricingProps) {
  // Initialize annual billing to true for all tiers
  const [annualBilling, setAnnualBilling] = useState<Record<string, boolean>>(() => {
    const initialStates: Record<string, boolean> = {};
    tiers.forEach((tier) => {
      initialStates[tier.name] = true;
    });
    return initialStates;
  });
  const [selectedCredits, setSelectedCredits] = useState<Record<string, string>>({});

  return (
    <div className={cn("text-foreground w-full bg-white px-4 py-16", className)}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          {icon && <div className="mb-4 flex justify-center">{icon}</div>}
          <h1 className="text-growth-1 mb-4 text-5xl font-normal text-balance">{title}</h1>
          <p className="text-growth-1 text-lg text-balance">{subtitle}</p>
        </div>

        {/* Pricing Cards */}
        <div className="relative mb-12 grid grid-cols-1 gap-4 pt-8 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, index) => (
            <div key={index} className={cn("flex flex-col", tier.isPrimary && "z-10")}>
              <Card
                className={cn(
                  "relative flex flex-col !overflow-visible p-6 transition-all duration-300",
                  tier.isPrimary
                    ? "border-teal-dark ring-teal-dark/10 -mt-8 -mb-8 border-2 bg-white pt-14 pb-14 shadow-2xl ring-1"
                    : "border-border h-full border bg-white/65 shadow-sm backdrop-blur-sm"
                )}
              >
                {tier.popularTag && (
                  <div className="bg-teal-dark absolute -top-5 left-1/2 z-20 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-white shadow-lg">
                    {tier.popularTag}
                  </div>
                )}

                {/* Tier Header */}
                <div className="mb-6">
                  <h2 className="mb-2 text-2xl font-bold">{tier.name}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {(() => {
                    // Calculate the displayed price based on selected option
                    const selectedOption =
                      selectedCredits[tier.name] || tier.defaultCredits || tier.creditOptions?.[0];
                    const dynamicPrice =
                      tier.priceByOption && selectedOption
                        ? tier.priceByOption[selectedOption]
                        : undefined;
                    const displayPrice = dynamicPrice !== undefined ? dynamicPrice : tier.price;
                    const displayLabel =
                      typeof displayPrice === "string"
                        ? displayPrice
                        : tier.priceLabel ||
                          (displayPrice !== undefined ? `$${displayPrice}` : undefined);

                    if (typeof displayPrice === "number") {
                      return (
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-5xl font-bold">${displayPrice}</span>
                          <span className="text-muted-foreground text-sm">
                            {tier.billingPeriod || "per provider/month"}
                          </span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-5xl font-bold">{displayLabel}</span>
                          {tier.billingPeriod && (
                            <span className="text-muted-foreground text-sm">
                              {tier.billingPeriod}
                            </span>
                          )}
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Spacer to align content if Annual Toggle is missing */}
                <div className="mb-6 flex h-6 items-center gap-3">
                  {tier.hasAnnualToggle && (
                    <>
                      <button
                        onClick={() =>
                          setAnnualBilling((prev) => ({
                            ...prev,
                            [tier.name]: !prev[tier.name],
                          }))
                        }
                        className={cn(
                          "relative h-6 w-11 rounded-full transition-colors",
                          annualBilling[tier.name] ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary-foreground absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform",
                            annualBilling[tier.name] && "translate-x-5"
                          )}
                        />
                      </button>
                      <span className="text-foreground text-sm">
                        {tier.name === "Pro" ? "Annual" : "Annual"}
                      </span>
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className="mb-6 w-full"
                  size="xl"
                  variant={tier.buttonVariant || (tier.isPrimary ? "marketing" : "outline-dark")}
                  onClick={() => onTierAction?.(tier)}
                >
                  {tier.buttonText}
                </Button>

                {/* Credit Options */}
                {tier.creditOptions && tier.creditOptions.length > 0 && (
                  <div className="mb-6">
                    <Select
                      value={
                        selectedCredits[tier.name] || tier.defaultCredits || tier.creditOptions[0]
                      }
                      onValueChange={(value) =>
                        setSelectedCredits((prev) => ({
                          ...prev,
                          [tier.name]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tier.creditOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Features Title */}
                {tier.featuresTitle && (
                  <div className="text-foreground mb-4 text-sm font-medium">
                    {tier.featuresTitle}
                  </div>
                )}

                {/* Features List */}
                <div className="flex-1 space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="text-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm leading-relaxed">
                        {feature.text}
                      </span>
                      {feature.hasInfo && (
                        <Info className="text-muted-foreground/50 mt-0.5 h-4 w-4 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Footer Banner */}
        {footerTitle && (
          <Card className="bg-card flex flex-col items-center justify-between gap-4 border-none p-8 shadow-[0_6px_10px_-2px_rgb(0,0,0,0.1)] md:flex-row">
            <div>
              <h3 className="mb-2 text-xl font-bold">{footerTitle}</h3>
              {footerDescription && (
                <p className="text-muted-foreground text-sm">{footerDescription}</p>
              )}
            </div>
            {footerButtonText && (
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent whitespace-nowrap"
              >
                {footerButtonText}
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
