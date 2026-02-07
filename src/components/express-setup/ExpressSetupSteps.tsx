"use client";

import * as React from "react";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { AddOnSelector } from "./AddOnSelector";
import {
  ADD_ONS,
  BASE_PLAN,
  SPECIALTIES,
  PROVIDER_OPTIONS,
  type AddOn,
} from "@/src/lib/addOnsData";
import {
  PracticeInfoData,
  AccountData,
  PaymentData,
  ValidationError,
  getPasswordStrength,
  getFieldError,
} from "@/src/lib/expressSetupValidation";
import {
  formatCardNumber,
  formatExpirationDate,
  formatPhoneNumber,
  formatCVV,
  formatZipCode,
  formatTrialEndDate,
  calculateTotal,
} from "@/src/lib/priceCalculator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  LockKeyIcon,
  ViewIcon,
  ViewOffIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/design-system/lib/utils";

// --- Step 1: Add-On Selection ---

interface AddOnSelectionStepProps {
  selectedAddOns: AddOn[];
  onToggleAddOn: (addon: AddOn) => void;
  onContinue: () => void;
  basePlanOption: number;
  onBasePlanChange: (price: number) => void;
}

export function AddOnSelectionStep({
  selectedAddOns,
  onToggleAddOn,
  onContinue: _onContinue,
  basePlanOption,
  onBasePlanChange,
}: AddOnSelectionStepProps) {
  const isSelected = (addon: AddOn) => selectedAddOns.some((a) => a.id === addon.id);

  return (
    <div className="animate-in slide-in-from-right-4 fade-in flex flex-col duration-300">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold">Customize Your Professional Plan</h2>
        <p className="text-muted-foreground text-base">
          Select the add-ons that fit your practice needs.
        </p>
      </div>

      <div className="space-y-6">
        {/* Base Plan Display */}
        <div className="border-border/50 rounded-xl border bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h3 className="text-lg font-bold sm:text-xl">{BASE_PLAN.name}</h3>
              <Select
                value={basePlanOption.toString()}
                onValueChange={(val) => onBasePlanChange(Number(val))}
              >
                <SelectTrigger className="border-border/60 h-10 w-full bg-white sm:w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BASE_PLAN.pricingOptions?.map((opt) => (
                    <SelectItem key={opt.price} value={opt.price.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${basePlanOption}</div>
              <div className="text-muted-foreground text-xs">{BASE_PLAN.billingPeriod}</div>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {BASE_PLAN.features.map((feature, idx) => (
              <li key={idx} className="text-muted-foreground flex items-center gap-3">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="text-growth-2 size-5 shrink-0"
                  strokeWidth={2.5}
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Add-Ons Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Recommended Add-Ons
          </h3>
          <div className="space-y-3">
            {ADD_ONS.map((addon) => (
              <AddOnSelector
                key={addon.id}
                addon={addon}
                isSelected={isSelected(addon)}
                onToggle={onToggleAddOn}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Step 2: Account + Pay (Combined) ---

interface CombinedAccountPaymentStepProps {
  practiceData: PracticeInfoData;
  accountData: AccountData;
  paymentData: PaymentData;
  errors: ValidationError[];
  onPracticeChange: (field: keyof PracticeInfoData, value: string) => void;
  onAccountChange: (field: keyof AccountData, value: string) => void;
  onPaymentChange: (field: keyof PaymentData, value: string) => void;
  onComplete: () => void;
  selectedAddOns: AddOn[];
  isLoading: boolean;
  basePrice: number;
  onBack: () => void;
}

export function CombinedAccountPaymentStep({
  practiceData,
  accountData,
  paymentData,
  errors,
  onPracticeChange,
  onAccountChange,
  onPaymentChange,
  onComplete: _onComplete,
  selectedAddOns,
  isLoading: _isLoading,
  basePrice,
  onBack: _onBack,
}: CombinedAccountPaymentStepProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const strength = getPasswordStrength(accountData.password);
  const _strengthColor = {
    weak: "bg-remedy",
    medium: "bg-neuron",
    strong: "bg-vigor",
  }[strength];

  // Calculate total for summary
  const totalMonthly = calculateTotal(selectedAddOns, basePrice);

  return (
    <div className="animate-in slide-in-from-right-4 fade-in flex flex-col pb-10 duration-300">
      <div className="mb-8">
        <h2 className="mb-3 text-3xl font-bold">Create your account</h2>
        <p className="text-muted-foreground text-base">
          Set up your practice details and payment method.
        </p>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
        <div className="w-full space-y-8 lg:flex-1 lg:space-y-10">
          {/* Section 1: Practice Info */}
          <div className="space-y-5">
            <h3 className="flex items-center gap-3 text-lg font-semibold">
              <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold">
                1
              </span>
              Practice Details
            </h3>
            <div className="space-y-4 pl-0 sm:pl-8">
              <div className="space-y-2">
                <Label htmlFor="practiceName">Practice Name</Label>
                <Input
                  id="practiceName"
                  value={practiceData.practiceName}
                  onChange={(e) => onPracticeChange("practiceName", e.target.value)}
                  placeholder="e.g. City Medical Group"
                  className={cn(
                    getFieldError(errors, "practiceName") && "border-remedy ring-remedy/20"
                  )}
                />
                {getFieldError(errors, "practiceName") && (
                  <p className="text-remedy text-xs font-medium">
                    {getFieldError(errors, "practiceName")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Primary Specialty</Label>
                  <Select
                    value={practiceData.specialty}
                    onValueChange={(val) => onPracticeChange("specialty", val)}
                  >
                    <SelectTrigger
                      id="specialty"
                      className={cn(
                        getFieldError(errors, "specialty") && "border-remedy ring-remedy/20"
                      )}
                    >
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError(errors, "specialty") && (
                    <p className="text-remedy text-xs font-medium">
                      {getFieldError(errors, "specialty")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Practice ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={practiceData.zipCode}
                    onChange={(e) => onPracticeChange("zipCode", formatZipCode(e.target.value))}
                    placeholder="12345"
                    maxLength={5}
                    inputMode="numeric"
                    className={cn(
                      getFieldError(errors, "zipCode") && "border-remedy ring-remedy/20"
                    )}
                  />
                  {getFieldError(errors, "zipCode") && (
                    <p className="text-remedy text-xs font-medium">
                      {getFieldError(errors, "zipCode")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerCount">Number of Providers</Label>
                <Select
                  value={practiceData.providerCount}
                  onValueChange={(val) => onPracticeChange("providerCount", val)}
                >
                  <SelectTrigger
                    id="providerCount"
                    className={cn(
                      getFieldError(errors, "providerCount") && "border-remedy ring-remedy/20"
                    )}
                  >
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError(errors, "providerCount") && (
                  <p className="text-remedy text-xs font-medium">
                    {getFieldError(errors, "providerCount")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Account Info */}
          <div className="space-y-5">
            <h3 className="flex items-center gap-3 text-lg font-semibold">
              <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold">
                2
              </span>
              Account Login
            </h3>
            <div className="space-y-4 pl-0 sm:pl-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={accountData.fullName}
                    onChange={(e) => onAccountChange("fullName", e.target.value)}
                    className={cn(
                      getFieldError(errors, "fullName") && "border-remedy ring-remedy/20"
                    )}
                  />
                  {getFieldError(errors, "fullName") && (
                    <p className="text-remedy text-xs font-medium">
                      {getFieldError(errors, "fullName")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) => onAccountChange("email", e.target.value)}
                    className={cn(getFieldError(errors, "email") && "border-remedy ring-remedy/20")}
                  />
                  {getFieldError(errors, "email") && (
                    <p className="text-remedy text-xs font-medium">
                      {getFieldError(errors, "email")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={accountData.phone}
                    onChange={(e) => onAccountChange("phone", formatPhoneNumber(e.target.value))}
                    placeholder="(555) 555-5555"
                    className={cn(getFieldError(errors, "phone") && "border-remedy ring-remedy/20")}
                  />
                  {getFieldError(errors, "phone") && (
                    <p className="text-remedy text-xs font-medium">
                      {getFieldError(errors, "phone")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={accountData.password}
                    onChange={(e) => onAccountChange("password", e.target.value)}
                    className={cn(
                      "pr-10",
                      getFieldError(errors, "password") && "border-remedy ring-remedy/20"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    <HugeiconsIcon
                      icon={showPassword ? ViewOffIcon : ViewIcon}
                      className="size-4"
                      strokeWidth={2}
                    />
                  </button>
                </div>
                {getFieldError(errors, "password") && (
                  <p className="text-remedy text-xs font-medium">
                    {getFieldError(errors, "password")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Payment Info */}
          <div className="space-y-5">
            <h3 className="flex items-center gap-3 text-lg font-semibold">
              <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold">
                3
              </span>
              Payment Method
            </h3>
            <div className="space-y-4 pl-0 sm:pl-8">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <HugeiconsIcon
                  icon={LockKeyIcon}
                  className="text-growth-2 size-4"
                  strokeWidth={2}
                />
                <span className="text-muted-foreground text-sm font-medium">
                  Secure SSL Encryption
                </span>
                <div className="ml-auto flex gap-2">
                  <div className="bg-muted text-muted-foreground flex h-6 w-10 items-center justify-center rounded text-[10px]">
                    VISA
                  </div>
                  <div className="bg-muted text-muted-foreground flex h-6 w-10 items-center justify-center rounded text-[10px]">
                    MC
                  </div>
                  <div className="bg-muted text-muted-foreground flex h-6 w-10 items-center justify-center rounded text-[10px]">
                    AMEX
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={(e) =>
                      onPaymentChange("cardNumber", formatCardNumber(e.target.value))
                    }
                    placeholder="0000 0000 0000 0000"
                    className={cn(
                      "pl-10",
                      getFieldError(errors, "cardNumber") && "border-remedy ring-remedy/20"
                    )}
                  />
                  <HugeiconsIcon
                    icon={CreditCardIcon}
                    className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    strokeWidth={2}
                  />
                </div>
                {getFieldError(errors, "cardNumber") && (
                  <p className="text-remedy text-xs font-medium">
                    {getFieldError(errors, "cardNumber")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Expiration</Label>
                  <Input
                    id="expirationDate"
                    value={paymentData.expirationDate}
                    onChange={(e) =>
                      onPaymentChange("expirationDate", formatExpirationDate(e.target.value))
                    }
                    placeholder="MM/YY"
                    className={cn(
                      getFieldError(errors, "expirationDate") && "border-remedy ring-remedy/20"
                    )}
                  />
                  {getFieldError(errors, "expirationDate") && (
                    <p className="text-remedy text-xs font-medium">
                      {getFieldError(errors, "expirationDate")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentData.cvv}
                    onChange={(e) => onPaymentChange("cvv", formatCVV(e.target.value))}
                    placeholder="123"
                    maxLength={4}
                    className={cn(getFieldError(errors, "cvv") && "border-remedy ring-remedy/20")}
                  />
                  {getFieldError(errors, "cvv") && (
                    <p className="text-remedy text-xs font-medium">
                      {getFieldError(errors, "cvv")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingZip">Billing ZIP Code</Label>
                <Input
                  id="billingZip"
                  value={paymentData.billingZip}
                  onChange={(e) => onPaymentChange("billingZip", formatZipCode(e.target.value))}
                  placeholder="12345"
                  maxLength={5}
                  className={cn(
                    getFieldError(errors, "billingZip") && "border-remedy ring-remedy/20"
                  )}
                />
                {getFieldError(errors, "billingZip") && (
                  <p className="text-remedy text-xs font-medium">
                    {getFieldError(errors, "billingZip")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="order-first w-full shrink-0 lg:order-last lg:w-[320px]">
          <div className="border-border/50 rounded-xl border bg-white p-4 sm:p-6 lg:sticky lg:top-4">
            <h3 className="mb-5 text-lg font-bold">Summary</h3>

            <div className="mb-4 space-y-3 pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground">Base Professional Plan</span>
                <span className="font-semibold">${basePrice}</span>
              </div>
              {selectedAddOns.map((addon) => (
                <div key={addon.id} className="flex justify-between">
                  <span className="text-muted-foreground">{addon.name}</span>
                  <span className="text-growth-2 font-medium">+${addon.price}</span>
                </div>
              ))}
            </div>

            <div className="border-border/50 mb-5 border-t pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground text-sm">Total Monthly</span>
                <span className="text-3xl font-bold">
                  ${totalMonthly}
                  <span className="text-muted-foreground text-base font-normal">/mo</span>
                </span>
              </div>
            </div>

            <div className="text-muted-foreground border-border/30 rounded-lg border bg-gray-50 p-4 text-sm">
              <p className="text-foreground mb-1 font-semibold">Free Trial Terms:</p>
              <p className="leading-relaxed">
                Your 14-day free trial begins today. You won&apos;t be charged until{" "}
                {formatTrialEndDate()}. Cancel anytime in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Step 3: Success + Upload ---

interface UploadSuccessStepProps {
  email: string;
  onClose: () => void;
  onBack: () => void;
}

import {
  Folder01Icon,
  Analytics02Icon,
  Calendar03Icon,
  PillIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

export function UploadSuccessStep({
  email: _email,
  onClose: _onClose,
  onBack: _onBack,
}: UploadSuccessStepProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="animate-in slide-in-from-right-4 fade-in flex flex-col pb-10 duration-300">
      <div className="w-full">
        <h2 className="text-foreground mb-3 text-3xl font-bold">
          Let&apos;s Bring Your Practice Into Tebra
        </h2>
        <p className="text-muted-foreground mb-8 text-base">
          Upload your files and we&apos;ll handle the rest
        </p>

        {/* Drop Zone */}
        <div
          className={cn(
            "border-border/60 hover:border-growth-2/50 hover:bg-growth-1/5 group mb-8 flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white p-10 text-center transition-all",
            isDragging ? "bg-growth-1/10 border-growth-2" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-backbone-1 mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-sm transition-transform">
            <HugeiconsIcon
              icon={Folder01Icon}
              className="text-muted-foreground size-8"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="mb-1 text-lg font-bold">Drop your files here or click to browse</h3>
          <p className="text-muted-foreground text-sm">
            CSV, Excel, PDF, or EHR exports • Up to 50MB per file
          </p>
          <Input type="file" className="hidden" id="file-upload" />
          <label
            htmlFor="file-upload"
            className="absolute inset-0 cursor-pointer"
            aria-label="Upload files"
          />
        </div>

        {/* Mocked File List */}
        <div className="mb-8 space-y-3">
          {/* File 1 */}
          <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-growth-1/20 text-growth-2 flex h-10 w-10 items-center justify-center rounded-lg">
                <HugeiconsIcon icon={Analytics02Icon} className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">patient_roster_2024.csv</div>
                <div className="text-muted-foreground text-xs">247 patients detected • 1.2 MB</div>
              </div>
            </div>
            <div className="text-growth-2 bg-growth-1/10 rounded-full p-1">
              <HugeiconsIcon icon={Tick02Icon} className="size-4" strokeWidth={3} />
            </div>
          </div>

          {/* File 2 */}
          <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-remedy/10 text-remedy flex h-10 w-10 items-center justify-center rounded-lg">
                <HugeiconsIcon icon={Calendar03Icon} className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">schedule_january.xlsx</div>
                <div className="text-muted-foreground text-xs">
                  39 appointments detected • 0.8 MB
                </div>
              </div>
            </div>
            <div className="text-growth-2 bg-growth-1/10 rounded-full p-1">
              <HugeiconsIcon icon={Tick02Icon} className="size-4" strokeWidth={3} />
            </div>
          </div>

          {/* File 3 */}
          <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-mustard/10 text-mustard flex h-10 w-10 items-center justify-center rounded-lg">
                <HugeiconsIcon icon={PillIcon} className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">prescriptions_pending.csv</div>
                <div className="text-muted-foreground text-xs">6 refills detected • 0.3 MB</div>
              </div>
            </div>
            <div className="text-growth-2 bg-growth-1/10 rounded-full p-1">
              <HugeiconsIcon icon={Tick02Icon} className="size-4" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="border-border/40 mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-muted-foreground mb-3 flex items-center gap-3 text-sm font-medium">
            <HugeiconsIcon icon={Loading03Icon} className="text-primary size-4 animate-spin" />
            <span>
              Processing your data... Setting up providers Dr. Patel, Dr. Morrison, Dr. Chen...
            </span>
          </div>
          <div className="bg-backbone-1 h-2 w-full overflow-hidden rounded-full">
            <div className="bg-primary h-full w-[60%] animate-pulse rounded-full" />
          </div>
        </div>

        {/* Start Empty */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-muted-foreground text-sm">Don&apos;t have files ready?</span>
          <Button
            variant="outline"
            size="sm"
            className="text-foreground border-border hover:bg-accent hover:text-accent-foreground h-9 font-semibold"
          >
            Start with sample data
          </Button>
        </div>
      </div>
    </div>
  );
}
