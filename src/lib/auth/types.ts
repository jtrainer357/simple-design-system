/**
 * Authentication types for multi-tenant healthcare practice management.
 * Supports role-based access control with practice-level isolation.
 */

/**
 * User roles within a practice.
 * - owner: Full administrative access, can manage users and settings
 * - admin: Administrative access, can manage most settings
 * - provider: Clinical access to patient data within their practice
 * - staff: Limited access for front-office operations
 * - billing: Access to billing and invoicing functions
 * - readonly: View-only access for reporting/auditing
 */
export type UserRole = "owner" | "admin" | "provider" | "staff" | "billing" | "readonly";

/**
 * Role permissions matrix.
 * Defines what each role can access.
 */
export const ROLE_PERMISSIONS = {
  owner: {
    canManageUsers: true,
    canManagePractice: true,
    canViewPatients: true,
    canEditPatients: true,
    canViewBilling: true,
    canEditBilling: true,
    canViewReports: true,
    canExportData: true,
    canDeleteRecords: true,
  },
  admin: {
    canManageUsers: true,
    canManagePractice: true,
    canViewPatients: true,
    canEditPatients: true,
    canViewBilling: true,
    canEditBilling: true,
    canViewReports: true,
    canExportData: true,
    canDeleteRecords: false,
  },
  provider: {
    canManageUsers: false,
    canManagePractice: false,
    canViewPatients: true,
    canEditPatients: true,
    canViewBilling: false,
    canEditBilling: false,
    canViewReports: true,
    canExportData: false,
    canDeleteRecords: false,
  },
  staff: {
    canManageUsers: false,
    canManagePractice: false,
    canViewPatients: true,
    canEditPatients: false,
    canViewBilling: false,
    canEditBilling: false,
    canViewReports: false,
    canExportData: false,
    canDeleteRecords: false,
  },
  billing: {
    canManageUsers: false,
    canManagePractice: false,
    canViewPatients: true,
    canEditPatients: false,
    canViewBilling: true,
    canEditBilling: true,
    canViewReports: true,
    canExportData: true,
    canDeleteRecords: false,
  },
  readonly: {
    canManageUsers: false,
    canManagePractice: false,
    canViewPatients: true,
    canEditPatients: false,
    canViewBilling: false,
    canEditBilling: false,
    canViewReports: true,
    canExportData: false,
    canDeleteRecords: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.owner;

/**
 * Authenticated user with practice context.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  /** The user's role within the current practice */
  role: UserRole;
  /** The practice this user is currently authenticated to */
  practiceId: string;
  /** Practice name for display purposes */
  practiceName: string;
  /** Avatar URL if available */
  avatarUrl?: string;
  /** Whether the user has completed MFA setup */
  mfaEnabled: boolean;
  /** User's timezone preference */
  timezone?: string;
  /** Last login timestamp */
  lastLoginAt?: string;
}

/**
 * Extended session with practice context.
 * Used by NextAuth for JWT and session callbacks.
 */
export interface AuthSession {
  user: AuthUser;
  expires: string;
  /** Access token for API calls */
  accessToken?: string;
}

/**
 * JWT token payload structure.
 * Extended from default NextAuth JWT.
 */
export interface AuthJWT {
  /** User ID */
  sub: string;
  /** Email address */
  email: string;
  /** User display name */
  name: string;
  /** User role in current practice */
  role: UserRole;
  /** Practice ID for tenant isolation */
  practiceId: string;
  /** Practice name */
  practiceName: string;
  /** Token issued at */
  iat: number;
  /** Token expiration */
  exp: number;
  /** MFA enabled flag */
  mfaEnabled: boolean;
}

/**
 * User registration/invitation data.
 */
export interface UserInvite {
  email: string;
  role: UserRole;
  practiceId: string;
  invitedBy: string;
  expiresAt: string;
}

/**
 * Practice membership - links users to practices.
 */
export interface PracticeMembership {
  userId: string;
  practiceId: string;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
  invitedBy?: string;
}

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

/**
 * Check if a role is at least as privileged as another.
 */
export function isRoleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: UserRole[] = ["readonly", "staff", "billing", "provider", "admin", "owner"];
  const userLevel = roleHierarchy.indexOf(userRole);
  const requiredLevel = roleHierarchy.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}
