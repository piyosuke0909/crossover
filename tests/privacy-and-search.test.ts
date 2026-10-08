import assert from "node:assert/strict";
import test from "node:test";
import { validateRegistrationBody, validateProfileEditBody } from "../lib/profile-validation";
import { companyEventSearchConditions } from "../lib/company-event-search";

const company = {
  name: "株式会社テスト",
  industryIds: ["industry-1"],
  businessDescription: "交流会",
  phone: "058-123-4567",
  address: "岐阜県",
};
const person = {
  name: "山田太郎",
  photoUrl: "https://example.com/face.png",
  phone: "090-1234-5678",
};

test("public contact fields default to private", () => {
  const result = validateRegistrationBody({ company, person });
  assert.equal(result.ok, true);
  if (!result.ok || result.data.mode !== "new") return;
  assert.equal(result.data.company.showPhone, false);
  assert.equal(result.data.company.showAddress, false);
  assert.equal(result.data.person.showPhone, false);
});

test("public contact visibility is opt in only", () => {
  const result = validateProfileEditBody({
    company: { ...company, showPhone: true, showAddress: true },
    person: { ...person, showPhone: true },
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.company.showPhone, true);
  assert.equal(result.data.company.showAddress, true);
  assert.equal(result.data.person.showPhone, true);
});

test("person-name search must be restricted to active event", () => {
  const query = companyEventSearchConditions("山田", "event-now");
  const memberQuery = query.OR[3];
  assert.deepEqual(memberQuery, {
    people: {
      some: {
        isHidden: false,
        name: { contains: "山田", mode: "insensitive" },
        eventPeople: { some: { eventId: "event-now" } },
      },
    },
  });
});
