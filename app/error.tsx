"use client";

import { useEffect } from "react";
import { Button } from "@/design-system/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="max-w-md text-center text-gray-600">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      {error.digest && <p className="text-sm text-gray-400">Error ID: {error.digest}</p>}
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
