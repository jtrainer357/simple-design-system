/**
 * PII Redactor
 *
 * Utility for redacting Personally Identifiable Information (PII) from log messages.
 * Patterns are designed to match common healthcare-related PII formats.
 */

/**
 * PII pattern definition
 */
interface PIIPattern {
  /** Pattern name for identification */
  name: string;
  /** Regular expression to match the pattern */
  pattern: RegExp;
  /** Replacement text */
  replacement: string;
}

/**
 * PII patterns for healthcare applications
 */
export const PII_PATTERNS: PIIPattern[] = [
  {
    name: "SSN",
    // Matches XXX-XX-XXXX format
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: "[SSN]",
  },
  {
    name: "SSN_NO_DASH",
    // Matches 9 consecutive digits (potential SSN without dashes)
    pattern: /\b\d{9}\b/g,
    replacement: "[SSN]",
  },
  {
    name: "EMAIL",
    // Standard email pattern
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "[EMAIL]",
  },
  {
    name: "PHONE",
    // Matches various phone formats: XXX-XXX-XXXX, XXX.XXX.XXXX, (XXX) XXX-XXXX
    pattern: /\b(?:\(\d{3}\)\s?|\d{3}[-.])\d{3}[-.]?\d{4}\b/g,
    replacement: "[PHONE]",
  },
  {
    name: "PHONE_SIMPLE",
    // Matches 10 consecutive digits (potential phone without formatting)
    pattern: /\b\d{10}\b/g,
    replacement: "[PHONE]",
  },
  {
    name: "DOB",
    // Matches MM/DD/YYYY format
    pattern: /\b\d{2}\/\d{2}\/\d{4}\b/g,
    replacement: "[DOB]",
  },
  {
    name: "DOB_DASH",
    // Matches YYYY-MM-DD format (ISO)
    pattern: /\b\d{4}-\d{2}-\d{2}\b/g,
    replacement: "[DOB]",
  },
  {
    name: "CREDIT_CARD",
    // Matches common credit card formats
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    replacement: "[CARD]",
  },
  {
    name: "ZIPCODE_FULL",
    // Matches ZIP+4 format XXXXX-XXXX
    pattern: /\b\d{5}-\d{4}\b/g,
    replacement: "[ZIP]",
  },
  {
    name: "MRN",
    // Matches potential Medical Record Numbers (common formats)
    pattern: /\bMRN[:\s]?\d{6,10}\b/gi,
    replacement: "[MRN]",
  },
  {
    name: "NPI",
    // Matches National Provider Identifier (10 digits starting with 1 or 2)
    pattern: /\bNPI[:\s]?[12]\d{9}\b/gi,
    replacement: "[NPI]",
  },
];

/**
 * Redact PII from a text string
 *
 * @param text - The text to redact PII from
 * @returns The text with PII replaced by placeholders
 *
 * @example
 * redactPII("Patient SSN: 123-45-6789")
 * // Returns: "Patient SSN: [SSN]"
 *
 * @example
 * redactPII("Contact: john@example.com, 555-123-4567")
 * // Returns: "Contact: [EMAIL], [PHONE]"
 */
export function redactPII(text: string): string {
  if (!text || typeof text !== "string") {
    return text;
  }

  let redactedText = text;

  for (const { pattern, replacement } of PII_PATTERNS) {
    redactedText = redactedText.replace(pattern, replacement);
  }

  return redactedText;
}

/**
 * Recursively redact PII from an object
 *
 * @param obj - Object to redact PII from
 * @returns Object with PII redacted from all string values
 */
export function redactPIIFromObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return redactPII(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactPIIFromObject(item)) as T;
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = redactPIIFromObject(value);
    }
    return result as T;
  }

  return obj;
}

/**
 * Check if a string contains potential PII
 *
 * @param text - Text to check for PII
 * @returns True if PII patterns are detected
 */
export function containsPII(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  return PII_PATTERNS.some(({ pattern }) => {
    // Reset pattern lastIndex for global regex
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

/**
 * Get list of PII types found in text
 *
 * @param text - Text to analyze
 * @returns Array of PII type names found
 */
export function detectPIITypes(text: string): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  return PII_PATTERNS.filter(({ pattern }) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  }).map(({ name }) => name);
}
