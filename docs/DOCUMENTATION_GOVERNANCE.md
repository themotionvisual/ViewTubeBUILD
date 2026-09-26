> **MIGRATION NOTICE — 2026-09-26:** The active documentation-governance authority is now `docs/governance/DOCUMENTATION.md` with machine metadata in `docs/registry.json`. This file is preserved intact below as a consolidation source pending the Removed Archive migration.

# ViewTube Documentation Governance

**Status:** Canonical documentation-governance contract  
**Effective:** 2026-09-24  
**Scope:** Files under `/docs`

## Purpose

ViewTube documentation has accumulated architecture authorities, implementation plans, audits, migration records, screenshots, Herald artifacts, prototypes, status notes, and historical references in the same namespace. This contract prevents those different document types from silently competing for authority.

Wave 1 is deliberately non-destructive: existing documents remain where they are while the registry classifies them.

## Authority model

1. **One primary authority per bounded concern.** Multiple canonical documents are allowed only when their scopes are explicitly different.
2. **Current code, tests, registries, and runtime contracts are verification evidence.** A document that contradicts current implementation must be reconciled before being presented as current truth.
3. **Historical plans never override a current authority.**
4. **References may repeat links and identifiers; authority may not be duplicated.**
5. **A document title containing MASTER, CANONICAL, SOURCE OF TRUTH, or AUTHORITY is not sufficient by itself.** Its role must agree with the registry and current code.
6. **Supersession is explicit.** When a new authority replaces an old one, the old document is retained or archived with a clear pointer to the successor until safe deletion is proven.

## Lifecycle states

- `canonical` — current normative authority for a declared scope.
- `active-plan` — work plan with potentially open tasks.
- `reference` — durable supporting context, schema, implementation reference, or secondary contract.
- `evidence` — QA/status/acceptance/snapshot/changelog material.
- `historical` — superseded or time-bounded context retained for provenance.
- `artifact` — generated/captured output such as screenshots, Herald artifacts, demos, or prototypes.
- `retirement-candidate` — transient or redundant item pending safety checks.
- `review` — unresolved authority or freshness ambiguity.

The authoritative inventory is `docs/DOCUMENTATION_REGISTRY.md`.

## Required metadata for new canonical documents

Every new canonical document must state near the top:

- Status
- Scope
- Canonical owner / concern
- Date created
- Last audited `main` commit
- Documents superseded, if any
- Related authorities with distinct scopes

Existing documents are grandfathered during the consolidation waves and should receive this metadata when their domain is touched.

## Placement rules

During the consolidation:

- Do not add new miscellaneous documents directly under `docs/` except the documentation control files.
- Put domain documentation under its owning directory.
- Keep generated evidence separate from normative architecture.
- Keep migration/reference snapshots out of canonical architecture locations.
- Keep prototypes/demos clearly labeled as non-production evidence.

Existing root-level documents are grandfathered until their scheduled migration wave.

## Update protocol

When changing a documented system:

1. Identify the registry entry and current authority for that concern.
2. Verify the claim against current code/tests/registries where applicable.
3. Update the existing authority instead of creating another competing master document whenever possible.
4. If a new document is genuinely required, define its non-overlapping scope.
5. Update `DOCUMENTATION_REGISTRY.md` in the same PR.
6. Mark any displaced document as historical/reference and name its successor.

## Consolidation safety rules

A file may be moved, archived, merged, or deleted only after:

1. checking repository references to its current path;
2. identifying unique information not present in the target authority;
3. extracting that unique information or intentionally preserving it as history/evidence;
4. updating inbound documentation links and agent instructions;
5. verifying code does not consume the file as runtime/static input;
6. updating the registry;
7. reviewing the diff for accidental loss.

Deletion requires all seven checks. "Old filename" or "looks duplicated" is never sufficient.

## Planned directory roles

These are target roles, not an instruction to move files in Wave 1:

- `docs/architecture/` — current cross-system/domain architecture.
- `docs/analytics/` — analytics product/data contracts and active expansion work.
- `docs/brain/` — Brain/AI architecture and orchestration.
- `docs/editor/` — editor architecture and interaction contracts.
- `docs/ui/` — Toolbox/component/widget UI authorities.
- `docs/migration/` — active migrations and migration-specific reference history.
- `docs/deployment/` — durable deployment architecture/runbooks only.
- `docs/user-guide-v2/` — user-guide architecture and truth mapping.
- evidence/artifact/archive structure — to be finalized after domain waves prove what must remain discoverable.

## Future automated checks

After the document families are reconciled, add CI/source-governance checks for:

- broken relative links;
- new unregistered `docs/` files;
- multiple canonical entries claiming the same concern;
- canonical documents missing required metadata;
- unexpected new root-level `docs/` files;
- registry paths that no longer exist.

Automation is intentionally deferred until the existing tree is normalized, so Wave 1 does not create a failing gate against legacy structure.

## Wave order

1. **Wave 1:** registry, entrypoint, governance contract — no moves/deletions.
2. **Wave 2:** Projects / ContentBuild / Asset Engine.
3. **Wave 3:** Studio UI / Toolbox / widgets / mobile visual rules.
4. **Wave 4:** Analytics / Data Visuals / migrations.
5. **Wave 5:** Brain / AI / Herald.
6. **Wave 6:** Auth / Editor / deployment / user guide.
7. **Wave 7:** archive/evidence re-homing and root cleanup.
8. **Wave 8:** automated governance checks, broken-link certification, final retirement pass.

## Definition of done for the overall initiative

- one obvious documentation entrypoint;
- one declared authority per bounded concern;
- no unexplained competing master/source-of-truth documents;
- current architecture visibly separated from plans/history/evidence;
- no broken internal references from the reorganization;
- no lost unique information;
- no transient deployment markers in the durable architecture set;
- agents can answer "what is authoritative for X?" from the registry without guessing.
