import test from "node:test";
import assert from "node:assert/strict";

import {
  validateAuthorityRecord,
  findAuthorityConflicts,
  findMissingSourceRefs,
  findStaleClaims,
} from "./ai-systems-governance.mjs";

const baseRecord = (overrides = {}) => ({
  id: "vt-ai-system:test",
  schemaVersion: "vt-ai-authority-record-v1",
  recordVersion: 1,
  kind: "system",
  title: "Test System",
  summary: "Test summary",
  lifecycle: "canonical",
  ownership: {
    canonicalOwner: "owner-a",
    concern: "test concern",
    codeOwner: null,
    documentationOwner: null,
  },
  audit: {
    createdAt: "2026-09-24T18:00:00-04:00",
    updatedAt: "2026-09-24T18:00:00-04:00",
    lastAuditedAt: "2026-09-24T18:00:00-04:00",
    lastAuditedMainSha: "fbaaff8de14c5948959251b0552519685c24c83e",
    changedBy: "test",
    changeEventId: null,
    recordHash: null,
  },
  sourceRefs: {
    code: ["src/services/example.ts"],
    docs: ["docs/example.md"],
    prs: [],
    commits: [],
    tests: [],
    ci: [],
  },
  relations: {
    dependsOn: [],
    provides: [],
    supersedes: [],
    supersededBy: [],
    overlapsWith: [],
    donorSources: [],
  },
  integration: {
    prMerged: true,
    prBase: "main",
    mergedCommit: null,
    currentMainState: "present",
    verifiedMainSha: "fbaaff8de14c5948959251b0552519685c24c83e",
    verificationRefs: [],
  },
  promptRefs: [],
  evidenceRefs: [],
  traceRefs: [],
  artifactRefs: [],
  roadmap: null,
  managedActionRefs: [],
  tags: [],
  ...overrides,
});

test("validateAuthorityRecord accepts a minimally valid authority record", () => {
  const result = validateAuthorityRecord(baseRecord());
  assert.deepEqual(result, []);
});

test("validateAuthorityRecord rejects missing owner and malformed audited-main SHA", () => {
  const record = baseRecord({
    ownership: { canonicalOwner: "", concern: "test concern" },
    audit: {
      ...baseRecord().audit,
      lastAuditedMainSha: "not-a-sha",
    },
  });

  const result = validateAuthorityRecord(record);

  assert.ok(result.some((issue) => issue.code === "missing_canonical_owner"));
  assert.ok(result.some((issue) => issue.code === "invalid_audited_main_sha"));
});

test("findAuthorityConflicts flags two current canonical owners for one concern", () => {
  const records = [
    baseRecord({ id: "one" }),
    baseRecord({
      id: "two",
      ownership: {
        ...baseRecord().ownership,
        canonicalOwner: "owner-b",
      },
    }),
  ];

  const conflicts = findAuthorityConflicts(records);

  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].concern, "test concern");
  assert.deepEqual(new Set(conflicts[0].owners), new Set(["owner-a", "owner-b"]));
});

test("findAuthorityConflicts ignores historical records", () => {
  const records = [
    baseRecord({ id: "one" }),
    baseRecord({
      id: "two",
      lifecycle: "historical",
      ownership: {
        ...baseRecord().ownership,
        canonicalOwner: "former-owner",
      },
    }),
  ];

  assert.deepEqual(findAuthorityConflicts(records), []);
});

test("findMissingSourceRefs reports only paths the repository does not contain", () => {
  const record = baseRecord();
  const existing = new Set(["src/services/example.ts"]);
  const issues = findMissingSourceRefs([record], (path) => existing.has(path));

  assert.deepEqual(issues.map((issue) => issue.path), ["docs/example.md"]);
});

test("findStaleClaims reports active old claims but not completed or released work", () => {
  const now = Date.parse("2026-09-24T18:00:00Z");
  const day = 24 * 60 * 60 * 1000;
  const claims = [
    { taskId: "active-old", status: "claimed", startedAt: "2026-09-22T17:00:00Z" },
    { taskId: "active-new", status: "in_progress", startedAt: "2026-09-24T17:30:00Z" },
    { taskId: "done-old", status: "completed", startedAt: "2026-09-20T12:00:00Z" },
    { taskId: "released-old", status: "released", startedAt: "2026-09-20T12:00:00Z" },
  ];

  const stale = findStaleClaims(claims, { now, maxAgeMs: day });

  assert.deepEqual(stale.map((claim) => claim.taskId), ["active-old"]);
});
