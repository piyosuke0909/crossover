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

test("admin dashboard keeps essential management and hides event/community section", () => {
  const source = read("app/admin/page.tsx");
  assert.ok(source.includes("管理者ポータル"));
  assert.ok(source.includes("DASHBOARD"));
  assert.ok(source.includes("stats.map"));
  assert.ok(source.includes("企業管理"));
  assert.ok(source.includes("担当者管理"));
  assert.ok(source.includes("会場QR"));
  assert.ok(source.includes("企業CSV"));
  assert.ok(source.includes("参加者CSV"));
  assert.doesNotMatch(source, /イベント作成|参加者移行|\/admin\/events\/new|COMMUNITY|交流スペース|events\.map/);
  assert.ok(source.includes("getPrimaryEvent"));
  assert.ok(source.includes("今日も、つながりを育てよう"));

});

test("photo upload is retired and no face photo is required for registration", () => {
  const registration = read("components/profile-register-form.tsx");
  const editor = read("components/profile-edit-form.tsx");
  const validation = read("lib/profile-validation.ts");
  assert.doesNotMatch(registration, /@vercel\/blob|type="file"|顔写真|photoUrl|setPhoto/);
  assert.doesNotMatch(editor, /@vercel\/blob|type="file"|顔写真|photoUrl|setPhoto/);
  assert.doesNotMatch(validation, /顔写真は必須|requirePhoto|photoUrl/);
  assert.match(read("app/api/blob/upload/route.ts"), /status: 410/);
  assert.match(read("app/api/events/[eventId]/register/route.ts"), /photoUrl: ""/);
});

test("all person pages use text avatars instead of persisted photos", () => {
  const pages = [
    "app/events/[eventId]/page.tsx",
    "app/events/[eventId]/companies/page.tsx",
    "app/events/[eventId]/companies/[companyId]/page.tsx",
    "app/events/[eventId]/me/page.tsx",
    "app/events/[eventId]/met/page.tsx",
    "app/events/[eventId]/meet/[personId]/page.tsx",
    "app/admin/people/page.tsx",
    "components/public-profile-preview.tsx",
  ];
  for (const path of pages) {
    const source = read(path);
    assert.match(source, /PersonAvatar/, path);
    assert.doesNotMatch(source, /src=\{(?:person|metPerson|participant\.person)\.photoUrl\}/, path);
  }
});

test("admin pages share blue and yellow home styling while keeping operations", () => {
  const dashboard = read("app/admin/page.tsx");
  const companies = read("app/admin/companies/page.tsx");
  const people = read("app/admin/people/page.tsx");
  assert.match(dashboard, /bg-\[#4db7e5\]/);
  assert.match(dashboard, /bg-\[#fff0a8\]/);
  assert.match(dashboard, /企業CSV/);
  assert.match(dashboard, /参加者CSV/);
  assert.doesNotMatch(dashboard, /常設の交流ページ|交流スペース|COMMUNITY/);
  assert.match(companies, /from-\[#4db7e5\]/);
  assert.match(people, /from-\[#4db7e5\]/);
});
