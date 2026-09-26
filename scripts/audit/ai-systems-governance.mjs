import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projectHeraldThreadClaim, projectHeraldLedgerReceipt } from "./ai-systems-herald-projection.mjs";

const ACTIVE_LIFECYCLES = new Set([
  "canonical",
  "active",
  "planned",
  "claimed",
  "in_progress",
  "blocked",
  "partial",
  "implemented_branch",
  "merged_non_main",
  "landed_main_unverified",
  "landed_main_tested",
  "certified",
  "experimental",
]);

const ACTIVE_CLAIM_STATES = new Set(["claimed", "started", "in_progress", "blocked"]);
const TERMINAL_THREAD_STATES = new Set(["complete", "completed", "released", "superseded", "retired", "certified"]);

export const DEFAULT_REGISTRY_PATHS = [
  "governance/ai-systems/registry/systems.json",
  "governance/ai-systems/registry/capabilities.json",
  "governance/ai-systems/registry/plans.json",
  "governance/ai-systems/registry/donors.json",
  "governance/ai-systems/registry/integrations.json",
];

const isSha = (value) => typeof value === "string" && /^[0-9a-f]{40}$/.test(value);

const issue = (code, message, extra = {}) => ({ code, message, ...extra });

export const validateAuthorityRecord = (record) => {
  const issues = [];

  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return [issue("invalid_record", "Authority record must be an object.")];
  }

  if (!record.id) issues.push(issue("missing_id", "Authority record requires an id."));
  if (record.schemaVersion !== "vt-ai-authority-record-v1") {
    issues.push(issue("invalid_schema_version", "Authority record must use vt-ai-authority-record-v1."));
  }
  if (!Number.isInteger(record.recordVersion) || record.recordVersion < 1) {
    issues.push(issue("invalid_record_version", "recordVersion must be an integer >= 1."));
  }
  if (!record.kind) issues.push(issue("missing_kind", "Authority record requires a kind."));
  if (!record.title) issues.push(issue("missing_title", "Authority record requires a title."));
  if (!record.summary) issues.push(issue("missing_summary", "Authority record requires a summary."));
  if (!record.lifecycle) issues.push(issue("missing_lifecycle", "Authority record requires a lifecycle."));

  const owner = record.ownership?.canonicalOwner;
  const concern = record.ownership?.concern;
  if (typeof owner !== "string" || !owner.trim()) {
    issues.push(issue("missing_canonical_owner", "Authority record requires a non-empty canonical owner."));
  }
  if (typeof concern !== "string" || !concern.trim()) {
    issues.push(issue("missing_concern", "Authority record requires a non-empty bounded concern."));
  }

  if (!isSha(record.audit?.lastAuditedMainSha)) {
    issues.push(issue("invalid_audited_main_sha", "audit.lastAuditedMainSha must be a 40-character lowercase Git SHA."));
  }

  const mainState = record.integration?.currentMainState;
  if (!["absent", "partial", "equivalent", "present", "superseded", "unknown"].includes(mainState)) {
    issues.push(issue("invalid_main_state", "integration.currentMainState is missing or invalid."));
  }

  if (record.integration?.verifiedMainSha != null && !isSha(record.integration.verifiedMainSha)) {
    issues.push(issue("invalid_verified_main_sha", "integration.verifiedMainSha must be null or a 40-character lowercase Git SHA."));
  }

  return issues;
};

export const findAuthorityConflicts = (records) => {
  const byConcern = new Map();

  for (const record of records || []) {
    if (!ACTIVE_LIFECYCLES.has(record?.lifecycle)) continue;
    const concern = record?.ownership?.concern?.trim();
    const owner = record?.ownership?.canonicalOwner?.trim();
    if (!concern || !owner) continue;

    const entry = byConcern.get(concern) || { owners: new Set(), recordIds: [] };
    entry.owners.add(owner);
    entry.recordIds.push(record.id);
    byConcern.set(concern, entry);
  }

  return [...byConcern.entries()]
    .filter(([, value]) => value.owners.size > 1)
    .map(([concern, value]) => ({
      concern,
      owners: [...value.owners].sort(),
      recordIds: value.recordIds.slice().sort(),
    }));
};

const sourcePathsFor = (record) => {
  const refs = record?.sourceRefs || {};
  return [...(refs.code || []), ...(refs.docs || []), ...(refs.tests || [])]
    .filter((value) => typeof value === "string" && value.length > 0);
};

export const findMissingSourceRefs = (records, exists) => {
  const missing = [];

  for (const record of records || []) {
    for (const sourcePath of sourcePathsFor(record)) {
      if (!exists(sourcePath)) {
        missing.push({
          recordId: record.id,
          path: sourcePath,
          code: "missing_source_ref",
        });
      }
    }
  }

  return missing.sort((left, right) =>
    left.path.localeCompare(right.path) || String(left.recordId).localeCompare(String(right.recordId))
  );
};

export const findStaleClaims = (claims, { now = Date.now(), maxAgeMs = 24 * 60 * 60 * 1000 } = {}) =>
  (claims || [])
    .filter((claim) => ACTIVE_CLAIM_STATES.has(claim?.status))
    .filter((claim) => {
      const started = Date.parse(claim?.startedAt || "");
      return Number.isFinite(started) && now - started > maxAgeMs;
    })
    .slice()
    .sort((left, right) => Date.parse(left.startedAt) - Date.parse(right.startedAt));

const pathScopeOverlaps = (left, right) => {
  if (!left || !right) return false;
  if (left === right) return true;
  const prefix = (value) => value.endsWith("/**") ? value.slice(0, -2) : null;
  const leftPrefix = prefix(left);
  const rightPrefix = prefix(right);
  if (leftPrefix && right.startsWith(leftPrefix)) return true;
  if (rightPrefix && left.startsWith(rightPrefix)) return true;
  return false;
};

export const findClaimCollisions = (claims) => {
  const active = (claims || []).filter((claim) => ACTIVE_CLAIM_STATES.has(claim?.status));
  const collisions = [];

  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const left = active[i];
      const right = active[j];
      if (!left?.threadId || !right?.threadId || left.threadId === right.threadId) continue;
      if (left.agent && right.agent && left.agent === right.agent) continue;

      for (const pathA of left.writerPaths || []) {
        for (const pathB of right.writerPaths || []) {
          if (!pathScopeOverlaps(pathA, pathB)) continue;
          collisions.push({
            code: "claim_collision",
            taskA: left.taskId || null,
            taskB: right.taskId || null,
            threadA: left.threadId,
            threadB: right.threadId,
            agentA: left.agent || null,
            agentB: right.agent || null,
            pathA,
            pathB,
          });
        }
      }
    }
  }

  return collisions.sort((a, b) =>
    String(a.threadA).localeCompare(String(b.threadA))
    || String(a.threadB).localeCompare(String(b.threadB))
    || String(a.pathA).localeCompare(String(b.pathA))
  );
};

export const findMissingCompletionReceipts = (threads, receipts) => {
  const provenThreadIds = new Set(
    (receipts || [])
      .filter((receipt) => receipt?.threadId && receipt.evidenceState === "PROVEN")
      .map((receipt) => receipt.threadId)
  );

  return (threads || [])
    .filter((thread) => TERMINAL_THREAD_STATES.has(String(thread?.status || "").trim().toLowerCase()))
    .filter((thread) => thread?.threadId && !provenThreadIds.has(thread.threadId))
    .map((thread) => ({
      code: "missing_completion_receipt",
      threadId: thread.threadId,
      status: thread.status,
      sourcePath: thread.sourcePath || null,
    }))
    .sort((a, b) => String(a.threadId).localeCompare(String(b.threadId)));
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

export const readHeraldThreads = ({
  rootDir = process.cwd(),
  heraldThreadsDir = ".viewtube/herald/threads",
} = {}) => {
  const absoluteDir = path.join(rootDir, heraldThreadsDir);
  if (!fs.existsSync(absoluteDir)) return [];

  return fs.readdirSync(absoluteDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => {
      const sourcePath = path.join(heraldThreadsDir, name).replaceAll("\\", "/");
      return { ...readJson(path.join(absoluteDir, name)), sourcePath };
    });
};

export const readHeraldClaims = ({
  rootDir = process.cwd(),
  observedMainSha = null,
  heraldThreadsDir = ".viewtube/herald/threads",
} = {}) =>
  readHeraldThreads({ rootDir, heraldThreadsDir })
    .map((thread) => projectHeraldThreadClaim(thread, {
      observedMainSha,
      sourcePath: thread.sourcePath,
    }))
    .filter(Boolean);

export const readHeraldReceipts = ({
  rootDir = process.cwd(),
  observedMainSha = null,
  heraldLedgerDir = ".viewtube/herald/ledger",
} = {}) => {
  const absoluteDir = path.join(rootDir, heraldLedgerDir);
  if (!fs.existsSync(absoluteDir)) return [];

  const receipts = [];
  for (const name of fs.readdirSync(absoluteDir).filter((entry) => entry.endsWith(".jsonl")).sort()) {
    const sourcePath = path.join(heraldLedgerDir, name).replaceAll("\\", "/");
    const lines = fs.readFileSync(path.join(absoluteDir, name), "utf8").split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const entry = JSON.parse(line);
      const receipt = projectHeraldLedgerReceipt(entry, { observedMainSha, sourcePath });
      if (receipt) receipts.push(receipt);
    }
  }
  return receipts;
};

export const auditAiSystemsGovernance = ({
  rootDir = process.cwd(),
  registryPath,
  registryPaths,
  claims,
  threads,
  receipts,
  observedMainSha = null,
  heraldThreadsDir = ".viewtube/herald/threads",
  heraldLedgerDir = ".viewtube/herald/ledger",
  now = Date.now(),
  maxClaimAgeMs = 24 * 60 * 60 * 1000,
} = {}) => {
  const resolvedRegistryPaths = registryPaths
    || (registryPath ? [registryPath] : DEFAULT_REGISTRY_PATHS);

  const registries = resolvedRegistryPaths.map((relativePath) => ({
    relativePath,
    value: readJson(path.join(rootDir, relativePath)),
  }));
  const records = registries.flatMap(({ value }) =>
    Array.isArray(value.records) ? value.records : []
  );

  const effectiveThreads = threads ?? readHeraldThreads({ rootDir, heraldThreadsDir });
  const effectiveClaims = claims ?? effectiveThreads
    .map((thread) => projectHeraldThreadClaim(thread, {
      observedMainSha,
      sourcePath: thread.sourcePath,
    }))
    .filter(Boolean);
  const effectiveReceipts = receipts ?? readHeraldReceipts({
    rootDir,
    observedMainSha,
    heraldLedgerDir,
  });

  const recordIssues = records.flatMap((record) =>
    validateAuthorityRecord(record).map((entry) => ({ ...entry, recordId: record.id }))
  );
  const conflicts = findAuthorityConflicts(records);
  const missingSourceRefs = findMissingSourceRefs(records, (sourcePath) =>
    fs.existsSync(path.join(rootDir, sourcePath))
  );
  const staleClaims = findStaleClaims(effectiveClaims, { now, maxAgeMs: maxClaimAgeMs });
  const claimCollisions = findClaimCollisions(effectiveClaims);
  const missingCompletionReceipts = findMissingCompletionReceipts(effectiveThreads, effectiveReceipts);

  return {
    ok:
      recordIssues.length === 0
      && conflicts.length === 0
      && missingSourceRefs.length === 0
      && staleClaims.length === 0
      && claimCollisions.length === 0
      && missingCompletionReceipts.length === 0,
    registryCount: registries.length,
    recordCount: records.length,
    claimCount: effectiveClaims.length,
    receiptCount: effectiveReceipts.length,
    recordIssues,
    conflicts,
    missingSourceRefs,
    staleClaims,
    claimCollisions,
    missingCompletionReceipts,
  };
};

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCli) {
  const result = auditAiSystemsGovernance();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
