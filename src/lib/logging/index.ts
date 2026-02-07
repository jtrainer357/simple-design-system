/**
 * Logging Module
 *
 * Provides structured logging with PII redaction for healthcare applications.
 */

// Core logging
export { safeLogger, createSafeLogger } from "./logger";
export type { LogEntry, LogLevel, LogContext, ILogger } from "./logger";

// PII redaction utilities
export {
  redactPII,
  redactPIIFromObject,
  containsPII,
  detectPIITypes,
  PII_PATTERNS,
} from "./pii-redactor";

// Types
export type { LoggerConfig } from "./types";
