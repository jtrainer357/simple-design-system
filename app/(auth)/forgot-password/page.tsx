"use client";

import * as React from "react";
import { useState } from "react";
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
import { AlertCircle, ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";

type ForgotPasswordError = "not_found" | "network" | "rate_limit" | null;

const ERROR_MESSAGES: Record<Exclude<ForgotPasswordError, null>, string> = {
  not_found: "If an account with that email exists, we've sent a reset link.",
  network: "Unable to connect. Please check your internet connection.",
  rate_limit: "Too many requests. Please wait a few minutes and try again.",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ForgotPasswordError>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(email)) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (response.status === 429) {
        setError("rate_limit");
        setIsLoading(false);
        return;
      }
      setIsSuccess(true);
    } catch {
      setError("network");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Image src="/tebra-logo.svg" alt="Tebra Mental Health" width={140} height={34} priority />
          </div>
          <Card opacity="solid" className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Check your email</CardTitle>
              <CardDescription>
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Didn&apos;t receive the email?</p>
                    <ul className="mt-1 list-inside list-disc space-y-1">
                      <li>Check your spam or junk folder</li>
                      <li>Make sure you entered the correct email</li>
                      <li>Wait a few minutes for delivery</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="h-12 w-full" onClick={() => { setIsSuccess(false); setEmail(""); }}>
                Try a different email
              </Button>
              <div className="text-center">
                <Link href="/login" className="inline-flex items-center text-sm text-teal-dark hover:underline">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Image src="/tebra-logo.svg" alt="Tebra Mental Health" width={140} height={34} priority />
        </div>
        <Card opacity="solid" className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">Forgot your password?</CardTitle>
            <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{ERROR_MESSAGES[error]}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@practice.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
                  onBlur={() => validateEmail(email)}
                  disabled={isLoading}
                  className={emailError ? "border-destructive" : ""}
                  autoComplete="email"
                />
                {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              </div>
              <Button type="submit" className="h-12 w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send reset link"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center text-sm text-teal-dark hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
