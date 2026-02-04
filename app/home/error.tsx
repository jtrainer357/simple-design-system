"use client";

import { useEffect } from "react";
import { Button } from "@/design-system/components/ui/button";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Home page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 lg:pl-36">
      <CardWrapper className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Unable to load this page</h2>
        <p className="mb-6 text-sm text-gray-600">
          We encountered an error while loading this content. This might be a temporary issue.
        </p>
        {error.digest && <p className="mb-4 text-xs text-gray-400">Reference: {error.digest}</p>}
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reload page
        </Button>
      </CardWrapper>
    </div>
  );
}
