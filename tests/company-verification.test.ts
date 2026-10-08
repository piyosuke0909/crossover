import assert from "node:assert/strict";
import test from "node:test";
import { validateRegistrationBody } from "../lib/profile-validation";

const person = {
  name: "山田太郎",
  photoUrl: "https://example.com/face.png",
  email: "test@example.com",
};

test("existing company registration succeeds without a participation code", () => {
  const result = validateRegistrationBody({ companyId: "company-1", person });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.mode, "existing");
  if (result.data.mode !== "existing") return;
  assert.equal(result.data.companyAccessCode, "");
});

test("company participation code is preserved for verification when supplied", () => {
  const result = validateRegistrationBody({
    companyId: "company-1",
    companyAccessCode: "  ABCD1234  ",
    person,
  });
  assert.equal(result.ok, true);
  if (!result.ok || result.data.mode !== "existing") return;
  assert.equal(result.data.companyAccessCode, "ABCD1234");
});

test("an existing-company registration cannot omit company selection", () => {
  const result = validateRegistrationBody({ person });
  assert.equal(result.ok, false);
});
