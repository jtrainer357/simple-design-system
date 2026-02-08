/**
 * TOTP (Time-based One-Time Password) Implementation
 * RFC 6238 compliant using the otpauth library.
 */

import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import crypto from "crypto";
import type { TOTPSecret, BackupCodeVerificationResult } from "./types";
import { MFA_CONFIG } from "./types";

export function generateTOTPSecret(email: string): TOTPSecret {
  const totp = new OTPAuth.TOTP({
    issuer: MFA_CONFIG.ISSUER,
    label: email,
    algorithm: MFA_CONFIG.TOTP_ALGORITHM,
    digits: MFA_CONFIG.TOTP_DIGITS,
    period: MFA_CONFIG.TOTP_PERIOD,
    secret: new OTPAuth.Secret({ size: 20 }),
  });

  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  };
}

export async function generateQRCode(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    type: "image/png",
    width: 256,
    margin: 2,
  });
}

export function verifyTOTPCode(secret: string, code: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: MFA_CONFIG.ISSUER,
      label: "user",
      algorithm: MFA_CONFIG.TOTP_ALGORITHM,
      digits: MFA_CONFIG.TOTP_DIGITS,
      period: MFA_CONFIG.TOTP_PERIOD,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const cleanCode = code.replace(/\s/g, "");
    const delta = totp.validate({ token: cleanCode, window: 1 });
    return delta !== null;
  } catch (error) {
    console.error("[TOTP] Verification error:", error);
    return false;
  }
}

export function generateBackupCodes(count: number = MFA_CONFIG.BACKUP_CODE_COUNT): string[] {
  const codes: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let i = 0; i < count; i++) {
    let code = "";
    for (let j = 0; j < MFA_CONFIG.BACKUP_CODE_LENGTH; j++) {
      code += chars[crypto.randomInt(chars.length)];
    }
    codes.push(code);
  }

  return codes;
}

export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return codes.map((code) =>
    crypto.createHash("sha256").update(code.toUpperCase()).digest("hex")
  );
}

export async function verifyBackupCode(
  storedHashes: string[],
  code: string
): Promise<BackupCodeVerificationResult> {
  const normalizedCode = code.toUpperCase().replace(/\s/g, "");
  const hash = crypto.createHash("sha256").update(normalizedCode).digest("hex");

  const index = storedHashes.indexOf(hash);
  if (index === -1) {
    return { valid: false, remaining: storedHashes };
  }

  const remaining = [...storedHashes];
  remaining.splice(index, 1);
  return { valid: true, remaining };
}

export function formatBackupCodes(codes: string[]): string[] {
  return codes.map((code) => `${code.slice(0, 4)}-${code.slice(4)}`);
}

export function parseBackupCode(formattedCode: string): string {
  return formattedCode.replace(/-/g, "").toUpperCase();
}
