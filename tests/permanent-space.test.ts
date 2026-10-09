import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf-8");

test("Gemini business-card scan is not in the registration page or routes", () => {
  assert.equal(existsSync("app/api/business-card/scan/route.ts"), false);
  assert.doesNotMatch(read("components/profile-register-form.tsx"), /scanBusinessCard|businessCardScanEnabled|名刺から入力/);
  assert.doesNotMatch(read("app/events/[eventId]/register/page.tsx"), /GEMINI_API_KEY|businessCardScanUsed/);
});

test("permanent event rejects create, transfer and delete endpoints", () => {
  assert.match(read("app/api/admin/events/route.ts"), /status: 405/);
  assert.match(read("app/api/admin/events/[eventId]/transfer/route.ts"), /status: 410/);
  assert.match(read("app/api/admin/events/[eventId]/route.ts"), /常設の交流ページは削除できません/);
});

test("guest company search page does not require an account", () => {
  const s = read("app/events/[eventId]/companies/page.tsx");
  assert.match(s, /登録・ログインなし/);
  assert.doesNotMatch(s, /redirect\(\`\/events\/\$\{eventId\}\/login/);
});

test("long user text has global wrapping and 200 character limit", () => {
  assert.match(read("app/globals.css"), /overflow-wrap: anywhere/);
  assert.match(read("lib/profile-validation.ts"), /MAX_PROFILE_TEXT_LENGTH = 200/);
});
