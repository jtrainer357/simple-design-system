/**
 * Enhanced Structured Logger
 *
 * Wraps the base logger with PII redaction and enhanced context.
 * Use this logger for all application logging to ensure PII safety.
 */

import {
  logger as baseLogger,
  createLogger as createBaseLogger,
  type LogContext,
} from "@/src/lib/logger";
import { redactPII, redactPIIFromObject } from "./pii-redactor";
import type { LogEntry, LogLevel, ILogger } from "./types";

/**
 * Determine if we're in production
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Redact PII from log context if in production
 */
function safeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;

  // In production, redact all PII from context
  if (isProduction()) {
    return redactPIIFromObject(context);
  }

  return context;
}

/**
 * Redact PII from message if in production
 */
function safeMessage(message: string): string {
  if (isProduction()) {
    return redactPII(message);
  }
  return message;
}

/**
 * Enhanced logger class with PII redaction
 */
class SafeLogger implements ILogger {
  private module?: string;

  constructor(module?: string) {
    this.module = module;
  }

  debug(message: string, context?: LogContext): void {
    const logger = this.module ? createBaseLogger(this.module) : baseLogger;
    logger.debug(safeMessage(message), safeContext(context));
  }

  info(message: string, context?: LogContext): void {
    const logger = this.module ? createBaseLogger(this.module) : baseLogger;
    logger.info(safeMessage(message), safeContext(context));
  }

  warn(message: string, context?: LogContext): void {
    const logger = this.module ? createBaseLogger(this.module) : baseLogger;
    logger.warn(safeMessage(message), safeContext(context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const logger = this.module ? createBaseLogger(this.module) : baseLogger;

    // Redact error message in production
    let safeError: Error | unknown = error;
    if (isProduction() && error instanceof Error) {
      const redactedError = new Error(redactPII(error.message));
      redactedError.name = error.name;
      if (error.stack) {
        // Redact stack trace in production
        redactedError.stack = redactPII(error.stack);
      }
      safeError = redactedError;
    }

    logger.error(safeMessage(message), safeError, safeContext(context));
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): SafeLogger {
    // For now, just return a new logger with the module from context
    return new SafeLogger(context.module || this.module);
  }
}

/**
 * Create a safe logger instance for a specific module
 *
 * @param module - Module name for log context
 * @returns SafeLogger instance with PII redaction
 *
 * @example
 * const logger = createSafeLogger("PatientService");
 * logger.info("Fetching patient", { patientId: "123" });
 */
export function createSafeLogger(module: string): SafeLogger {
  return new SafeLogger(module);
}

/**
 * Default safe logger instance
 * Use this for general logging with automatic PII redaction
 */
export const safeLogger = new SafeLogger();

/**
 * Re-export types
 */
export type { LogEntry, LogLevel, LogContext, ILogger };
