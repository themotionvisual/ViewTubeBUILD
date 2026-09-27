# Ideas Library: Lossless Consolidation Plan

**Production Date:** 2026-09-27
**Last Edited:** 2026-09-27
**Class:** PLAN
**Status:** PROPOSED — implementation not claimed
**Concern:** conversation idea intake, review, semantic consolidation and master projection
**Owner:** Documentation Governance / Conversation & Improvement OS
**Capability:** CAP-DOCUMENT-GOVERNANCE
**Plan family:** PLAN-FAMILY-DOCS-AGENTS
**Existing owner:** `docs/governance/CONVERGENCE.md`
**Audited main:** `1a41090d5c1ca1b2f554c7fdc6f4f1ab4f11820f`

## Decision and current state

Extend the existing `ideas/` library and `viewtube-ideas-curator`; do not create another ideas store or another conversation task ledger. The Conversation OS is already installed through `AGENTS.md`, `CLAUDE.md`, `docs/governance/CONVERSATION_OS.md`, `agent/contracts/conversation-os.md`, and its skill. Conversation handoffs live in `tasks/conversation-intake/`.

Current main already has category source folders, `ideas/registry.json`, generated `ideas/MASTER_IDEAS.md`, `generate:ideas-master`, similarity helpers, and a structural audit. It contains two registered source lists. The CLI groups likely matches, but its group retains a representative title and summary plus unioned source IDs/refs; it does not produce a reviewed composite of each source's distinct requirements. The master generator renders registry entries as written and does not perform its own consolidation. The audit checks IDs, categories, targets and provenance, but not source item coverage or requirement retention.

## Existing work checked

| Source | Disposition |
| --- | --- |
| `docs/governance/DOCUMENTATION.md`, `CONVERGENCE.md`, `CONVERSATION_OS.md`, `CONVERSATION_HANDOFFS.md` | Retain authority and staging boundaries. |
| `tasks/conversation-intake/VT-CONV-DOCS-OS-TASK-INDEX/handoff.md` | Preserve settled no-loss and single-task-authority decisions; its older phase status is historical. |
| `ideas/README.md`, `ideas/lists/**`, `ideas/registry.json`, `ideas/MASTER_IDEAS.md` | Extend existing source, normalized and generated layers. |
| `.claude/skills/viewtube-ideas-curator/SKILL.md`, `.claude/skills/viewtube-conversation-os/SKILL.md` | Update procedures after schema and tooling are proven. |
| `scripts/governance/convergence.mjs`, `consolidate-ideas.mjs`, `build-ideas-master.mjs`, `audit-convergence.mjs` | Reuse; add review and coverage contracts. |
| `governance/convergence/plan-families.json`, Task Authority, Product Architecture | Route accepted work to existing owners. No new capability or permanent task status is inferred from ideas. |

## Target model

1. **Source list.** Preserve the original conversation list, audit, document or research ideas under `ideas/lists/<category>/` with stable `IDEA-LIST-*` ID, source kind, conversation/handoff/document reference, capture date, and stable per-item anchors. Multi-topic lists can live in the closest folder and route individual items across categories; do not duplicate the file. Preserve wording and later corrections in source history.
2. **Atomic intake.** Each source item gets an immutable source item ID and exact source pointer. Capture creator goal, proposed behavior, constraints, acceptance details, dependencies, and evidence. One sentence containing several independent objectives can yield several linked candidates; multiple phrasings of one objective can converge.
3. **Candidate comparison.** Search titles, goals, capability/target IDs, affected workflow and requirements. Similarity scores only produce candidates. A reviewer classifies `SAME_OBJECTIVE`, `COMPLEMENTARY`, `DEPENDENCY`, `CONFLICT`, or `DISTINCT` with rationale. Matching capability or vocabulary alone cannot trigger a merge.
4. **Master idea.** One stable `IDEA-*` identity owns one outcome/goal. Store a plain-language objective and an organized union of features, functions, UX, data/backend, workflow, constraints, acceptance criteria, and open questions. Each retained requirement maps to one or more source item IDs. Preserve optional alternatives and unresolved contradictions explicitly rather than silently choosing one.
5. **Review and promotion.** Use `CAP-*`, target type/ID, existing plan family, owner, status, review date/reviewer, decision and evidence. States: `UNREVIEWED → REVIEWING → CONSOLIDATED → ACCEPTED / DEFERRED / REJECTED`. Rejection keeps provenance and rationale. Only reviewed, accepted work is proposed to Task Authority, a plan family, Domain Authority, Decision or opportunity/risk store; implementation and verification remain separate.
6. **Master projection.** Generate `ideas/MASTER_IDEAS.md` from registry records, grouped by category/subcategory, with goal, full constituent requirements, review state, owner, source list and source item links, overlaps/dependencies/conflicts, and promotion links. Include unreviewed ideas visibly. The generated file is never hand-edited.

### Required invariants

- Every captured source item appears in exactly one master idea or in a named unresolved review queue; no source item vanishes during consolidation.
- Every distinct useful requirement has an explicit source mapping and a disposition: retained, alternative, deferred with reason, rejected with reason, or unresolved.
- A master idea may combine multiple lists and categories, but has one primary goal/owner and cross-links rather than duplicate master entries.
- IDs survive renames and category changes. A split or merge records predecessor/successor IDs, rationale and requirement mapping.
- Source lists are immutable provenance (corrections are additive or versioned); registry is editable canonical normalization; Markdown master is generated.
- Ideas are proposals, never a second Task Index or implementation proof.

## Implementation waves

| Wave | Work | Acceptance evidence |
| --- | --- | --- |
| 1. Inventory | Enumerate all tracked idea lists and relevant conversation intake packages; compare with registered source lists and current master. Establish counts and missing-source report. | Reproducible report with source path, list ID, item IDs, registry coverage and unresolved items. No assumption that two current registered lists represent all conversations. |
| 2. Schema and migration | Version the registry schema; add source item IDs, requirement records, review decisions, merge lineage, and source-to-requirement mappings. Migrate existing `IDEA-*` IDs without rewriting source lists. | Migration diff and validation prove all prior IDs, source refs, summaries and unique requirements remain reachable. |
| 3. Review workflow | Add deterministic candidate discovery and a review manifest or CLI for merge/split/keep decisions. Require explicit review before writing a composite. Preserve conflicts, alternatives, and rationale. | Fixtures for identical wording, complementary features, same capability but different goal, conflicting requirements, and a split/merge round trip. |
| 4. Projection and audit | Expand generator and audit to render composite requirements and fail on orphaned source items, missing mappings, duplicate stable IDs, invalid references or an unreviewed automatic merge. | Regeneration is deterministic; audit reports zero loss and explains unresolved work. |
| 5. Conversation integration | Update ideas curator, Conversation OS handoff/reconciliation guidance, and `ideas/README.md` with a concise intake command and review checklist. Handoff worklogs link their idea source list and master IDs. | A new multi-topic conversation list enters once, routes across categories, and appears in master without creating a task. |
| 6. Backfill and promotion | Reconcile older idea lists and conversation packages in bounded batches; review overlaps against plan families and capabilities; route accepted ideas to existing owners. | Per-batch receipt with counts, merge decisions, preserved details, unresolved conflicts and promotion refs. No mass task creation. |

## Review checklist for every proposed merge

1. State the shared creator/development objective in one sentence.
2. Compare each source item's outcome, audience, owner, workflow stage and constraints.
3. List all distinct features/functions and map each to its source item.
4. Mark contradictions and incompatible alternatives for a decision; do not flatten them.
5. Verify the proposed owner and capability home against current code and plan family where relevant.
6. Record the merge decision, reviewer, date, confidence, rationale and reversible lineage.
7. Regenerate master and run coverage validation before promotion.

## Sequence and boundaries

Start with one small pair of overlapping governance ideas and one pair of genuinely distinct same-capability ideas. Prove lossless behavior, then migrate the current registry, then backfill conversation lists. Use the existing `PLAN-FAMILY-DOCS-AGENTS` survivor and Task Authority for exact implementation work; this plan is a scoped proposal, not a replacement authority or task ledger. Do not make automatic semantic grouping authoritative without review.

## Next action

Implement Wave 1 inventory and a source-item coverage report on a feature branch. Use its measured gaps to finalize the versioned schema before any bulk migration.
