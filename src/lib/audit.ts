/**
 * Audit logging for HIPAA compliance.
 * Captures who accessed what PHI and when.
 *
 * This module provides a real implementation that writes to Supabase.
 * All PHI access and sensitive operations are logged for compliance.
 */

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { logger } from "./logger";

// Supabase client with service role for audit logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Audit action types matching the database enum.
 */
export type AuditAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "search"
  | "login"
  | "logout"
  | "login_failed"
  | "password_change"
  | "mfa_enable"
  | "mfa_disable"
  | "role_change"
  | "access_denied";

/**
 * Resource types matching the database enum.
 */
export type AuditResourceType =
  | "patient"
  | "session_note"
  | "appointment"
  | "outcome_measure"
  | "message"
  | "invoice"
  | "priority_action"
  | "clinical_task"
  | "user"
  | "practice"
  | "import_batch"
  | "export"
  | "system";

/**
 * PHI-related resource types that require special logging.
 */
const PHI_RESOURCE_TYPES: AuditResourceType[] = [
  "patient",
  "session_note",
  "appointment",
  "outcome_measure",
  "message",
];

/**
 * Sensitive actions that should be flagged.
 */
const SENSITIVE_ACTIONS: AuditAction[] = [
  "delete",
  "export",
  "password_change",
  "mfa_enable",
  "mfa_disable",
  "role_change",
  "access_denied",
];

/**
 * Audit log entry for creating new records.
 */
export interface AuditLogEntry {
  /** The action being performed */
  action: AuditAction;
  /** Type of resource being accessed */
  resourceType: AuditResourceType;
  /** ID of the specific resource (if applicable) */
  resourceId?: string;
  /** Additional context about the action */
  details?: Record<string, unknown>;
  /** Practice ID (will be inferred from session if not provided) */
  practiceId?: string;
  /** User ID (will be inferred from session if not provided) */
  userId?: string;
  /** User email (for denormalization) */
  userEmail?: string;
  /** User name (for denormalization) */
  userName?: string;
  /** Practice name (for denormalization) */
  practiceName?: string;
  /** Previous state (for updates/deletes) */
  oldValues?: Record<string, unknown>;
  /** New state (for creates/updates) */
  newValues?: Record<string, unknown>;
  /** Override PHI flag */
  isPhiAccess?: boolean;
  /** Override sensitive flag */
  isSensitive?: boolean;
  /** Request correlation ID */
  requestId?: string;
}

/**
 * Get client IP address from request headers.
 */
async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();
    return (
      headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || null
    );
  } catch {
    return null;
  }
}

/**
 * Get user agent from request headers.
 */
async function getUserAgent(): Promise<string | null> {
  try {
    const headersList = await headers();
    return headersList.get("user-agent");
  } catch {
    return null;
  }
}

/**
 * Log an auditable action for HIPAA compliance.
 *
 * This function writes to the audit_logs table in Supabase.
 * It automatically determines if the action involves PHI
 * or is a sensitive operation.
 *
 * @example
 * ```ts
 * await logAudit({
 *   action: 'view',
 *   resourceType: 'patient',
 *   resourceId: 'patient-123',
 *   details: { reason: 'Viewing patient chart' },
 *   practiceId: 'practice-456',
 * });
 * ```
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  // Skip if no Supabase configuration
  if (!supabaseUrl || !supabaseServiceKey) {
    logger.warn("[Audit] Supabase not configured, skipping audit log", {
      action: entry.action,
      resourceType: entry.resourceType,
    });
    return;
  }

  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Determine flags
    const isPhiAccess = entry.isPhiAccess ?? PHI_RESOURCE_TYPES.includes(entry.resourceType);
    const isSensitive = entry.isSensitive ?? SENSITIVE_ACTIONS.includes(entry.action);

    // Get request context
    const [ipAddress, userAgent] = await Promise.all([getClientIp(), getUserAgent()]);

    // Insert audit record
    const { error } = await supabase.from("audit_logs").insert({
      // Actor information
      user_id: entry.userId || null,
      user_email: entry.userEmail || null,
      user_name: entry.userName || null,
      // Context
      practice_id: entry.practiceId || null,
      practice_name: entry.practiceName || null,
      // Action details
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId || null,
      // Additional context
      details: entry.details || {},
      old_values: entry.oldValues || null,
      new_values: entry.newValues || null,
      // Request context
      ip_address: ipAddress,
      user_agent: userAgent,
      request_id: entry.requestId || null,
      // Flags
      is_phi_access: isPhiAccess,
      is_sensitive: isSensitive,
    });

    if (error) {
      logger.error("[Audit] Failed to write audit log", {
        error: error.message,
        action: entry.action,
        resourceType: entry.resourceType,
      });
    }
  } catch (error) {
    // Log error but don't throw - audit logging should not break the app
    logger.error("[Audit] Exception writing audit log", {
      error: error instanceof Error ? error.message : "Unknown error",
      action: entry.action,
      resourceType: entry.resourceType,
    });
  }
}

/**
 * Log a PHI access event with simplified parameters.
 *
 * @example
 * ```ts
 * await logPhiAccess('view', 'patient', 'patient-123', {
 *   userId: user.id,
 *   practiceId: user.practiceId,
 * });
 * ```
 */
export async function logPhiAccess(
  action: AuditAction,
  resourceType: AuditResourceType,
  resourceId: string,
  context: {
    userId?: string;
    userEmail?: string;
    userName?: string;
    practiceId?: string;
    practiceName?: string;
    details?: Record<string, unknown>;
  } = {}
): Promise<void> {
  await logAudit({
    action,
    resourceType,
    resourceId,
    isPhiAccess: true,
    ...context,
  });
}

/**
 * Log a security event (login, logout, access denied, etc.).
 *
 * @example
 * ```ts
 * await logSecurityEvent('login_failed', {
 *   details: { email: 'user@example.com', reason: 'Invalid password' },
 * });
 * ```
 */
export async function logSecurityEvent(
  action: AuditAction,
  context: {
    userId?: string;
    userEmail?: string;
    userName?: string;
    practiceId?: string;
    practiceName?: string;
    details?: Record<string, unknown>;
  } = {}
): Promise<void> {
  await logAudit({
    action,
    resourceType: "system",
    isSensitive: true,
    ...context,
  });
}

/**
 * Create an audit logger bound to a specific user/practice context.
 * Useful for logging multiple events with the same context.
 *
 * @example
 * ```ts
 * const audit = createAuditLogger({
 *   userId: session.user.id,
 *   practiceId: session.user.practiceId,
 * });
 *
 * await audit.log('view', 'patient', 'patient-123');
 * await audit.log('update', 'patient', 'patient-123', { field: 'email' });
 * ```
 */
export function createAuditLogger(context: {
  userId: string;
  userEmail?: string;
  userName?: string;
  practiceId: string;
  practiceName?: string;
}) {
  return {
    /**
     * Log an audit event with the bound context.
     */
    async log(
      action: AuditAction,
      resourceType: AuditResourceType,
      resourceId?: string,
      details?: Record<string, unknown>
    ): Promise<void> {
      await logAudit({
        action,
        resourceType,
        resourceId,
        details,
        ...context,
      });
    },

    /**
     * Log a PHI access event with the bound context.
     */
    async logPhi(
      action: AuditAction,
      resourceType: AuditResourceType,
      resourceId: string,
      details?: Record<string, unknown>
    ): Promise<void> {
      await logPhiAccess(action, resourceType, resourceId, {
        ...context,
        details,
      });
    },

    /**
     * Log a security event with the bound context.
     */
    async logSecurity(action: AuditAction, details?: Record<string, unknown>): Promise<void> {
      await logSecurityEvent(action, { ...context, details });
    },
  };
}
