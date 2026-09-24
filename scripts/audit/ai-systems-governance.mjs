import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

export const auditAiSystemsGovernance = ({
  rootDir = process.cwd(),
  registryPath = "governance/ai-systems/registry/systems.json",
  claims = [],
  now = Date.now(),
  maxClaimAgeMs = 24 * 60 * 60 * 1000,
} = {}) => {
  const registry = readJson(path.join(rootDir, registryPath));
  const records = Array.isArray(registry.records) ? registry.records : [];

  const recordIssues = records.flatMap((record) =>
    validateAuthorityRecord(record).map((entry) => ({ ...entry, recordId: record.id }))
  );
  const conflicts = findAuthorityConflicts(records);
  const missingSourceRefs = findMissingSourceRefs(records, (sourcePath) =>
    fs.existsSync(path.join(rootDir, sourcePath))
  );
  const staleClaims = findStaleClaims(claims, { now, maxAgeMs: maxClaimAgeMs });

  return {
    ok: recordIssues.length === 0 && conflicts.length === 0 && missingSourceRefs.length === 0 && staleClaims.length === 0,
    recordCount: records.length,
    recordIssues,
    conflicts,
    missingSourceRefs,
    staleClaims,
  };
};

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCli) {
  const result = auditAiSystemsGovernance();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
