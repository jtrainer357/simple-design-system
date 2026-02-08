"use client";

import * as React from "react";
import { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/design-system/components/ui/button";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/components/ui/card";
import { Alert, AlertDescription } from "@/design-system/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Loader2, Check, X, CheckCircle } from "lucide-react";

const PASSWORD_REQUIREMENTS = [
  { label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

type ResetPasswordError = "invalid_token" | "expired_token" | "network" | null;

const ERROR_MESSAGES: Record<Exclude<ResetPasswordError, null>, string> = {
  invalid_token: "This reset link is invalid. Please request a new one.",
  expired_token: "This reset link has expired. Please request a new one.",
  network: "Unable to connect. Please check your internet connection.",
};

function PasswordStrengthIndicator({ password }: { password: string }) {
  const results = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    passed: req.test(password),
  }));
  const passedCount = results.filter((r) => r.passed).length;
  const strength = passedCount / PASSWORD_REQUIREMENTS.length;

  const getStrengthColor = () => {
    if (strength === 0) return "bg-muted";
    if (strength < 0.4) return "bg-destructive";
    if (strength < 0.8) return "bg-warning";
    return "bg-success";
  };

  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength < 0.4) return "Weak";
    if (strength < 0.8) return "Fair";
    if (strength < 1) return "Good";
    return "Strong";
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{getStrengthLabel()}</span>
      </div>
      <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {results.map((req) => (
          <li
            key={req.label}
            className={`flex items-center gap-1.5 ${
              req.passed ? "text-success" : "text-muted-foreground"
            }`}
          >
            {req.passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ResetPasswordError>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const isPasswordValid = useMemo(() => {
    return PASSWORD_REQUIREMENTS.every((req) => req.test(password));
  }, [password]);

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError("Password is required");
      return false;
    }
    if (!PASSWORD_REQUIREMENTS.every((req) => req.test(value))) {
      setPasswordError("Password does not meet all requirements");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (value: string): boolean => {
    if (!value) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    }
    if (value !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isPasswordOk = validatePassword(password);
    const isConfirmOk = validateConfirmPassword(confirmPassword);

    if (!isPasswordOk || !isConfirmOk) return;
    if (!token) {
      setError("invalid_token");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("expired")) {
          setError("expired_token");
        } else if (data.error?.includes("invalid")) {
          setError("invalid_token");
        } else {
          setError("network");
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => router.push("/login?message=password_reset"), 2000);
    } catch {
      setError("network");
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>This reset link is invalid. Please request a new one.</AlertDescription>
        </Alert>
        <Link href="/forgot-password">
          <Button variant="outline" className="h-12 w-full">
            Request new reset link
          </Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-6 w-6 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Password reset successful!</h3>
          <p className="mt-1 text-sm text-muted-foreground">Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{ERROR_MESSAGES[error]}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              disabled={isLoading}
              className={`pr-10 ${passwordError ? "border-destructive" : ""}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthIndicator password={password} />
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) validateConfirmPassword(e.target.value);
              }}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              disabled={isLoading}
              className={`pr-10 ${confirmPasswordError ? "border-destructive" : ""}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPasswordError && <p className="text-sm text-destructive">{confirmPasswordError}</p>}
        </div>

        <Button type="submit" className="h-12 w-full" disabled={isLoading || !isPasswordValid}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-10 w-full rounded-md bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-10 w-full rounded-md bg-muted" />
      </div>
      <div className="h-12 w-full rounded-full bg-muted" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Image src="/tebra-logo.svg" alt="Tebra Mental Health" width={140} height={34} priority />
        </div>

        <Card opacity="solid" className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Reset your password
            </CardTitle>
            <CardDescription>Enter a new password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<FormSkeleton />}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
