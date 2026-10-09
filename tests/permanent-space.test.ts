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

test("company directory and QR profile pages require participant sessions", () => {
  const routes = [
    "app/events/[eventId]/companies/page.tsx",
    "app/events/[eventId]/companies/[companyId]/page.tsx",
    "app/events/[eventId]/meet/[personId]/page.tsx",
  ];
  for (const path of routes) {
    const source = read(path);
    assert.ok(source.includes("getCurrentParticipant(eventId)"), path);
    assert.ok(source.includes('if (!participant) redirect('), path);
    assert.ok(source.indexOf("getCurrentParticipant(eventId)") < source.indexOf("prisma."), path);
  }
});

test("public signup company lookup returns only names and industries", () => {
  const source = read("app/api/companies/search/route.ts");
  assert.ok(source.includes("name: company.name"));
  assert.ok(source.includes("industries: company.industries"));
  assert.doesNotMatch(source, /businessDescription|postalCode|showPhone|showAddress|photoUrl|person:/);
});

test("participant session rejects hidden or invalid memberships", () => {
  const source = read("lib/participant-session.ts");
  assert.ok(source.includes("session.person.isHidden"));
  assert.ok(source.includes("session.person.company.isHidden"));
  assert.ok(source.includes("session.person.eventPeople.length === 0"));
  assert.ok(source.includes("!session.event.isActive"));
});

test("guest entry offers registration and login instead of company directory", () => {
  const source = read("app/events/[eventId]/page.tsx");
  assert.ok(source.includes("企業を探す（要ログイン）"));
  assert.ok(read("app/events/[eventId]/login/page.tsx").includes("新しくプロフィールを登録する"));
});

test("long user text has global wrapping and 200 character limit", () => {
  assert.match(read("app/globals.css"), /overflow-wrap: anywhere/);
  assert.match(read("lib/profile-validation.ts"), /MAX_PROFILE_TEXT_LENGTH = 200/);
});

test("original admin dashboard layout and management actions remain intact", () => {
  const source = read("app/admin/page.tsx");
  assert.ok(source.includes("管理者ポータル"));
  assert.ok(source.includes("DASHBOARD"));
  assert.ok(source.includes("stats.map"));
  assert.ok(source.includes("企業管理"));
  assert.ok(source.includes("担当者管理"));
  assert.ok(source.includes("events.map"));
  assert.ok(source.includes("会場QR"));
  assert.ok(source.includes("企業CSV"));
  assert.ok(source.includes("参加者CSV"));
  assert.ok(source.includes("AdminEventActions"));
  assert.doesNotMatch(source, /イベント作成|参加者移行|\/admin\/events\/new/);

  const actions = read("components/admin-event-actions.tsx");
  assert.ok(actions.includes("togglePublish"));
  assert.doesNotMatch(actions, /async function remove|onClick=\{remove\}|method: "DELETE"/);
});
