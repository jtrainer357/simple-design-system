import { describe, it, expect } from "vitest";
import { redactPII, redactPIIFromObject, containsPII, detectPIITypes } from "../pii-redactor";

describe("PII Redactor", () => {
  describe("redactPII", () => {
    it("should redact SSN in XXX-XX-XXXX format", () => {
      const input = "Patient SSN: 123-45-6789";
      expect(redactPII(input)).toBe("Patient SSN: [SSN]");
    });

    it("should redact email addresses", () => {
      const input = "Contact: john.doe@example.com";
      expect(redactPII(input)).toBe("Contact: [EMAIL]");
    });

    it("should redact phone numbers with dashes", () => {
      const input = "Phone: 555-123-4567";
      expect(redactPII(input)).toBe("Phone: [PHONE]");
    });

    it("should redact phone numbers with dots", () => {
      const input = "Phone: 555.123.4567";
      expect(redactPII(input)).toBe("Phone: [PHONE]");
    });

    it("should redact phone numbers with parentheses", () => {
      const input = "Phone: (555) 123-4567";
      expect(redactPII(input)).toBe("Phone: [PHONE]");
    });

    it("should redact dates in MM/DD/YYYY format", () => {
      const input = "DOB: 01/15/1990";
      expect(redactPII(input)).toBe("DOB: [DOB]");
    });

    it("should redact dates in YYYY-MM-DD format", () => {
      const input = "Date: 1990-01-15";
      expect(redactPII(input)).toBe("Date: [DOB]");
    });

    it("should redact credit card numbers", () => {
      const input = "Card: 4111-1111-1111-1111";
      expect(redactPII(input)).toBe("Card: [CARD]");
    });

    it("should redact multiple PII instances", () => {
      const input = "Patient email: test@example.com, SSN: 123-45-6789, Phone: 555-123-4567";
      const expected = "Patient email: [EMAIL], SSN: [SSN], Phone: [PHONE]";
      expect(redactPII(input)).toBe(expected);
    });

    it("should handle empty string", () => {
      expect(redactPII("")).toBe("");
    });

    it("should handle null/undefined gracefully", () => {
      expect(redactPII(null as unknown as string)).toBe(null);
      expect(redactPII(undefined as unknown as string)).toBe(undefined);
    });

    it("should not redact non-PII text", () => {
      const input = "Regular text without PII";
      expect(redactPII(input)).toBe(input);
    });
  });

  describe("redactPIIFromObject", () => {
    it("should redact PII from object string values", () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        ssn: "123-45-6789",
      };
      const expected = {
        name: "John Doe",
        email: "[EMAIL]",
        ssn: "[SSN]",
      };
      expect(redactPIIFromObject(input)).toEqual(expected);
    });

    it("should handle nested objects", () => {
      const input = {
        patient: {
          contact: {
            email: "patient@example.com",
          },
        },
      };
      const expected = {
        patient: {
          contact: {
            email: "[EMAIL]",
          },
        },
      };
      expect(redactPIIFromObject(input)).toEqual(expected);
    });

    it("should handle arrays", () => {
      const input = {
        emails: ["a@example.com", "b@example.com"],
      };
      const expected = {
        emails: ["[EMAIL]", "[EMAIL]"],
      };
      expect(redactPIIFromObject(input)).toEqual(expected);
    });

    it("should preserve non-string values", () => {
      const input = {
        count: 42,
        active: true,
        nullable: null,
      };
      expect(redactPIIFromObject(input)).toEqual(input);
    });
  });

  describe("containsPII", () => {
    it("should detect SSN", () => {
      expect(containsPII("SSN: 123-45-6789")).toBe(true);
    });

    it("should detect email", () => {
      expect(containsPII("email@example.com")).toBe(true);
    });

    it("should detect phone", () => {
      expect(containsPII("555-123-4567")).toBe(true);
    });

    it("should return false for non-PII", () => {
      expect(containsPII("Hello world")).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(containsPII("")).toBe(false);
    });
  });

  describe("detectPIITypes", () => {
    it("should return list of detected PII types", () => {
      const input = "Email: test@example.com, SSN: 123-45-6789";
      const types = detectPIITypes(input);
      expect(types).toContain("EMAIL");
      expect(types).toContain("SSN");
    });

    it("should return empty array for non-PII", () => {
      expect(detectPIITypes("No PII here")).toEqual([]);
    });
  });
});
