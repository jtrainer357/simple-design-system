/**
 * CSRF Protection
 */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_COOKIE_NAME = "csrf-token";

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

export function hashCSRFToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function validateCSRFToken(request: NextRequest): boolean {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!headerToken || !cookieToken) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(hashCSRFToken(headerToken)), Buffer.from(hashCSRFToken(cookieToken)));
  } catch {
    return false;
  }
}

export function requiresCSRFProtection(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase());
}

export function isCSRFExempt(path: string): boolean {
  return ["/api/auth/callback", "/api/auth/signin", "/api/auth/signout", "/api/webhooks/"].some((p) => path.startsWith(p));
}

export function csrfMiddleware(request: NextRequest): NextResponse | null {
  const method = request.method;
  const path = new URL(request.url).pathname;
  if (!requiresCSRFProtection(method) || isCSRFExempt(path) || !path.startsWith("/api/")) return null;
  if (!validateCSRFToken(request)) {
    console.warn("[CSRF] Invalid token:", { method, path });
    return new NextResponse(JSON.stringify({ error: "Forbidden", message: "Invalid or missing CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }
  return null;
}

export function setCSRFCookie(response: NextResponse): NextResponse {
  response.cookies.set(CSRF_COOKIE_NAME, generateCSRFToken(), { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 86400 });
  return response;
}

export const csrfClient = {
  getToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
    return match ? match[1] : null;
  },
  getHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { [CSRF_HEADER_NAME]: token } : {};
  },
};
