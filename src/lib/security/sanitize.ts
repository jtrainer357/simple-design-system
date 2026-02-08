/**
 * Input Sanitization Utilities
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;", "`": "&#x60;", "=": "&#x3D;",
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

export function stripSqlPatterns(str: string): string {
  const patterns = [/;\s*--/gi, /;\s*\/\*/gi, /'\s*OR\s*'1'\s*=\s*'1/gi, /UNION\s+SELECT/gi, /DROP\s+(TABLE|DATABASE)/gi];
  let result = str;
  for (const pattern of patterns) result = result.replace(pattern, "");
  return result;
}

export function stripScripts(str: string): string {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/on\w+\s*=\s*["'][^"']*["']/gi, "").replace(/javascript:/gi, "");
}

export function sanitizeText(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== "string") return "";
  let result = input.trim().slice(0, maxLength);
  result = escapeHtml(result);
  result = stripSqlPatterns(result);
  return result;
}

export function sanitizeRichText(input: string, maxLength: number = 50000): string {
  if (!input || typeof input !== "string") return "";
  let result = input.trim().slice(0, maxLength);
  result = stripScripts(result);
  result = stripSqlPatterns(result);
  return result;
}

export function sanitizeSearchQuery(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== "string") return "";
  let result = input.trim().slice(0, maxLength);
  result = escapeHtml(result);
  result = stripSqlPatterns(result);
  result = result.replace(/[*?[\]{}()\\^$|]/g, "");
  return result;
}

export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== "string") return "";
  const result = input.trim().toLowerCase().slice(0, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) ? result : "";
}

export function sanitizePhone(input: string): string {
  if (!input || typeof input !== "string") return "";
  let result = input.trim();
  const hasPlus = result.startsWith("+");
  result = result.replace(/\D/g, "");
  if (hasPlus) result = "+" + result;
  return result.slice(0, 20);
}

export function sanitizeUUID(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  const cleaned = input.trim().toLowerCase();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleaned) ? cleaned : null;
}

export function smartSanitize(input: unknown, fieldType: "text" | "richText" | "search" | "email" | "phone" | "uuid" = "text"): string | null {
  if (input === null || input === undefined) return "";
  if (typeof input !== "string") return String(input);
  switch (fieldType) {
    case "richText": return sanitizeRichText(input);
    case "search": return sanitizeSearchQuery(input);
    case "email": return sanitizeEmail(input);
    case "phone": return sanitizePhone(input);
    case "uuid": return sanitizeUUID(input);
    default: return sanitizeText(input);
  }
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T, fieldTypes?: Partial<Record<keyof T, "text" | "richText" | "search" | "email" | "phone" | "uuid">>): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === "string") {
      const fieldType = fieldTypes?.[key] || "text";
      result[key] = smartSanitize(result[key], fieldType) as T[Extract<keyof T, string>];
    }
  }
  return result;
}

export function withSanitization<T extends Record<string, unknown>>(handler: (sanitizedBody: T) => Promise<Response>, fieldTypes?: Partial<Record<keyof T, "text" | "richText" | "search" | "email" | "phone" | "uuid">>) {
  return async (body: T): Promise<Response> => handler(sanitizeObject(body, fieldTypes));
}
