---
name: viewtube-document-system
description: Govern, create, edit, consolidate, archive, extend and verify ViewTube documentation and document-linked agent systems. Use for main architecture/program/domain documents, plans, audits, reports, references, standalone HTML/prototype families, skills/workflows, document migrations, capability registry updates, and lossless version consolidation.
---

# ViewTube Document System

This is the operational skill for the ViewTube knowledge system.

It implements:
- docs/governance/DOCUMENTATION.md
- agent/contracts/document-system-workflow.md
- docs/governance/VERIFICATION.md

It does not replace them.

## Mandatory first reads

1. docs/governance/DOCUMENTATION.md
2. docs/registry.json
3. docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md
4. docs/architecture/PRODUCT_ARCHITECTURE.md
5. docs/programs/INTEGRATED_APPLICATION.md when the change crosses systems
6. the owning Domain Authority / Specification
7. references appropriate to the operation below.

## Core sequence

ORIENT → RECONCILE → CLASSIFY → DESIGN → AUTHOR → LINK → VERIFY → RECORD

Never begin by creating a new file.

## 1. Reconcile prior art

Search the active documentation tree, registry, current code when implementation claims are involved, Task Index, Crown/Royal Exchange records, relevant Library/repo artifacts, and Removed Archive only when recovery/lineage is needed.

Return one action:
- UPDATE
- EXTEND
- CONSOLIDATE
- CREATE
- ARCHIVE
- NO-CHANGE

Prefer UPDATE or CONSOLIDATE over CREATE.

## 2. Route by artifact type

Use the smallest durable artifact that matches the need.

- Product-wide completion law → Product Completion Constitution.
- Product capability/tool topology → Product Architecture + capability registry.
- Cross-system convergence/dependencies → Integrated Application Program.
- Bounded system truth → Domain Authority.
- Detailed contract/schema/design rule → Specification.
- Durable tradeoff/resolution → Decision.
- Point-in-time findings → Audit/Report.
- Exact work → Task Index.
- Reusable agent procedure → Skill.
- Multi-step repeatable orchestration → Workflow.
- Exploratory UI/code → Prototype or Standalone HTML.
- Useful external/internal source → Reference.
- Verification outcome → Receipt/Evidence.

## 3. Main-document editing rules

Read references/main-document-authoring.md.

Before changing Product Completion Constitution, Product Architecture, Integrated Application Program, Documentation Governance, Verification or a Domain Authority:
- identify the exact concern being changed;
- state why the existing wording is insufficient;
- inspect affected code/contracts if the change claims implementation behavior;
- preserve non-overlapping durable rules;
- route task/status history out of architecture prose;
- update Production Date only when creating; update Last Edited on substantive edits;
- update Last Audited Main SHA only after actual reconciliation to that SHA;
- update docs/registry.json in the same PR.

## 4. Feature / system / integration / design additions

When a conversation proposes a new feature, system, integration or major design:
1. resolve whether it is already an existing capability or owner;
2. determine whether it is accepted product architecture, an opportunity, or implementation detail;
3. update capabilities.json only for durable accepted capabilities;
4. update Product Architecture only when product topology/boundaries change;
5. update Integrated Application Program only when cross-system seams/dependencies change;
6. update Domain Authority/Specification for bounded behavior;
7. create/propose Task Index work for exact implementation;
8. create a Decision when a durable tradeoff or owner choice is made;
9. avoid creating a new subsystem merely because a new UI surface needs the capability.

## 5. Consolidation

Read references/consolidation-and-archive.md.

For multi-version docs/plans/HTML/prototypes:
- inventory every version and content hash;
- compare visible text plus code, CSS, JS, JSON, data, comments, hidden instructions, assets, interactions, references and task/decision material;
- account for every unique contribution in a consolidation manifest;
- keep source originals in archive/removed;
- never infer that newest == best;
- never delete before inbound-reference, runtime-use and donor-value checks.

## 6. Skill / workflow authoring

Read references/sub-skill-authoring.md.

Create or update a sub-skill only when a repeated specialized procedure would materially improve correctness, consistency or efficiency. A sub-skill:
- has a narrow trigger;
- cites its governing authorities;
- does not own product truth;
- does not create a second ledger;
- reuses shared references/templates;
- declares required verification;
- can recommend plans, audits, reports, authority updates, workflow/tool/prototype creation, and Task Candidates when relevant.

## 7. Knowledge-Creation Advisor

During substantial work, proactively evaluate whether ViewTube would benefit from:
- a plan;
- audit;
- report;
- authority update;
- decision record;
- consolidation;
- skill/sub-skill;
- workflow;
- standalone HTML reference/prototype;
- reusable tool;
- test harness;
- migration;
- curated reference.

Recommend the smallest nonduplicative artifact. Do not create speculative clutter.

## 8. Improvement Advisor

When reviewing documentation and related code, surface opportunities for:
- architecture simplification;
- duplicate/obsolete systems;
- dead code candidates;
- performance/reliability improvements;
- UX/mobile/accessibility improvements;
- AI/model/context/prompt improvements;
- video-generation and Remotion improvements;
- external repositories/tools worth evaluating;
- stale/contradictory/unregistered documents;
- missing tests/verification.

Classify speculative items as opportunities/risks before turning them into tasks.

## 9. Verification

Read references/verification-and-handoff.md.

For document-only work:
- validate registry/schema consistency;
- inspect links/supersession;
- ensure no second authority was created;
- verify all claimed current-main facts against exact source/tests where practical.

For code/UI work caused by documentation:
- follow docs/governance/VERIFICATION.md;
- test behavior;
- open and use the affected feature;
- take and analyze screenshots for visible changes;
- verify relevant desktop/mobile states;
- fix observed defects and reverify;
- leave a receipt.

## 10. Completion

A document-system mission is complete only when:
- the correct existing/new artifact owns the concern;
- registry/capability relationships are updated;
- consolidation lineage is preserved where relevant;
- obsolete sources are marked for or moved to Removed Archive only after no-loss checks;
- verification has run;
- a compact handoff identifies remaining migration work.

## References

- references/authority-and-routing.md
- references/consolidation-and-archive.md
- references/main-document-authoring.md
- references/sub-skill-authoring.md
- references/verification-and-handoff.md
- templates/document-template.md
- templates/sub-skill-template.md


## Built-in sub-skills

- `viewtube-main-document-editor` — edit the main constitutions, architecture, program, capability registry and Domain Authorities when durable product/system meaning changes.
- `viewtube-document-consolidation` — losslessly consolidate multi-version documents, plans, HTML/prototypes and skill families with manifests and Removed Archive preservation.

The parent skill may author additional narrow sub-skills using `references/sub-skill-authoring.md` and `templates/sub-skill-template.md` when repeated specialized work justifies them.


## Master Source usage

Treat registry entries with `sourceTier: MASTER_SOURCE` as mandatory high-value prior art within their scope. Use them to discover better systems, missing ideas, external research targets, architecture simplifications, new skills/workflows, and product opportunities. Do not let a Master Source override canonical current authorities or verified implementation evidence; promote accepted ideas through the governed object/document system.
