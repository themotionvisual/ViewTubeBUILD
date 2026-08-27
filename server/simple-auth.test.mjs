import test from "node:test";
import assert from "node:assert/strict";
import { buildSimpleSession, sanitizeReturnTo } from "./simple-auth.mjs";

test("sanitizeReturnTo accepts internal routes and rejects external URLs", () => {
  assert.equal(sanitizeReturnTo("/studio?x=1#comments"), "/studio?x=1#comments");
  assert.equal(sanitizeReturnTo("https://evil.example/path"), "/");
  assert.equal(sanitizeReturnTo("//evil.example"), "/");
});

test("buildSimpleSession returns signed_out without a session user", async () => {
  const result = await buildSimpleSession(null);
  assert.equal(result.status, "signed_out");
  assert.equal(result.user, null);
  assert.equal(result.capabilities.youtubeRead, false);
});
