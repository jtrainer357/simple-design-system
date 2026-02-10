/**
 * Responsive Audit Utility
 *
 * Provides browser-based tools for auditing responsive design.
 * Run in browser console to check all breakpoints.
 *
 * Usage:
 * 1. Import in dev mode: import { auditCurrentPage, runFullAudit } from '@/src/lib/testing/responsive-audit'
 * 2. Call auditCurrentPage() in console to check current viewport
 * 3. Call runFullAudit() to test all breakpoints (resizes window)
 *
 * @module testing/responsive-audit
 */

export const BREAKPOINTS = {
  "mobile-s": 320,
  "mobile-m": 375,
  "mobile-l": 414,
  "tablet-portrait": 768,
  "tablet-landscape": 1024,
  desktop: 1280,
  "desktop-l": 1440,
  "desktop-xl": 1920,
} as const;

export interface AuditIssue {
  type: "error" | "warning" | "info";
  category: string;
  message: string;
  element?: string;
}

export interface AuditResult {
  breakpoint: string;
  width: number;
  issues: AuditIssue[];
  timestamp: Date;
}

/**
 * Audit the current page for responsive design issues
 */
export function auditCurrentPage(): AuditResult {
  const issues: AuditIssue[] = [];
  const width = window.innerWidth;

  // Check for horizontal overflow
  const hasHorizontalScroll =
    document.documentElement.scrollWidth > document.documentElement.clientWidth;
  if (hasHorizontalScroll) {
    issues.push({
      type: "error",
      category: "overflow",
      message: `Horizontal scroll detected (content: ${document.documentElement.scrollWidth}px, viewport: ${document.documentElement.clientWidth}px)`,
    });
  }

  // Check for elements overflowing viewport
  const allElements = document.querySelectorAll("*");
  const overflowingElements: string[] = [];
  allElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth + 1 && rect.width > 0) {
      const selector = getElementSelector(el);
      if (!overflowingElements.includes(selector)) {
        overflowingElements.push(selector);
        issues.push({
          type: "error",
          category: "overflow",
          message: `Element overflows by ${Math.round(rect.right - window.innerWidth)}px`,
          element: selector,
        });
      }
    }
  });

  // Check tap target sizes (should be minimum 44px)
  const interactiveElements = document.querySelectorAll(
    'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
  );
  interactiveElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
      issues.push({
        type: "warning",
        category: "touch-target",
        message: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px (minimum: 44x44px)`,
        element: getElementSelector(el),
      });
    }
  });

  // Check for clipped text
  const textElements = document.querySelectorAll(
    "p, span, h1, h2, h3, h4, h5, h6, a, button, label"
  );
  textElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (
      htmlEl.scrollWidth > htmlEl.clientWidth &&
      !htmlEl.style.textOverflow &&
      !htmlEl.classList.contains("truncate") &&
      !htmlEl.classList.contains("line-clamp-1") &&
      !htmlEl.classList.contains("line-clamp-2")
    ) {
      issues.push({
        type: "warning",
        category: "text-overflow",
        message: `Text may be clipped: "${htmlEl.textContent?.slice(0, 30)}..."`,
        element: getElementSelector(el),
      });
    }
  });

  // Check for fixed/absolute positioned elements without safe area
  const fixedElements = document.querySelectorAll('[style*="position: fixed"], [class*="fixed"]');
  fixedElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = getComputedStyle(htmlEl);
    const bottom = computedStyle.bottom;
    const top = computedStyle.top;

    // Check if it's at bottom or top without safe area
    if (bottom === "0px" && !htmlEl.className.includes("safe-area")) {
      issues.push({
        type: "info",
        category: "safe-area",
        message: "Fixed element at bottom may need safe-area-pb for notched devices",
        element: getElementSelector(el),
      });
    }
    if (top === "0px" && !htmlEl.className.includes("safe-area")) {
      issues.push({
        type: "info",
        category: "safe-area",
        message: "Fixed element at top may need safe-area-pt for notched devices",
        element: getElementSelector(el),
      });
    }
  });

  return {
    breakpoint: getBreakpointName(width),
    width,
    issues,
    timestamp: new Date(),
  };
}

/**
 * Get a descriptive selector for an element
 */
function getElementSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const classes = Array.from(el.classList)
    .slice(0, 2)
    .map((c) => `.${c}`)
    .join("");
  const text = el.textContent?.slice(0, 15) || "";

  return `${tag}${id}${classes}${text ? ` ("${text}...")` : ""}`;
}

/**
 * Get breakpoint name from width
 */
function getBreakpointName(width: number): string {
  if (width < 375) return "mobile-s";
  if (width < 640) return "mobile-m";
  if (width < 768) return "mobile-l";
  if (width < 1024) return "tablet-portrait";
  if (width < 1280) return "tablet-landscape";
  if (width < 1440) return "desktop";
  if (width < 1920) return "desktop-l";
  return "desktop-xl";
}

/**
 * Format audit result for console output
 */
export function formatAuditResult(result: AuditResult): string {
  const lines: string[] = [
    `\n=== Responsive Audit: ${result.breakpoint} (${result.width}px) ===`,
    `Time: ${result.timestamp.toLocaleTimeString()}`,
    `Issues found: ${result.issues.length}`,
    "",
  ];

  if (result.issues.length === 0) {
    lines.push("No issues detected at this breakpoint.");
  } else {
    const grouped = result.issues.reduce(
      (acc, issue) => {
        if (!acc[issue.category]) acc[issue.category] = [];
        acc[issue.category]!.push(issue);
        return acc;
      },
      {} as Record<string, AuditIssue[]>
    );

    for (const [category, categoryIssues] of Object.entries(grouped)) {
      lines.push(`[${category.toUpperCase()}]`);
      categoryIssues.forEach((issue) => {
        const icon = issue.type === "error" ? "X" : issue.type === "warning" ? "!" : "i";
        lines.push(`  ${icon} ${issue.message}`);
        if (issue.element) lines.push(`    -> ${issue.element}`);
      });
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Run the audit and log results to console
 */
export function logAudit(): void {
  const result = auditCurrentPage();
  console.log(formatAuditResult(result));
}

/**
 * Run full audit across all breakpoints (requires manual resize or use with testing framework)
 */
export async function runFullAudit(): Promise<AuditResult[]> {
  const results: AuditResult[] = [];

  console.log("Starting full responsive audit...");
  console.log("Resize your browser to each breakpoint and call auditCurrentPage()");
  console.log("\nBreakpoints to test:");

  for (const [name, width] of Object.entries(BREAKPOINTS)) {
    console.log(`  - ${name}: ${width}px`);
  }

  // Return current audit as a start
  results.push(auditCurrentPage());
  return results;
}

// Export for use in browser console
if (typeof window !== "undefined") {
  (window as typeof window & { responsiveAudit: typeof logAudit }).responsiveAudit = logAudit;
}
