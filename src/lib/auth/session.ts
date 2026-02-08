/**
 * Session management utilities for multi-tenant healthcare app.
 * Provides helpers for accessing and validating user sessions.
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth-options";
import type { AuthSession, AuthUser, Permission, UserRole } from "./types";
import { hasPermission, isRoleAtLeast } from "./types";

/**
 * Error thrown when authentication is required but not present.
 */
export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Error thrown when user lacks required permissions.
 */
export class AuthorizationError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Get the current session from the server.
 * Returns null if not authenticated.
 *
 * @example
 * ```tsx
 * const session = await getSession();
 * if (session) {
 *   console.log(`Logged in as ${session.user.email}`);
 * }
 * ```
 */
export async function getSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  return session as AuthSession | null;
}

/**
 * Get the current authenticated user.
 * Returns null if not authenticated.
 *
 * @example
 * ```tsx
 * const user = await getUser();
 * if (user) {
 *   console.log(`Practice: ${user.practiceName}`);
 * }
 * ```
 */
export async function getUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Get the current practice ID from the session.
 * Returns null if not authenticated.
 *
 * @example
 * ```tsx
 * const practiceId = await getPracticeId();
 * const patients = await fetchPatients(practiceId);
 * ```
 */
export async function getPracticeId(): Promise<string | null> {
  const user = await getUser();
  return user?.practiceId ?? null;
}

/**
 * Require authentication - redirects to login if not authenticated.
 * Use in page components that require a logged-in user.
 *
 * @example
 * ```tsx
 * export default async function ProtectedPage() {
 *   const session = await requireAuth();
 *   return <div>Welcome, {session.user.name}</div>;
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Require authentication and throw if not authenticated.
 * Use in API routes where redirect is not appropriate.
 *
 * @example
 * ```tsx
 * export async function GET() {
 *   const session = await requireAuthOrThrow();
 *   return Response.json({ user: session.user });
 * }
 * ```
 */
export async function requireAuthOrThrow(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    throw new AuthenticationError();
  }

  return session;
}

/**
 * Require a specific role or higher.
 * Redirects to home if user doesn't have sufficient role.
 *
 * @example
 * ```tsx
 * export default async function AdminPage() {
 *   const session = await requireRole('admin');
 *   return <AdminDashboard user={session.user} />;
 * }
 * ```
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthSession> {
  const session = await requireAuth();

  if (!isRoleAtLeast(session.user.role, requiredRole)) {
    redirect("/");
  }

  return session;
}

/**
 * Require a specific role or throw an error.
 * Use in API routes.
 *
 * @example
 * ```tsx
 * export async function DELETE() {
 *   const session = await requireRoleOrThrow('owner');
 *   // Only owners can delete
 * }
 * ```
 */
export async function requireRoleOrThrow(requiredRole: UserRole): Promise<AuthSession> {
  const session = await requireAuthOrThrow();

  if (!isRoleAtLeast(session.user.role, requiredRole)) {
    throw new AuthorizationError(`Role '${requiredRole}' or higher is required`);
  }

  return session;
}

/**
 * Require a specific permission.
 * Redirects to home if user doesn't have the permission.
 *
 * @example
 * ```tsx
 * export default async function BillingPage() {
 *   const session = await requirePermission('canViewBilling');
 *   return <BillingDashboard />;
 * }
 * ```
 */
export async function requirePermission(permission: Permission): Promise<AuthSession> {
  const session = await requireAuth();

  if (!hasPermission(session.user.role, permission)) {
    redirect("/");
  }

  return session;
}

/**
 * Require a specific permission or throw an error.
 * Use in API routes.
 *
 * @example
 * ```tsx
 * export async function POST() {
 *   const session = await requirePermissionOrThrow('canEditPatients');
 *   // Create patient record
 * }
 * ```
 */
export async function requirePermissionOrThrow(permission: Permission): Promise<AuthSession> {
  const session = await requireAuthOrThrow();

  if (!hasPermission(session.user.role, permission)) {
    throw new AuthorizationError(`Permission '${permission}' is required`);
  }

  return session;
}

/**
 * Check if the current user has a specific permission.
 * Returns false if not authenticated.
 *
 * @example
 * ```tsx
 * const canEdit = await checkPermission('canEditPatients');
 * if (canEdit) {
 *   showEditButton();
 * }
 * ```
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getUser();

  if (!user) {
    return false;
  }

  return hasPermission(user.role, permission);
}

/**
 * Check if the current user has at least the specified role.
 * Returns false if not authenticated.
 *
 * @example
 * ```tsx
 * const isAdmin = await checkRole('admin');
 * ```
 */
export async function checkRole(role: UserRole): Promise<boolean> {
  const user = await getUser();

  if (!user) {
    return false;
  }

  return isRoleAtLeast(user.role, role);
}

/**
 * Get session for use in API handlers with proper error responses.
 * Returns session or null with appropriate error info.
 *
 * @example
 * ```tsx
 * export async function GET() {
 *   const { session, error } = await getApiSession();
 *   if (error) {
 *     return Response.json({ error: error.message }, { status: error.status });
 *   }
 *   return Response.json({ data: ... });
 * }
 * ```
 */
export async function getApiSession(): Promise<{
  session: AuthSession | null;
  error: { message: string; status: number } | null;
}> {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      error: { message: "Authentication required", status: 401 },
    };
  }

  return { session, error: null };
}

/**
 * Validate that the session's practice ID matches the requested practice.
 * Used to enforce tenant isolation in API routes.
 *
 * @example
 * ```tsx
 * export async function GET(req, { params }) {
 *   const session = await requireAuthOrThrow();
 *   validatePracticeAccess(session, params.practiceId);
 *   // Safe to access practice data
 * }
 * ```
 */
export function validatePracticeAccess(session: AuthSession, practiceId: string): void {
  if (session.user.practiceId !== practiceId) {
    throw new AuthorizationError("Access denied to this practice");
  }
}
