# ViewTube Documentation Governance

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** CONSTITUTION  
**Status:** ACTIVE  
**Concern:** documentation authority, lifecycle, consolidation, archive, and knowledge governance  
**Owner:** Documentation Governance  
**Registry ID:** DOC-GOV-DOCUMENTATION  
**Last Audited Main SHA:** ee02fdbd1af2be30e81de7955dad188999a03ac4  
**Supersedes:** docs/DOCUMENTATION_GOVERNANCE.md after Phase A/B migration certification  
**Related Authorities:** docs/registry.json; docs/governance/VERIFICATION.md; docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md

## Purpose

This contract governs ViewTube's durable knowledge system. It prevents plans, audits, prototypes, conversations, PRs, skills, generated artifacts, and historical files from silently competing with current architecture.

## Constitutional rules

1. One primary authority per bounded concern.
2. Current code, focused tests, runtime evidence, and executable registries verify implementation claims; prose does not override observed behavior.
3. Every governed document has an explicit class, status, concern, owner, production date, last-edited date, and registry identity.
4. Living documents use brief descriptive filenames without dates. Dates belong in metadata and history.
5. MASTER, CANONICAL, AUTHORITY, or SOURCE_OF_TRUTH in a filename does not grant authority. docs/registry.json does.
6. Plans and audits are snapshots, not permanent architecture authorities.
7. Skills are executable procedures. They may cite authority; they may not silently redefine it.
8. Conversations, AI memory, branches, PRs, screenshots, and prototypes are evidence or provenance, not independent truth stores.
9. New documents are created only after prior-art reconciliation proves that updating, extending, or consolidating an existing artifact is insufficient.
10. Obsolete material is preserved in the Removed Archive with lineage. It is removed from the active knowledge tree only after a no-loss consolidation check.
11. Consolidation never means choosing the newest file and discarding the rest. Every unique useful contribution must be incorporated or explicitly preserved and mapped.
12. Generated documents are marked GENERATED and are never hand-edited at their generated destination.
13. A canonical document may be ACTIVE while NEEDS_REVIEW; staleness is not permission to create a competing authority.
14. Supersession chains are explicit and machine-resolvable.
15. Important architecture changes update the owning authority in the same mission/PR as implementation or before merge.

## Document classes

- CONSTITUTION — durable governing law and completion doctrine.
- PRODUCT_ARCHITECTURE — product model, capabilities, tool topology, lifecycle, and ownership boundaries.
- PROGRAM — cross-system convergence, dependency and execution-program structure.
- DOMAIN_AUTHORITY — bounded current system truth.
- SPECIFICATION — detailed subordinate contract, schema, workflow, interface, or design rule.
- DECISION — durable ADR-like decision and rationale.
- REFERENCE — curated supporting resource.
- AUDIT — evidence-based point-in-time assessment.
- EVIDENCE — verification material.
- RECEIPT — compact record of performed work and observed results.
- DONOR — source retained for unique ideas/code/history but not current authority.
- PROTOTYPE — exploratory artifact not production truth.
- HISTORICAL — time-bounded provenance.
- SUPERSEDED — replaced source awaiting or residing in Removed Archive.
- GENERATED — deterministic projection of canonical structured data.

## Standard metadata

Every governed Markdown authority begins with:
- Production Date
- Last Edited
- Class
- Status
- Concern
- Owner
- Registry ID
- Last Audited Main SHA
- Supersedes
- Related Authorities

Production Date never changes. Last Edited changes when substantive content changes. Last Audited Main SHA changes only after actual reconciliation with that revision of main.

## Authority graph

Documentation Governance
→ Product Completion Constitution
→ Product Architecture + Capability Registry
→ Integrated Application Program
→ Task Index and Domain Authorities
→ Specifications

Operational systems sit alongside that graph:
Crown → Royal Exchange → Conversation & Improvement OS → code/tests/runtime → receipts/evidence → Task Authority.

## Create / update / consolidate decision

Before creating anything:
1. locate registry concern;
2. find current authority;
3. search plans/specs/references/artifacts/skills in the same family;
4. inspect current main if the claim concerns implementation;
5. choose exactly one action: UPDATE, EXTEND, CONSOLIDATE, CREATE, ARCHIVE, or NO-CHANGE.

Creating a new authority is the exceptional path.

## No-loss consolidation

For every source family:
1. inventory all versions and hashes;
2. compare text, code, CSS, JS, JSON, embedded data, comments, hidden instructions, references, tasks, decisions, assets and interaction behavior;
3. classify unique material as CURRENT, DURABLE, TASK, DECISION, REFERENCE, DONOR, HISTORICAL, SUPERSEDED, or CONFLICT;
4. place durable current knowledge in the surviving authority/specification;
5. route unfinished work to Task Index;
6. route accepted durable choices to Decision records where appropriate;
7. preserve source originals byte-for-byte in archive/removed/;
8. write a consolidation manifest mapping every source and every unique contribution;
9. run a no-loss audit before calling consolidation complete.

## Removed Archive

archive/removed is preservation, not authority. Agents consult it only for recovery, lineage, historical research, or consolidation. Every archived source retains original path, hash, dates, reason, replacement, consolidation family, harvested material, task/capability links, and source commit/PR when known.

## Verification

Any implementation-affecting documentation claim must use docs/governance/VERIFICATION.md. Code written is not evidence that user-visible behavior works.

## Mutation rule

Documentation changes should be performed through the viewtube-document-system skill or an equivalent workflow following this contract. The skill may author supporting sub-skills, but those sub-skills remain subordinate to this governance contract.


## Master Source tier

A MASTER_SOURCE is an exceptional REFERENCE that contains unusually broad, high-value research, ideas, architectures, workflows, feature concepts, or donor material that should be consulted proactively across multiple domains.

Rules:
- MASTER_SOURCE is a source tier, not a competing authority class.
- Master Sources are mandatory prior art for work within their declared scope.
- Their ideas are not automatically accepted product behavior or implementation truth.
- Current code/runtime, Product Architecture, Domain Authorities, Task Index state, and verified provider/API evidence still govern current claims.
- Valuable material should be promoted into capabilities, authorities, specifications, decisions, opportunities, risks, or Task Index records rather than repeatedly copied.
- Master Sources must remain preserved, registry-addressable, and included in consolidation lineage.
