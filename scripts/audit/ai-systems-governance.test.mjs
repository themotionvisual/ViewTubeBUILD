import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  validateAuthorityRecord,
  findAuthorityConflicts,
  findMissingSourceRefs,
  findStaleClaims,
  findClaimCollisions,
  findMissingCompletionReceipts,
  auditAiSystemsGovernance,
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


test("auditAiSystemsGovernance audits every configured registry and counts all records", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "vt-ai-governance-"));
  fs.mkdirSync(path.join(rootDir, "governance/ai-systems/registry"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "src/services"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "docs"), { recursive: true });
  fs.writeFileSync(path.join(rootDir, "src/services/example.ts"), "export {}\n");
  fs.writeFileSync(path.join(rootDir, "docs/example.md"), "# Example\n");

  const one = baseRecord({ id: "one", ownership: { canonicalOwner: "owner-a", concern: "concern-a" } });
  const two = baseRecord({ id: "two", ownership: { canonicalOwner: "owner-b", concern: "concern-b" } });

  fs.writeFileSync(
    path.join(rootDir, "governance/ai-systems/registry/systems.json"),
    JSON.stringify({ records: [one] }),
  );
  fs.writeFileSync(
    path.join(rootDir, "governance/ai-systems/registry/plans.json"),
    JSON.stringify({ records: [two] }),
  );

  const result = auditAiSystemsGovernance({
    rootDir,
    registryPaths: [
      "governance/ai-systems/registry/systems.json",
      "governance/ai-systems/registry/plans.json",
    ],
    claims: [],
  });

  assert.equal(result.ok, true);
  assert.equal(result.registryCount, 2);
  assert.equal(result.recordCount, 2);
});

test("auditAiSystemsGovernance reads Herald thread claims and flags stale active work", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "vt-ai-herald-"));
  fs.mkdirSync(path.join(rootDir, "governance/ai-systems/registry"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, ".viewtube/herald/threads"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "src/services"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "docs"), { recursive: true });
  fs.writeFileSync(path.join(rootDir, "src/services/example.ts"), "export {}\n");
  fs.writeFileSync(path.join(rootDir, "docs/example.md"), "# Example\n");

  fs.writeFileSync(
    path.join(rootDir, "governance/ai-systems/registry/systems.json"),
    JSON.stringify({ records: [baseRecord()] }),
  );
  fs.writeFileSync(
    path.join(rootDir, ".viewtube/herald/threads/stale.json"),
    JSON.stringify({
      threadId: "stale",
      owner: "Brain Runtime",
      writerLock: { owner: "agent-a", acquiredAt: "2026-09-22T12:00:00Z" },
      nextAction: "Resume work",
    }),
  );

  const result = auditAiSystemsGovernance({
    rootDir,
    registryPaths: ["governance/ai-systems/registry/systems.json"],
    observedMainSha: "fbaaff8de14c5948959251b0552519685c24c83e",
    now: Date.parse("2026-09-24T18:00:00Z"),
    maxClaimAgeMs: 24 * 60 * 60 * 1000,
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.staleClaims.map((claim) => claim.taskId), ["herald:stale"]);
  assert.equal(result.claimCount, 1);
});


test("findClaimCollisions detects overlapping writer paths held by different agents", () => {
  const collisions = findClaimCollisions([
    {
      taskId: "a",
      threadId: "a",
      status: "in_progress",
      agent: "agent-a",
      writerPaths: ["src/services/brain/**"],
    },
    {
      taskId: "b",
      threadId: "b",
      status: "claimed",
      agent: "agent-b",
      writerPaths: ["src/services/brain/BrainRuntime.ts"],
    },
  ]);

  assert.equal(collisions.length, 1);
  assert.equal(collisions[0].pathA, "src/services/brain/**");
  assert.equal(collisions[0].pathB, "src/services/brain/BrainRuntime.ts");
});

test("findClaimCollisions ignores overlapping paths owned by the same agent", () => {
  const collisions = findClaimCollisions([
    { taskId: "a", threadId: "a", status: "in_progress", agent: "same", writerPaths: ["src/services/brain/**"] },
    { taskId: "b", threadId: "b", status: "claimed", agent: "same", writerPaths: ["src/services/brain/BrainRuntime.ts"] },
  ]);
  assert.deepEqual(collisions, []);
});

test("findMissingCompletionReceipts requires a receipt for terminal Herald threads", () => {
  const missing = findMissingCompletionReceipts(
    [
      { threadId: "done-a", status: "completed", sourcePath: ".viewtube/herald/threads/done-a.json" },
      { threadId: "done-b", status: "released", sourcePath: ".viewtube/herald/threads/done-b.json" },
      { threadId: "active", status: "in-progress", sourcePath: ".viewtube/herald/threads/active.json" },
    ],
    [
      { threadId: "done-b", status: "completed", evidenceState: "PROVEN" },
    ],
  );

  assert.deepEqual(missing.map((item) => item.threadId), ["done-a"]);
});

test("auditAiSystemsGovernance reports claim collisions and missing completion receipts", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "vt-ai-collision-"));
  fs.mkdirSync(path.join(rootDir, "governance/ai-systems/registry"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, ".viewtube/herald/threads"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, ".viewtube/herald/ledger"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "src/services"), { recursive: true });
  fs.mkdirSync(path.join(rootDir, "docs"), { recursive: true });
  fs.writeFileSync(path.join(rootDir, "src/services/example.ts"), "export {}\n");
  fs.writeFileSync(path.join(rootDir, "docs/example.md"), "# Example\n");
  fs.writeFileSync(
    path.join(rootDir, "governance/ai-systems/registry/systems.json"),
    JSON.stringify({ records: [baseRecord()] }),
  );

  fs.writeFileSync(path.join(rootDir, ".viewtube/herald/threads/a.json"), JSON.stringify({
    threadId: "a",
    status: "in-progress",
    writerLock: { holder: "agent-a", acquired: "2026-09-24T16:00:00Z", paths: ["src/services/brain/**"] },
  }));
  fs.writeFileSync(path.join(rootDir, ".viewtube/herald/threads/b.json"), JSON.stringify({
    threadId: "b",
    status: "in-progress",
    writerLock: { holder: "agent-b", acquired: "2026-09-24T16:10:00Z", paths: ["src/services/brain/BrainRuntime.ts"] },
  }));
  fs.writeFileSync(path.join(rootDir, ".viewtube/herald/threads/done.json"), JSON.stringify({
    threadId: "done",
    status: "completed",
  }));
  fs.writeFileSync(
    path.join(rootDir, ".viewtube/herald/ledger/2026-09-24.jsonl"),
    JSON.stringify({ ts: "2026-09-24T16:30:00Z", thread: "a", status: "in-progress" }) + "\n",
  );

  const result = auditAiSystemsGovernance({
    rootDir,
    registryPaths: ["governance/ai-systems/registry/systems.json"],
    observedMainSha: "fbaaff8de14c5948959251b0552519685c24c83e",
    now: Date.parse("2026-09-24T18:00:00Z"),
  });

  assert.equal(result.ok, false);
  assert.equal(result.claimCollisions.length, 1);
  assert.deepEqual(result.missingCompletionReceipts.map((item) => item.threadId), ["done"]);
});
