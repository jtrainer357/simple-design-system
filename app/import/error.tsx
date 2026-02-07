"use client";

import { useEffect } from "react";
import { Button } from "@/design-system/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ImportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details for debugging
    console.error("[Import Page Error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Unable to load import wizard</h2>
        <p className="mb-6 text-sm text-gray-600">
          We encountered an error while loading the data import wizard. This might be a temporary
          issue.
        </p>
        {error.digest && <p className="mb-4 text-xs text-gray-400">Reference: {error.digest}</p>}
        <Button
          onClick={reset}
          className="gap-2 bg-[var(--growth-2)] hover:bg-[var(--growth-2)]/90"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </main>
  );
}
