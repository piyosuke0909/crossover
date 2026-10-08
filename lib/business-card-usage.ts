import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const BUSINESS_CARD_SCAN_COOKIE = "crossover_card_scan_used";
export const BUSINESS_CARD_SCAN_MAX_AGE = 60 * 60 * 24 * 365;

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createScanUsedCookie(secret: string, now = Date.now()) {
  const payload = `v1.${now}.${randomBytes(18).toString("base64url")}`;
  return `${payload}.${signature(payload, secret)}`;
}

export function isScanUsedCookie(
  cookie: string | undefined,
  secret: string,
  now = Date.now(),
) {
  if (!cookie || !secret) return false;

  const parts = cookie.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const issuedAt = Number(parts[1]);
  if (!Number.isSafeInteger(issuedAt)) return false;
  if (issuedAt > now || now - issuedAt > BUSINESS_CARD_SCAN_MAX_AGE * 1000) {
    return false;
  }

  const actual = Buffer.from(parts[3], "base64url");
  const expected = Buffer.from(signature(parts.slice(0, 3).join("."), secret), "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
