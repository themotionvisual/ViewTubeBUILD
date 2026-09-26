import test from "node:test";
import assert from "node:assert/strict";

import {
  projectHeraldThreadClaim,
  projectHeraldLedgerReceipt,
  projectHeraldWorkState,
} from "./ai-systems-herald-projection.mjs";

const MAIN_SHA = "fbaaff8de14c5948959251b0552519685c24c83e";

test("projects an active Herald thread into an AI Systems claim without inventing task status", () => {
  const thread = {
    threadId: "brain-evidence-anomalies-2026-09-22",
    tier: "T2",
    status: "implemented-awaiting-verification",
    currentOwners: ["analytics-canon", "Brain Runtime / Algorithm Intelligence"],
    nextAction: "Run verification and request review",
  };

  const claim = projectHeraldThreadClaim(thread, {
    observedMainSha: MAIN_SHA,
    sourcePath: ".viewtube/herald/threads/brain-evidence-anomalies-2026-09-22.json",
  });

  assert.deepEqual(claim, {
    taskId: "herald:brain-evidence-anomalies-2026-09-22",
    threadId: "brain-evidence-anomalies-2026-09-22",
    status: "in_progress",
    agent: "herald",
    canonicalOwners: ["analytics-canon", "Brain Runtime / Algorithm Intelligence"],
    observedMainSha: MAIN_SHA,
    branch: null,
    sourcePath: ".viewtube/herald/threads/brain-evidence-anomalies-2026-09-22.json",
    nextCheckpoint: "Run verification and request review",
    evidenceState: "CLAIMED",
  });
});

test("projects writer-lock state as a coordination claim when explicit status is absent", () => {
  const thread = {
    threadId: "locked-thread",
    tier: "T2",
    stage: "EXECUTE",
    owner: "Brain Runtime",
    branch: "feat/example",
    writerLock: {
      owner: "agent-a",
      acquiredAt: "2026-09-24T17:00:00Z",
    },
    nextAction: "Run tests",
  };

  const claim = projectHeraldThreadClaim(thread, {
    observedMainSha: MAIN_SHA,
    sourcePath: ".viewtube/herald/threads/locked-thread.json",
  });

  assert.equal(claim.status, "claimed");
  assert.equal(claim.agent, "agent-a");
  assert.equal(claim.branch, "feat/example");
  assert.deepEqual(claim.canonicalOwners, ["Brain Runtime"]);
});

test("does not turn a completed/released Herald thread into an active claim", () => {
  for (const status of ["complete", "completed", "released", "superseded"]) {
    const claim = projectHeraldThreadClaim({
      threadId: "done-thread",
      status,
      owner: "Brain Runtime",
    }, {
      observedMainSha: MAIN_SHA,
      sourcePath: ".viewtube/herald/threads/done-thread.json",
    });

    assert.equal(claim, null);
  }
});

test("projects a verified Herald ledger entry into a completion receipt without upgrading branch work to main", () => {
  const entry = {
    ts: "2026-09-22T22:05:00-04:00",
    app: "chatgpt",
    session: "project-content-convergence-wave2-2026-09-22",
    thread: "herald-2026-09-22-project-content-convergence",
    tier: "T2",
    verb: "BUILD",
    intent: "Consolidate Video Package persistence.",
    changedPaths: [
      "src/services/video-package/VideoPackageRepository.ts",
      "src/services/video-package/VideoPackageRepository.test.ts",
    ],
    status: "partial-verified",
    proven: "PR #321 draft and mergeable. Focused tests PASS.",
    blocker: "Vercel build rate limit.",
    recon: "main@6d13836b04c3694c188346b6dd427cf6a4110e7b",
    next: "Complete PR #321 verification.",
    taskIds: [],
  };

  const receipt = projectHeraldLedgerReceipt(entry, {
    observedMainSha: MAIN_SHA,
    branch: "feat/video-package-store-v1",
    headSha: "1111111111111111111111111111111111111111",
    sourcePath: ".viewtube/herald/ledger/2026-09-22.jsonl",
  });

  assert.equal(receipt.status, "partial");
  assert.equal(receipt.evidenceState, "PROVEN");
  assert.equal(receipt.mainIntegrationState, "unknown");
  assert.deepEqual(receipt.filesChanged, entry.changedPaths);
  assert.deepEqual(receipt.blockers, ["Vercel build rate limit."]);
  assert.equal(receipt.proven, entry.proven);
});

test("does not emit a completion receipt from an in-progress ledger entry", () => {
  const receipt = projectHeraldLedgerReceipt({
    ts: "2026-09-22T21:43:00-04:00",
    app: "chatgpt",
    thread: "herald-2026-09-22-project-content-convergence",
    tier: "T2",
    verb: "BUILD",
    intent: "Begin convergence.",
    changedPaths: [],
    status: "in-progress",
    next: "Add tests.",
  }, {
    observedMainSha: MAIN_SHA,
    sourcePath: ".viewtube/herald/ledger/2026-09-22.jsonl",
  });

  assert.equal(receipt, null);
});

test("builds one read-only work projection from Herald threads and ledger entries", () => {
  const projection = projectHeraldWorkState({
    observedMainSha: MAIN_SHA,
    threads: [
      {
        sourcePath: ".viewtube/herald/threads/a.json",
        value: { threadId: "a", status: "in-progress", owner: "Brain Runtime", nextAction: "Verify" },
      },
      {
        sourcePath: ".viewtube/herald/threads/b.json",
        value: { threadId: "b", status: "complete", owner: "Prompt System" },
      },
    ],
    ledgerEntries: [
      {
        sourcePath: ".viewtube/herald/ledger/2026-09-24.jsonl",
        branch: "feat/a",
        headSha: "2222222222222222222222222222222222222222",
        value: {
          ts: "2026-09-24T17:00:00Z",
          app: "chatgpt",
          thread: "a",
          tier: "T2",
          verb: "BUILD",
          intent: "Build A",
          changedPaths: ["src/a.ts"],
          status: "verified",
          proven: "Focused test passed.",
        },
      },
    ],
  });

  assert.equal(projection.source, "herald");
  assert.equal(projection.authoritativeLedger, ".viewtube/herald");
  assert.equal(projection.claims.length, 1);
  assert.equal(projection.receipts.length, 1);
  assert.equal(projection.claims[0].threadId, "a");
  assert.equal(projection.receipts[0].threadId, "a");
});
