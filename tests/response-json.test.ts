import assert from "node:assert/strict";
import test from "node:test";
import { readApiJson } from "../lib/response-json";

test("shows human-friendly error for empty 500 response", async () => {
  const response = new Response(null, { status: 500 });
  await assert.rejects(
    readApiJson(response, "登録に失敗しました"),
    /登録に失敗しました（HTTP 500）/,
  );
});

test("shows API provided JSON error", async () => {
  const response = Response.json(
    { error: "データベースの更新が必要です。" },
    { status: 503 },
  );
  await assert.rejects(
    readApiJson(response, "登録に失敗しました"),
    /データベースの更新が必要です/,
  );
});

test("parses successful JSON response", async () => {
  const response = Response.json({ personId: "abc123" }, { status: 201 });
  const data = await readApiJson<{ personId: string }>(response, "登録失敗");
  assert.equal(data.personId, "abc123");
});
