import { AddOn, BASE_PLAN } from "./addOnsData";

/**
 * Calculates the total monthly price including base plan and add-ons
 */
export const calculateTotal = (selectedAddOns: AddOn[], basePrice: number = 349) => {
  const addOnsTotal = selectedAddOns.reduce((total, addon) => total + addon.price, 0);
  return basePrice + addOnsTotal;
};

/**
 * Calculate just the add-ons total
 */
export function calculateAddOnsTotal(selectedAddOns: AddOn[]): number {
  return selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
}

/**
 * Format a number as USD currency
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get the trial end date (14 days from now)
 */
export function getTrialEndDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + BASE_PLAN.trialDays);
  return date;
}

/**
 * Format date as readable string (e.g., "January 23, 2026")
 */
export function formatTrialEndDate(): string {
  const date = getTrialEndDate();
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format credit card number with spaces every 4 digits
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(" ") : digits;
}

/**
 * Format expiration date as MM/YY
 */
export function formatExpirationDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

/**
 * Format phone number as (XXX) XXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length >= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length >= 3) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return digits;
}

/**
 * Format CVV (3-4 digits)
 */
export function formatCVV(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

/**
 * Format ZIP code (5 digits)
 */
export function formatZipCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5);
}
