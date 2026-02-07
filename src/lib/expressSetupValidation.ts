// Validation schemas and functions for Express Setup flow

export interface PracticeInfoData {
  practiceName: string;
  specialty: string;
  providerCount: string;
  zipCode: string;
}

export interface AccountData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface PaymentData {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  billingZip: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

/**
 * Check if password meets all requirements
 */
export function validatePassword(password: string): {
  isValid: boolean;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
} {
  const checks = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValid = Object.values(checks).every(Boolean);

  return { isValid, checks };
}

/**
 * Get password strength level
 */
export function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  const { checks } = validatePassword(password);
  const passedChecks = Object.values(checks).filter(Boolean).length;

  if (passedChecks <= 1) return "weak";
  if (passedChecks <= 3) return "medium";
  return "strong";
}

/**
 * Validate Step 2: Practice Information
 */
export function validatePracticeInfo(data: PracticeInfoData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.practiceName.trim()) {
    errors.push({ field: "practiceName", message: "Practice name is required" });
  }

  if (!data.specialty) {
    errors.push({ field: "specialty", message: "Please select a specialty" });
  }

  if (!data.providerCount) {
    errors.push({ field: "providerCount", message: "Please select number of providers" });
  }

  if (!data.zipCode.trim()) {
    errors.push({ field: "zipCode", message: "ZIP code is required" });
  } else if (!/^\d{5}$/.test(data.zipCode)) {
    errors.push({ field: "zipCode", message: "Please enter a valid 5-digit ZIP code" });
  }

  return errors;
}

/**
 * Validate Step 3: Account Setup
 */
export function validateAccountInfo(data: AccountData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.fullName.trim()) {
    errors.push({ field: "fullName", message: "Full name is required" });
  }

  if (!data.email.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" });
  }

  if (!data.phone.trim()) {
    errors.push({ field: "phone", message: "Phone number is required" });
  } else {
    const phoneDigits = data.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      errors.push({ field: "phone", message: "Please enter a valid 10-digit phone number" });
    }
  }

  const { isValid: passwordValid } = validatePassword(data.password);
  if (!data.password) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (!passwordValid) {
    errors.push({ field: "password", message: "Password does not meet requirements" });
  }

  if (data.password !== data.confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Passwords do not match" });
  }

  return errors;
}

/**
 * Validate Step 4: Payment Information
 */
export function validatePaymentInfo(data: PaymentData): ValidationError[] {
  const errors: ValidationError[] = [];

  const cardDigits = data.cardNumber.replace(/\D/g, "");
  if (!cardDigits) {
    errors.push({ field: "cardNumber", message: "Card number is required" });
  } else if (cardDigits.length !== 16) {
    errors.push({ field: "cardNumber", message: "Please enter a valid 16-digit card number" });
  }

  if (!data.expirationDate) {
    errors.push({ field: "expirationDate", message: "Expiration date is required" });
  } else {
    const parts = data.expirationDate.split("/");
    const month = parts[0] ?? "";
    const year = parts[1] ?? "";
    const monthNum = parseInt(month, 10);
    if (!month || !year || monthNum < 1 || monthNum > 12) {
      errors.push({
        field: "expirationDate",
        message: "Please enter a valid expiration date (MM/YY)",
      });
    }
  }

  const cvvDigits = data.cvv.replace(/\D/g, "");
  if (!cvvDigits) {
    errors.push({ field: "cvv", message: "CVV is required" });
  } else if (cvvDigits.length < 3 || cvvDigits.length > 4) {
    errors.push({ field: "cvv", message: "Please enter a valid CVV" });
  }

  if (!data.billingZip.trim()) {
    errors.push({ field: "billingZip", message: "Billing ZIP code is required" });
  } else if (!/^\d{5}$/.test(data.billingZip)) {
    errors.push({ field: "billingZip", message: "Please enter a valid 5-digit ZIP code" });
  }

  return errors;
}

/**
 * Check if a specific field has an error
 */
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

/**
 * Sanitize input - remove potentially harmful characters
 */
export function sanitizeInput(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}
