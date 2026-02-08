"use client";

import { Button } from "@/design-system/components/ui/button";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

export interface NotFoundProps {
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Additional className */
  className?: string;
  /** Show search suggestion */
  showSearchSuggestion?: boolean;
}

/**
 * 404 Not Found component
 * Uses Tebra design system with Growth Teal accents
 */
export function NotFound({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  className,
  showSearchSuggestion = true,
}: NotFoundProps) {
  return (
    <div className={cn("flex min-h-[60vh] items-center justify-center p-4", className)}>
      <CardWrapper className="max-w-md text-center">
        {/* Icon with teal accent */}
        <div className="bg-teal/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <FileQuestion className="text-teal h-8 w-8" />
        </div>

        {/* 404 indicator */}
        <p className="text-teal mb-2 text-4xl font-bold">404</p>

        {/* Title */}
        <h1 className="text-foreground-strong mb-2 text-xl font-semibold">{title}</h1>

        {/* Message */}
        <p className="text-muted-foreground mb-6 text-sm">{message}</p>

        {/* Navigation suggestions */}
        <div className="bg-muted/30 mb-6 rounded-lg p-4">
          <p className="text-muted-foreground mb-3 text-xs font-medium">Try one of these:</p>
          <ul className="space-y-2 text-left text-sm">
            <li>
              <a href="/home" className="text-teal flex items-center gap-2 hover:underline">
                <Home className="h-4 w-4" />
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="/home/patients"
                className="text-teal flex items-center gap-2 hover:underline"
              >
                <Search className="h-4 w-4" />
                Patients
              </a>
            </li>
            <li>
              <a
                href="/home/schedule"
                className="text-teal flex items-center gap-2 hover:underline"
              >
                <Search className="h-4 w-4" />
                Schedule
              </a>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" className="gap-2">
            <a href="/home">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </a>
          </Button>

          <Button variant="ghost" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Search suggestion */}
        {showSearchSuggestion && (
          <p className="text-muted-foreground mt-6 text-xs">
            Need help finding something? Try using the search bar or voice commands.
          </p>
        )}
      </CardWrapper>
    </div>
  );
}
