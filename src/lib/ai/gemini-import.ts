/**
 * AI-powered column mapping for CSV imports.
 * Uses Gemini for intelligent field detection and mapping.
 */

// Schema derived from patient data model
const TARGET_SCHEMA = {
  first_name: "Patient's first/given name (required)",
  last_name: "Patient's last/family name (required)",
  date_of_birth: "DOB in YYYY-MM-DD format (required)",
  email: "Email address",
  phone_mobile: "Mobile/cell phone",
  phone_home: "Home phone",
  address_street: "Street address",
  address_city: "City",
  address_state: "State (2-letter code)",
  address_zip: "ZIP code (5 or 9 digit)",
  insurance_name: "Insurance company name",
  insurance_member_id: "Insurance member/policy ID",
  primary_diagnosis_code: "ICD-10 code (e.g., F41.1)",
  notes: "General notes about patient",
};

export type ColumnMapping = {
  sourceColumn: string;
  targetField: string | null;
  confidence: number;
  transformRequired: boolean;
  transformType: "none" | "date_format" | "phone_format" | "name_split" | "code_lookup";
};

// Type for CSV row data
type CsvRowData = Record<string, string | number | null>;

/**
 * Generate column mappings using heuristic matching.
 * In production, this would call Gemini for AI-powered matching.
 */
export async function generateColumnMapping(
  headers: string[],
  _sampleRows: CsvRowData[]
): Promise<ColumnMapping[]> {
  // Heuristic mapping for demo
  const mappings: ColumnMapping[] = headers.map((header) => {
    const h = header.toLowerCase().trim();

    // First name detection
    if ((h.includes("first") && h.includes("name")) || h === "firstname" || h === "first_name") {
      return {
        sourceColumn: header,
        targetField: "first_name",
        confidence: 0.95,
        transformRequired: false,
        transformType: "none" as const,
      };
    }

    // Last name detection
    if ((h.includes("last") && h.includes("name")) || h === "lastname" || h === "last_name") {
      return {
        sourceColumn: header,
        targetField: "last_name",
        confidence: 0.95,
        transformRequired: false,
        transformType: "none" as const,
      };
    }

    // Date of birth detection
    if (
      h.includes("dob") ||
      h.includes("birth") ||
      h.includes("date_of_birth") ||
      h === "birthdate"
    ) {
      return {
        sourceColumn: header,
        targetField: "date_of_birth",
        confidence: 0.9,
        transformRequired: true,
        transformType: "date_format" as const,
      };
    }

    // Email detection
    if (h.includes("email") || h.includes("e-mail")) {
      return {
        sourceColumn: header,
        targetField: "email",
        confidence: 0.95,
        transformRequired: false,
        transformType: "none" as const,
      };
    }

    // Phone detection
    if (h.includes("phone") || h.includes("mobile") || h.includes("cell")) {
      const target = h.includes("home") ? "phone_home" : "phone_mobile";
      return {
        sourceColumn: header,
        targetField: target,
        confidence: 0.85,
        transformRequired: true,
        transformType: "phone_format" as const,
      };
    }

    // Address detection
    if (
      h.includes("street") ||
      (h.includes("address") && !h.includes("city") && !h.includes("state") && !h.includes("zip"))
    ) {
      return {
        sourceColumn: header,
        targetField: "address_street",
        confidence: 0.85,
        transformRequired: false,
        transformType: "none" as const,
      };
    }
    if (h.includes("city")) {
      return {
        sourceColumn: header,
        targetField: "address_city",
        confidence: 0.9,
        transformRequired: false,
        transformType: "none" as const,
      };
    }
    if (h.includes("state")) {
      return {
        sourceColumn: header,
        targetField: "address_state",
        confidence: 0.9,
        transformRequired: false,
        transformType: "none" as const,
      };
    }
    if (h.includes("zip") || h.includes("postal")) {
      return {
        sourceColumn: header,
        targetField: "address_zip",
        confidence: 0.9,
        transformRequired: false,
        transformType: "none" as const,
      };
    }

    // Insurance detection
    if (
      h.includes("insurance") &&
      (h.includes("name") || h.includes("company") || h.includes("provider"))
    ) {
      return {
        sourceColumn: header,
        targetField: "insurance_name",
        confidence: 0.85,
        transformRequired: false,
        transformType: "none" as const,
      };
    }
    if (h.includes("member") || (h.includes("policy") && h.includes("id"))) {
      return {
        sourceColumn: header,
        targetField: "insurance_member_id",
        confidence: 0.8,
        transformRequired: false,
        transformType: "none" as const,
      };
    }

    // Notes detection
    if (h.includes("note") || h.includes("comment")) {
      return {
        sourceColumn: header,
        targetField: "notes",
        confidence: 0.7,
        transformRequired: false,
        transformType: "none" as const,
      };
    }

    // Diagnosis detection
    if (h.includes("diagnosis") || h.includes("icd") || h.includes("dx")) {
      return {
        sourceColumn: header,
        targetField: "primary_diagnosis_code",
        confidence: 0.75,
        transformRequired: false,
        transformType: "none" as const,
      };
    }

    // No match
    return {
      sourceColumn: header,
      targetField: null,
      confidence: 0,
      transformRequired: false,
      transformType: "none" as const,
    };
  });

  return mappings;
}

export { TARGET_SCHEMA };
