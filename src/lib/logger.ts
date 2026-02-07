/**
 * Logger Utility
 * Centralized logging with structured output and environment awareness
 *
 * Features:
 * - Structured JSON output for production
 * - Human-readable output for development
 * - Debug logs suppressed in production
 * - Error stack traces included
 * - Module-scoped loggers for better tracing
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  module?: string;
  action?: string;
  userId?: string;
  patientId?: string;
  practiceId?: string;
  requestId?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Determine if we're in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Determine if we're in development environment
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Format a log entry as JSON (for production/structured logging)
 */
export function formatLogEntryJson(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Format a log entry for human-readable output (development)
 */
export function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context } = entry;
  const contextStr =
    context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Create a log entry object
 */
export function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

/**
 * Logger class with methods for each log level
 */
class Logger {
  private module?: string;

  constructor(module?: string) {
    this.module = module;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    // Suppress debug logs in production
    if (level === "debug" && isProduction()) {
      return;
    }

    const fullContext: LogContext = {
      ...(this.module ? { module: this.module } : {}),
      ...context,
    };

    const entry = createLogEntry(level, message, fullContext, error);

    // Use JSON format in production, human-readable in development
    const formattedMessage = isDevelopment() ? formatLogEntry(entry) : formatLogEntryJson(entry);

    switch (level) {
      case "debug":
        console.debug(formattedMessage);
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "error":
        console.error(formattedMessage);
        if (isDevelopment() && entry.error?.stack) {
          console.error(entry.error.stack);
        }
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const err = error instanceof Error ? error : undefined;
    this.log("error", message, context, err);
  }
}

/**
 * Create a logger instance for a specific module
 */
export function createLogger(module: string): Logger {
  return new Logger(module);
}

/**
 * Default logger instance
 */
export const logger = new Logger();
