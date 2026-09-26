import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ACTIVE_STATUS = "ACTIVE";
const CORE_METADATA_PATHS = new Set([
  "docs/governance/DOCUMENTATION.md",
  "docs/governance/VERIFICATION.md",
  "docs/governance/WORK_OBJECTS.md",
  "docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md",
  "docs/architecture/PRODUCT_ARCHITECTURE.md",
  "docs/programs/INTEGRATED_APPLICATION.md",
]);

const issue = (code, message, extra = {}) => ({ code, message, ...extra });

const readJson = (rootDir, relativePath) =>
  JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), "utf8"));

export const validateDocumentRegistry = (registry) => {
  const issues = [];
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    return [issue("invalid_document_registry", "Document registry must be an object.")];
  }
  if (registry.schemaVersion !== 1) {
    issues.push(issue("invalid_document_registry_version", "Document registry schemaVersion must be 1."));
  }
  if (!Array.isArray(registry.entries)) {
    return [...issues, issue("missing_document_entries", "Document registry requires an entries array.")];
  }

  const byId = new Map();
  const activeByConcern = new Map();

  for (const entry of registry.entries) {
    if (!entry?.id) issues.push(issue("missing_document_id", "Document entry requires id.", { entry }));
    if (!entry?.path) issues.push(issue("missing_document_path", "Document entry requires path.", { id: entry?.id || null }));
    if (!entry?.class) issues.push(issue("missing_document_class", "Document entry requires class.", { id: entry?.id || null }));
    if (!entry?.status) issues.push(issue("missing_document_status", "Document entry requires status.", { id: entry?.id || null }));
    if (!entry?.concern) issues.push(issue("missing_document_concern", "Document entry requires concern.", { id: entry?.id || null }));
    if (!entry?.owner) issues.push(issue("missing_document_owner", "Document entry requires owner.", { id: entry?.id || null }));
    if (!entry?.productionDate) issues.push(issue("missing_production_date", "Document entry requires productionDate.", { id: entry?.id || null }));
    if (!entry?.lastEdited) issues.push(issue("missing_last_edited", "Document entry requires lastEdited.", { id: entry?.id || null }));

    if (entry?.id) {
      if (byId.has(entry.id)) {
        issues.push(issue("duplicate_document_id", `Duplicate document id ${entry.id}.`, {
          id: entry.id,
          paths: [byId.get(entry.id), entry.path || null],
        }));
      } else {
        byId.set(entry.id, entry.path || null);
      }
    }

    if (entry?.status === ACTIVE_STATUS && entry?.concern) {
      const current = activeByConcern.get(entry.concern) || [];
      current.push(entry);
      activeByConcern.set(entry.concern, current);
    }
  }

  for (const [concern, entries] of activeByConcern) {
    if (entries.length > 1) {
      issues.push(issue("competing_active_authority", `Multiple ACTIVE documents claim concern "${concern}".`, {
        concern,
        ids: entries.map((entry) => entry.id),
        paths: entries.map((entry) => entry.path),
      }));
    }
  }

  return issues;
};

export const validateCapabilityRegistry = (registry) => {
  const issues = [];
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    return [issue("invalid_capability_registry", "Capability registry must be an object.")];
  }
  if (registry.schemaVersion !== 1) {
    issues.push(issue("invalid_capability_registry_version", "Capability registry schemaVersion must be 1."));
  }
  if (!Array.isArray(registry.capabilities)) {
    return [...issues, issue("missing_capabilities", "Capability registry requires a capabilities array.")];
  }

  const ids = new Set();
  for (const capability of registry.capabilities) {
    if (!capability?.id) {
      issues.push(issue("missing_capability_id", "Capability requires id."));
    } else if (ids.has(capability.id)) {
      issues.push(issue("duplicate_capability_id", `Duplicate capability id ${capability.id}.`, { id: capability.id }));
    } else {
      ids.add(capability.id);
    }
    if (!capability?.name) issues.push(issue("missing_capability_name", "Capability requires name.", { id: capability?.id || null }));
    if (!capability?.owner) issues.push(issue("missing_capability_owner", "Capability requires one canonical owner.", { id: capability?.id || null }));
    if (!capability?.description) issues.push(issue("missing_capability_description", "Capability requires description.", { id: capability?.id || null }));
    if (!capability?.authority) issues.push(issue("missing_capability_authority", "Capability requires an authority path.", { id: capability?.id || null }));
  }
  return issues;
};

const requiredMetadataLabels = [
  "Production Date",
  "Last Edited",
  "Class",
  "Status",
  "Concern",
  "Owner",
  "Registry ID",
  "Last Audited Main SHA",
];

const validateCoreMarkdownMetadata = (rootDir, entry) => {
  if (!CORE_METADATA_PATHS.has(entry.path)) return [];
  const content = fs.readFileSync(path.join(rootDir, entry.path), "utf8");
  return requiredMetadataLabels
    .filter((label) => !content.includes(`**${label}:**`))
    .map((label) => issue("missing_markdown_metadata", `${entry.path} is missing ${label} metadata.`, {
      path: entry.path,
      label,
    }));
};

const validateRegisteredPaths = (rootDir, registry, capabilityRegistry) => {
  const issues = [];
  const exists = (relativePath) => fs.existsSync(path.join(rootDir, relativePath));

  for (const entry of registry.entries || []) {
    if (entry?.path && !exists(entry.path)) {
      issues.push(issue("missing_registered_document", `Registered document path does not exist: ${entry.path}`, {
        id: entry.id || null,
        path: entry.path,
      }));
    }
    for (const superseded of entry?.supersedes || []) {
      if (typeof superseded === "string" && superseded.includes("/") && !exists(superseded)) {
        issues.push(issue("missing_superseded_source", `Superseded source does not exist: ${superseded}`, {
          id: entry.id || null,
          path: superseded,
        }));
      }
    }
  }

  for (const capability of capabilityRegistry.capabilities || []) {
    if (capability?.authority && !exists(capability.authority)) {
      issues.push(issue("missing_capability_authority_path", `Capability authority does not exist: ${capability.authority}`, {
        id: capability.id || null,
        path: capability.authority,
      }));
    }
  }

  return issues;
};

export const auditDocumentSystem = ({
  rootDir = process.cwd(),
  documentRegistryPath = "docs/registry.json",
  capabilityRegistryPath = "docs/architecture/capabilities.json",
} = {}) => {
  const registry = readJson(rootDir, documentRegistryPath);
  const capabilityRegistry = readJson(rootDir, capabilityRegistryPath);

  const issues = [
    ...validateDocumentRegistry(registry),
    ...validateCapabilityRegistry(capabilityRegistry),
    ...validateRegisteredPaths(rootDir, registry, capabilityRegistry),
  ];

  for (const entry of registry.entries || []) {
    if (entry?.path && fs.existsSync(path.join(rootDir, entry.path))) {
      issues.push(...validateCoreMarkdownMetadata(rootDir, entry));
    }
  }

  return {
    ok: issues.length === 0,
    documentCount: registry.entries?.length || 0,
    capabilityCount: capabilityRegistry.capabilities?.length || 0,
    issues,
  };
};

const isDirectRun = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  try {
    const result = auditDocumentSystem();
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`Document system audit failed: ${error?.stack || error}\n`);
    process.exitCode = 1;
  }
}
