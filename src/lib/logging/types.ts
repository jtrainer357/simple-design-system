/**
 * Logging Types
 *
 * Type definitions for the structured logging system.
 */

/**
 * Log severity levels
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Context metadata for log entries
 */
export interface LogContext {
  /** Module or component name */
  module?: string;
  /** Action being performed */
  action?: string;
  /** User identifier (if available) */
  userId?: string;
  /** Patient identifier (should be redacted in production) */
  patientId?: string;
  /** Practice identifier */
  practiceId?: string;
  /** Request/trace identifier for correlation */
  requestId?: string;
  /** Duration in milliseconds */
  duration?: number;
  /** Error severity classification */
  severity?: "low" | "medium" | "high" | "critical";
  /** Additional arbitrary context */
  [key: string]: unknown;
}

/**
 * Structured error information
 */
export interface LogError {
  /** Error name/type */
  name: string;
  /** Error message */
  message: string;
  /** Stack trace (only in development) */
  stack?: string;
  /** Error code if available */
  code?: string | number;
}

/**
 * Complete log entry structure
 */
export interface LogEntry {
  /** ISO timestamp */
  timestamp: string;
  /** Log severity level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Contextual metadata */
  context?: LogContext;
  /** Error information if present */
  error?: LogError;
  /** Environment (production/development) */
  env?: string;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  minLevel?: LogLevel;
  /** Whether to include stack traces */
  includeStackTrace?: boolean;
  /** Whether to enable PII redaction */
  redactPII?: boolean;
  /** Custom log output handler */
  output?: (entry: LogEntry) => void;
}

/**
 * Logger interface
 */
export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error | unknown, context?: LogContext): void;
}
