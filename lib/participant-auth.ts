import { createHmac, randomBytes, randomInt } from "node:crypto";

function authSecret() {
  const secret = process.env.PARTICIPANT_AUTH_SECRET;
  if (!secret) {
    throw new Error("PARTICIPANT_AUTH_SECRET is not configured");
  }
  return secret;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function newOtpCode() {
  return String(randomInt(100000, 1000000));
}

export function hashOtpCode(code: string) {
  return createHmac("sha256", authSecret())
    .update(`otp:${code.trim()}`)
    .digest("hex");
}

export function newReloginCode() {
  const token = randomBytes(9)
    .toString("base64url")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .padEnd(12, "X")
    .slice(0, 12);

  return `CR-${token.slice(0, 4)}-${token.slice(4, 8)}-${token.slice(8, 12)}`;
}

export function hashReloginCode(code: string) {
  return createHmac("sha256", authSecret())
    .update(`relogin:${code.trim().toUpperCase()}`)
    .digest("hex");
}

export function otpExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000);
}
