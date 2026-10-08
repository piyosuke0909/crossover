import assert from "node:assert/strict";
import test from "node:test";
import {
  BUSINESS_CARD_SCAN_MAX_AGE,
  createScanUsedCookie,
  isScanUsedCookie,
} from "../lib/business-card-usage";

const SECRET = "test-secret-for-signing";

test("scan counts only with valid successful-scan cookie", () => {
  assert.equal(isScanUsedCookie(undefined, SECRET), false);
  const token = createScanUsedCookie(SECRET, 1_000_000);
  assert.equal(isScanUsedCookie(token, SECRET, 1_000_000), true);
});

test("tampered or incorrectly signed cookies cannot block a scan", () => {
  const token = createScanUsedCookie(SECRET, 1_000_000);
  assert.equal(isScanUsedCookie(token, "different-secret", 1_000_000), false);
  assert.equal(isScanUsedCookie(token.replace("v1.", "v2."), SECRET, 1_000_000), false);
  assert.equal(isScanUsedCookie(token + "extra", SECRET, 1_000_000), false);
});

test("scan success marker expires after one year", () => {
  const token = createScanUsedCookie(SECRET, 1_000_000);
  assert.equal(
    isScanUsedCookie(token, SECRET, 1_000_000 + BUSINESS_CARD_SCAN_MAX_AGE * 1000 + 1),
    false,
  );
});
