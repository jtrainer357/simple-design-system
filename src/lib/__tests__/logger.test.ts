/**
 * Logger Utility Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogEntry, formatLogEntry, createLogger, logger, type LogEntry } from "../logger";

describe("Logger", () => {
  describe("createLogEntry", () => {
    it("creates a log entry with timestamp and level", () => {
      const entry = createLogEntry("info", "Test message");

      expect(entry.timestamp).toBeDefined();
      expect(entry.level).toBe("info");
      expect(entry.message).toBe("Test message");
    });

    it("includes context when provided", () => {
      const context = { module: "patients", action: "fetch" };
      const entry = createLogEntry("info", "Test message", context);

      expect(entry.context).toEqual(context);
    });

    it("excludes context when empty", () => {
      const entry = createLogEntry("info", "Test message", {});

      expect(entry.context).toBeUndefined();
    });

    it("includes error details with stack trace", () => {
      const error = new Error("Test error");
      const entry = createLogEntry("error", "Error occurred", undefined, error);

      expect(entry.error).toBeDefined();
      expect(entry.error?.name).toBe("Error");
      expect(entry.error?.message).toBe("Test error");
      expect(entry.error?.stack).toBeDefined();
    });
  });

  describe("formatLogEntry", () => {
    it("formats log with timestamp and level", () => {
      const entry: LogEntry = {
        timestamp: "2024-02-06T10:00:00.000Z",
        level: "info",
        message: "Test message",
      };

      const formatted = formatLogEntry(entry);

      expect(formatted).toBe("[2024-02-06T10:00:00.000Z] [INFO] Test message");
    });

    it("includes context in formatted output", () => {
      const entry: LogEntry = {
        timestamp: "2024-02-06T10:00:00.000Z",
        level: "warn",
        message: "Warning message",
        context: { module: "billing" },
      };

      const formatted = formatLogEntry(entry);

      expect(formatted).toContain("[WARN]");
      expect(formatted).toContain("Warning message");
      expect(formatted).toContain('"module":"billing"');
    });

    it("handles all log levels correctly", () => {
      const levels = ["debug", "info", "warn", "error"] as const;

      levels.forEach((level) => {
        const entry: LogEntry = {
          timestamp: "2024-02-06T10:00:00.000Z",
          level,
          message: "Test",
        };
        const formatted = formatLogEntry(entry);
        expect(formatted).toContain(`[${level.toUpperCase()}]`);
      });
    });
  });

  describe("Logger class", () => {
    let consoleSpy: {
      debug: ReturnType<typeof vi.spyOn>;
      info: ReturnType<typeof vi.spyOn>;
      warn: ReturnType<typeof vi.spyOn>;
      error: ReturnType<typeof vi.spyOn>;
    };
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      // Set to development to get human-readable format for testing
      process.env.NODE_ENV = "development";
      consoleSpy = {
        debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
        info: vi.spyOn(console, "info").mockImplementation(() => {}),
        warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
        error: vi.spyOn(console, "error").mockImplementation(() => {}),
      };
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      vi.restoreAllMocks();
    });

    it("logs info messages", () => {
      logger.info("Info message");

      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info.mock.calls[0]?.[0]).toContain("[INFO]");
      expect(consoleSpy.info.mock.calls[0]?.[0]).toContain("Info message");
    });

    it("logs warning messages", () => {
      logger.warn("Warning message");

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn.mock.calls[0]?.[0]).toContain("[WARN]");
    });

    it("logs error messages with stack trace", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error);

      expect(consoleSpy.error).toHaveBeenCalled();
      // First call is the formatted message, second is the stack trace
      expect(consoleSpy.error.mock.calls[0]?.[0]).toContain("[ERROR]");
    });

    it("includes module name when created with createLogger", () => {
      const moduleLogger = createLogger("patients");
      moduleLogger.info("Patient action");

      expect(consoleSpy.info.mock.calls[0]?.[0]).toContain("patients");
    });

    it("merges module context with additional context", () => {
      const moduleLogger = createLogger("billing");
      moduleLogger.info("Invoice processed", { invoiceId: "inv-123" });

      const logOutput = consoleSpy.info.mock.calls[0]?.[0] as string;
      expect(logOutput).toContain("billing");
      expect(logOutput).toContain("inv-123");
    });
  });

  describe("production behavior", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("suppresses debug logs in production", () => {
      process.env.NODE_ENV = "production";
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

      logger.debug("Debug message");

      expect(debugSpy).not.toHaveBeenCalled();
      debugSpy.mockRestore();
    });

    it("allows debug logs in development", () => {
      process.env.NODE_ENV = "development";
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

      logger.debug("Debug message");

      expect(debugSpy).toHaveBeenCalled();
      debugSpy.mockRestore();
    });
  });
});
