"use client";

import { Button } from "@/design-system/components/ui/button";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

export interface ErrorFallbackProps {
  /** Error that was caught */
  error?: Error | null;
  /** Function to reset/retry the failed component */
  resetError?: () => void;
  /** Section name for contextual messaging */
  section?: string;
  /** Error digest/ID for support reference */
  digest?: string;
  /** Whether to show the home link */
  showHomeLink?: boolean;
  /** Whether to show the report issue link */
  showReportLink?: boolean;
  /** Custom className for the container */
  className?: string;
}

/**
 * User-friendly error fallback UI
 * Uses Tebra design system with Growth Teal accents
 */
export function ErrorFallback({
  error,
  resetError,
  section,
  digest,
  showHomeLink = true,
  showReportLink = false,
  className,
}: ErrorFallbackProps) {
  const sectionMessage = section ? `in ${section}` : "";

  return (
    <div className={cn("flex min-h-[400px] items-center justify-center p-4", className)}>
      <CardWrapper className="max-w-md text-center">
        {/* Error icon with teal accent ring */}
        <div className="ring-teal/20 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-2">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>

        {/* Error heading */}
        <h2 className="text-foreground-strong mb-2 text-lg font-semibold">Something went wrong</h2>

        {/* Error message */}
        <p className="text-muted-foreground mb-4 text-sm">
          {section
            ? `We encountered an issue loading ${sectionMessage}. This might be a temporary problem.`
            : "An unexpected error occurred. Please try again or contact support if the issue persists."}
        </p>

        {/* Error details (development only or with digest) */}
        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="bg-muted/50 mb-4 rounded-md p-3 text-left">
            <p className="text-muted-foreground text-xs font-medium">Error Details:</p>
            <p className="text-destructive mt-1 text-xs break-words">{error.message}</p>
          </div>
        )}

        {/* Error reference ID */}
        {digest && (
          <p className="text-muted-foreground mb-4 text-xs">
            Reference ID: <code className="bg-muted rounded px-1 py-0.5">{digest}</code>
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {resetError && (
            <Button onClick={resetError} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}

          {showHomeLink && (
            <Button asChild variant="ghost" className="gap-2">
              <a href="/home">
                <Home className="h-4 w-4" />
                Return to Home
              </a>
            </Button>
          )}
        </div>

        {/* Report issue link */}
        {showReportLink && (
          <div className="border-border mt-4 border-t pt-4">
            <a
              href="mailto:support@tebra.com?subject=Error%20Report"
              className="text-teal hover:text-teal-dark inline-flex items-center gap-1.5 text-xs hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Report this issue
            </a>
          </div>
        )}
      </CardWrapper>
    </div>
  );
}
