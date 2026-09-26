const TERMINAL_THREAD_STATES = new Set([
  "complete",
  "completed",
  "released",
  "superseded",
  "retired",
]);

const ACTIVE_THREAD_STATES = new Set([
  "claimed",
  "started",
  "in-progress",
  "in_progress",
  "implemented-awaiting-verification",
  "partial",
  "partial-verified",
  "blocked",
]);

const VERIFIED_LEDGER_STATES = new Set([
  "verified",
  "complete",
  "completed",
  "partial-verified",
  "certified",
]);

const asArray = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

const normalizeThreadStatus = (thread) => {
  const raw = String(thread?.status || "").trim().toLowerCase();
  if (TERMINAL_THREAD_STATES.has(raw)) return null;
  if (raw === "blocked") return "blocked";
  if (raw === "claimed" || raw === "started") return "claimed";
  if (ACTIVE_THREAD_STATES.has(raw)) return "in_progress";
  if (thread?.writerLock) return "claimed";
  const stage = String(thread?.stage || "").trim().toUpperCase();
  if (["ACT", "EXECUTE", "VERIFY", "RECORD"].includes(stage)) return "in_progress";
  return null;
};

const ownersFor = (thread) => {
  for (const value of [thread?.currentOwners, thread?.canonicalOwners, thread?.owners]) {
    if (Array.isArray(value) && value.length) return value.filter(Boolean);
  }
  return thread?.owner ? [thread.owner] : [];
};

const writerLockInfo = (writerLock) => {
  if (!writerLock) return { agent: null, startedAt: null, paths: [] };
  if (typeof writerLock === "string") {
    return { agent: null, startedAt: null, paths: [writerLock] };
  }
  return {
    agent: writerLock.owner || writerLock.holder || writerLock.agent || null,
    startedAt: writerLock.acquiredAt || writerLock.acquired || writerLock.startedAt || null,
    paths: Array.isArray(writerLock.paths) ? writerLock.paths.filter(Boolean) : [],
  };
};

export const projectHeraldThreadClaim = (thread, context) => {
  if (!thread?.threadId) return null;
  const status = normalizeThreadStatus(thread);
  if (!status) return null;

  const lock = writerLockInfo(thread.writerLock);
  const claim = {
    taskId: `herald:${thread.threadId}`,
    threadId: thread.threadId,
    status,
    agent: lock.agent || thread.lastApp || "herald",
    canonicalOwners: ownersFor(thread),
    observedMainSha: context?.observedMainSha || null,
    branch: thread.branch || null,
    sourcePath: context?.sourcePath || null,
    nextCheckpoint: thread.nextAction || null,
    startedAt: lock.startedAt,
    evidenceState: "CLAIMED",
  };
  if (lock.paths.length) claim.writerPaths = lock.paths;
  return claim;
};

const normalizeReceiptStatus = (status) => {
  const raw = String(status || "").trim().toLowerCase();
  if (raw === "partial-verified") return "partial";
  if (["verified", "complete", "completed", "certified"].includes(raw)) return "completed";
  return null;
};

const blockersFor = (entry) => {
  if (Array.isArray(entry?.blockers)) return entry.blockers.filter(Boolean);
  if (entry?.blocker) return [entry.blocker];
  return [];
};

export const projectHeraldLedgerReceipt = (entry, context = {}) => {
  const receiptStatus = normalizeReceiptStatus(entry?.status);
  if (!receiptStatus || !VERIFIED_LEDGER_STATES.has(String(entry?.status || "").toLowerCase())) {
    return null;
  }

  const threadId = entry.thread || entry.threadId || context.threadId || null;
  const evidenceState = entry.proven ? "PROVEN" : "CLAIMED";

  return {
    taskId: threadId ? `herald:${threadId}` : null,
    threadId,
    status: receiptStatus,
    evidenceState,
    mainIntegrationState: "unknown",
    agent: entry.app || "herald",
    session: entry.session || null,
    tier: entry.tier || null,
    verb: entry.verb || null,
    intent: entry.intent || entry.result || null,
    observedMainSha: context.observedMainSha || null,
    branch: context.branch || null,
    headSha: context.headSha || null,
    sourcePath: context.sourcePath || null,
    filesChanged: asArray(entry.changedPaths).filter(Boolean),
    blockers: blockersFor(entry),
    proven: entry.proven || null,
    claimed: entry.claimed || null,
    unknown: entry.unknown || null,
    nextAction: entry.next || entry.nextAction || null,
    completedAt: entry.ts || entry.date || null,
    taskIds: asArray(entry.taskIds).filter(Boolean),
  };
};

export const projectHeraldWorkState = ({
  observedMainSha,
  threads = [],
  ledgerEntries = [],
} = {}) => {
  const claims = threads
    .map(({ value, sourcePath }) => projectHeraldThreadClaim(value, {
      observedMainSha,
      sourcePath,
    }))
    .filter(Boolean);

  const receipts = ledgerEntries
    .map(({ value, sourcePath, branch, headSha, threadId }) =>
      projectHeraldLedgerReceipt(value, {
        observedMainSha,
        sourcePath,
        branch,
        headSha,
        threadId,
      }))
    .filter(Boolean);

  return {
    source: "herald",
    authoritativeLedger: ".viewtube/herald",
    observedMainSha: observedMainSha || null,
    claims,
    receipts,
  };
};
