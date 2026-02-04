import { z } from "zod";

// ============================================
// SHARED VALIDATION SCHEMAS
// ============================================

/** UUID format validation */
export const uuidSchema = z.string().uuid("Invalid UUID format");

/** Pagination parameters */
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().optional(),
});

// ============================================
// IMPORT SCHEMAS
// ============================================

export const importAnalyzeSchema = z.object({
  fileKey: z
    .string()
    .min(1)
    .max(500)
    .refine((val) => !val.includes(".."), "Path traversal not allowed"),
});

export const importCommitSchema = z.object({
  fileKey: z
    .string()
    .min(1)
    .max(500)
    .refine((val) => !val.includes(".."), "Path traversal not allowed"),
  mappings: z.array(
    z.object({
      sourceColumn: z.string(),
      targetField: z.string().nullable(),
      confidence: z.number().min(0).max(1),
      transformRequired: z.boolean(),
      transformType: z.enum(["none", "date_format", "phone_format", "name_split", "code_lookup"]),
    })
  ),
});

// ============================================
// SUBSTRATE TASK SCHEMAS
// ============================================

export const taskStatusEnum = z.enum(["pending", "in_progress", "completed", "dismissed"]);

export const taskQuerySchema = z.object({
  status: taskStatusEnum.default("pending"),
  limit: z.coerce.number().int().min(1).max(50).default(4),
});

export const taskUpdateSchema = z.object({
  id: uuidSchema,
  status: taskStatusEnum,
});

// ============================================
// PATIENT SCHEMAS
// ============================================

export const patientSearchSchema = z.object({
  q: z.string().max(200, "Search query too long").default(""),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const patientIdSchema = z.object({
  id: uuidSchema,
});
