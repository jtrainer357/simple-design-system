/**
 * Audit logging for HIPAA compliance.
 * Captures who accessed what PHI and when.
 */

export type AuditAction = "view" | "create" | "update" | "delete" | "export" | "search";
export type AuditResourceType =
  | "patient"
  | "session_note"
  | "appointment"
  | "outcome_measure"
  | "message"
  | "import_batch";

interface AuditLogEntry {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
  practiceId?: string;
}

/**
 * Log an auditable action for HIPAA compliance.
 * For hackathon demo, this logs to console.
 * In production, this would write to a secure audit log table.
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    // For hackathon demo, just log to console
    console.log("[Audit]", {
      timestamp: new Date().toISOString(),
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId || null,
      details: entry.details || {},
    });
  } catch (error) {
    // Audit logging should never break the main request
    console.error("[Audit] Failed to log:", error);
  }
}
