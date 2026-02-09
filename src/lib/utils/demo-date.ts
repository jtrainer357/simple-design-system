/**
 * Demo Date Utility
 * Returns Feb 9, 2026 as the "current" date for demo purposes
 */

// Demo date: Monday, February 9, 2026
export const DEMO_DATE = "2026-02-09";
export const DEMO_DATE_OBJECT = new Date("2026-02-09T12:00:00");

// Demo practice ID (used across all queries)
export const DEMO_PRACTICE_ID = "550e8400-e29b-41d4-a716-446655440000";

/**
 * Get the demo "today" date string in YYYY-MM-DD format
 */
export function getDemoToday(): string {
  return DEMO_DATE;
}

/**
 * Get the demo "today" as a Date object
 */
export function getDemoTodayDate(): Date {
  return new Date(DEMO_DATE_OBJECT);
}

/**
 * Get a date N days from demo date in YYYY-MM-DD format
 */
export function getDemoDaysFromNow(days: number): string {
  const date = getDemoTodayDate();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]!;
}

/**
 * Get a date N days before demo date in YYYY-MM-DD format
 */
export function getDemoDaysAgo(days: number): string {
  return getDemoDaysFromNow(-days);
}

/**
 * Format a date for display (e.g., "Monday, Feb 9")
 */
export function formatDemoDate(format: "long" | "short" = "long"): string {
  if (format === "long") {
    return DEMO_DATE_OBJECT.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
  return DEMO_DATE_OBJECT.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
