"use client";

import * as React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/components/ui/dialog";
import { Clock, LogOut } from "lucide-react";

// HIPAA-compliant session timeout settings
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes warning
const WARNING_THRESHOLD_MS = SESSION_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS; // 13 minutes

// Activity events to track
const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

interface SessionTimeoutModalProps {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
}

export function SessionTimeoutModal({ isAuthenticated }: SessionTimeoutModalProps) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_BEFORE_TIMEOUT_MS / 1000);
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setCountdown(WARNING_BEFORE_TIMEOUT_MS / 1000);

    // Clear any existing countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    // Clear all timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (sessionCheckIntervalRef.current) clearInterval(sessionCheckIntervalRef.current);

    await signOut({ redirect: false });
    router.push("/login?message=session_expired");
  }, [router]);

  const handleContinueSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Check session status periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;

      if (timeSinceActivity >= SESSION_TIMEOUT_MS) {
        // Session expired - log out
        handleLogout();
      } else if (timeSinceActivity >= WARNING_THRESHOLD_MS && !showWarning) {
        // Show warning
        setShowWarning(true);
        const remainingMs = SESSION_TIMEOUT_MS - timeSinceActivity;
        setCountdown(Math.ceil(remainingMs / 1000));

        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    // Check every second
    sessionCheckIntervalRef.current = setInterval(checkSession, 1000);

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [isAuthenticated, showWarning, handleLogout]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      // Only reset if warning is not showing
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    // Add event listeners for activity tracking
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, showWarning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (sessionCheckIntervalRef.current) clearInterval(sessionCheckIntervalRef.current);
    };
  }, []);

  // Format countdown for display
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <DialogTitle className="text-center text-xl">Session Expiring</DialogTitle>
          <DialogDescription className="text-center">
            For your security, your session will expire in{" "}
            <span className="font-bold text-foreground">{formatCountdown(countdown)}</span>.
            <br />
            Click &quot;Continue Session&quot; to stay signed in.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-12 w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
          <Button
            onClick={handleContinueSession}
            className="h-12 w-full sm:w-auto"
          >
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Export the timeout constants for use elsewhere
export const SESSION_TIMEOUT = {
  TOTAL_MS: SESSION_TIMEOUT_MS,
  WARNING_MS: WARNING_BEFORE_TIMEOUT_MS,
  THRESHOLD_MS: WARNING_THRESHOLD_MS,
};
