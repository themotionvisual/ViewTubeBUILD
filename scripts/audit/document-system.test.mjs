import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  validateDocumentRegistry,
  validateCapabilityRegistry,
  auditDocumentSystem,
} from "./document-system.mjs";

const activeEntry = (overrides = {}) => ({
  id: "DOC-TEST-ONE",
  path: "docs/test.md",
  class: "DOMAIN_AUTHORITY",
  status: "ACTIVE",
  concern: "test-concern",
  owner: "Test Owner",
  productionDate: "2026-09-26",
  lastEdited: "2026-09-26",
  lastAuditedMainSha: null,
  supersedes: [],
  relatedAuthorities: [],
  ...overrides,
});

test("validateDocumentRegistry accepts unique active concerns and IDs", () => {
  const issues = validateDocumentRegistry({
    schemaVersion: 1,
    entries: [
      activeEntry(),
      activeEntry({
        id: "DOC-TEST-TWO",
        path: "docs/other.md",
        concern: "other-concern",
        owner: "Other Owner",
      }),
    ],
  });

  assert.deepEqual(issues, []);
});

test("validateDocumentRegistry rejects duplicate IDs and competing active authorities", () => {
  const issues = validateDocumentRegistry({
    schemaVersion: 1,
    entries: [
      activeEntry(),
      activeEntry({
        path: "docs/duplicate.md",
        owner: "Competing Owner",
      }),
    ],
  });

  assert.ok(issues.some((issue) => issue.code === "duplicate_document_id"));
  assert.ok(issues.some((issue) => issue.code === "competing_active_authority"));
});

test("validateCapabilityRegistry requires unique IDs, owners, and authority paths", () => {
  const issues = validateCapabilityRegistry({
    schemaVersion: 1,
    capabilities: [
      {
        id: "CAP-ONE",
        name: "One",
        owner: "",
        status: "ACCEPTED",
        description: "Capability",
        authority: null,
      },
      {
        id: "CAP-ONE",
        name: "Duplicate",
        owner: "Owner",
        status: "ACCEPTED",
        description: "Capability",
        authority: "docs/test.md",
      },
    ],
  });

  assert.ok(issues.some((issue) => issue.code === "duplicate_capability_id"));
  assert.ok(issues.some((issue) => issue.code === "missing_capability_owner"));
  assert.ok(issues.some((issue) => issue.code === "missing_capability_authority"));
});

test("auditDocumentSystem verifies registered paths and required Markdown metadata", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "vt-doc-system-"));
  fs.mkdirSync(path.join(rootDir, "docs/architecture"), { recursive: true });

  fs.writeFileSync(
    path.join(rootDir, "docs/registry.json"),
    JSON.stringify({
      schemaVersion: 1,
      entries: [
        activeEntry({
          path: "docs/architecture/PRODUCT.md",
          concern: "product",
          owner: "Product",
        }),
      ],
    }),
  );

  fs.writeFileSync(
    path.join(rootDir, "docs/architecture/capabilities.json"),
    JSON.stringify({
      schemaVersion: 1,
      capabilities: [
        {
          id: "CAP-PRODUCT",
          name: "Product",
          owner: "Product",
          status: "ACCEPTED",
          description: "Product capability",
          authority: "docs/architecture/PRODUCT.md",
        },
      ],
    }),
  );

  fs.writeFileSync(
    path.join(rootDir, "docs/architecture/PRODUCT.md"),
    [
      "# Product",
      "",
      "**Production Date:** 2026-09-26  ",
      "**Last Edited:** 2026-09-26  ",
      "**Class:** PRODUCT_ARCHITECTURE  ",
      "**Status:** ACTIVE  ",
      "**Concern:** product  ",
      "**Owner:** Product  ",
      "**Registry ID:** DOC-TEST-ONE  ",
      "**Last Audited Main SHA:** N/A",
      "",
    ].join("\n"),
  );

  const result = auditDocumentSystem({ rootDir });

  assert.equal(result.ok, true);
  assert.equal(result.documentCount, 1);
  assert.equal(result.capabilityCount, 1);
  assert.deepEqual(result.issues, []);
});
