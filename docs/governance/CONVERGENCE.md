# ViewTube Convergence Governance

**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27  
**Class:** CONSTITUTION  
**Status:** ACTIVE  
**Concern:** capability-centered convergence, anti-splintering, plan/idea/workflow unification and development-governance routing  
**Owner:** Documentation Governance + Product Architecture + Task Authority  
**Registry ID:** DOC-GOV-CONVERGENCE  
**Last Audited Main SHA:** 4c18a8de6c97c4d172df6528ff483fa6a08c4e5c  
**Related Authorities:** docs/governance/DOCUMENTATION.md; docs/governance/CONVERSATION_OS.md; docs/governance/TASK_AUTHORITY.md; docs/architecture/PRODUCT_ARCHITECTURE.md; docs/programs/INTEGRATED_APPLICATION.md

## Purpose

ViewTube should become more coherent as more agents, conversations, plans and implementations touch it.

This authority governs how related ideas, plans, tasks, tools, pages, functions, code paths, workflows, debugging work and optimizations converge on shared capabilities instead of being built as parallel systems.

## Constitutional convergence-first rule

Before ViewTube creates a new tool, service, plan, document, workflow, store, component system, API abstraction, AI subsystem, page or code owner, it must attempt:

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`

`CREATE_REVIEW` is not automatic permission to create something new. It means the agent must prove that existing capability families cannot absorb the work without creating worse ownership, unsafe coupling or loss of clarity.

## Capability homes

Every accepted product capability has one stable home under `docs/capabilities/`.

A capability home points to:
- canonical owner and authority;
- Master Tools / creator lifecycle stages;
- related plan family;
- code ownership map;
- tasks / missions / PRs when known;
- tests and verification;
- UI surfaces;
- User Guide coverage;
- open questions;
- related ideas / improvements.

Capability homes are routing pages, not replacement authorities.

## Plan families

Related plans belong to one stable `PLAN-FAMILY-*`.

A plan family records:
- capability IDs;
- one current survivor;
- source plans / handoffs / audits / prototypes;
- merge records;
- active task references;
- unique unharvested material;
- lifecycle: ACTIVE / RECONCILING / CONSOLIDATED / HISTORICAL.

Agents should update or merge into the survivor rather than create a parallel plan with a new title.

## Automatic similar-plan detection

Before creating or substantially extending a plan:
1. compare title / summary / details;
2. compare capability IDs;
3. compare category / subcategory;
4. inspect likely matches above the configured similarity threshold;
5. classify the relationship;
6. choose EXTEND / COMBINE / MERGE / GENERALIZE / ADAPT before CREATE_REVIEW.

`scripts/governance/convergence.mjs` provides deterministic similarity and convergence helpers.

## Mandatory Existing Work Checked gate

Every new plan, major feature proposal, workflow, system proposal or substantial work packet must record `existingWorkChecked`.

Minimum prior-art search:
- capability home;
- Task Index / Task Authority;
- Integrated Application Program;
- owning Domain Authority / Specification;
- plan families;
- related conversation-intake packages;
- active branches / PRs / missions;
- Ideas Registry;
- relevant MASTER_SOURCE / donor material;
- current code / tests when implementation is claimed.

No empty `existingWorkChecked` means no new plan/system creation.

## Universal work packet

Substantial cross-agent work should be transferable through a `VT-WORK-*` packet containing:
- title / intent;
- capability IDs;
- prior-art checked;
- convergence decision;
- plan-family ID;
- task IDs;
- code paths;
- acceptance criteria;
- evidence / receipts;
- current branch / PR;
- exact next action.

The work packet is transport/context, not a work ledger.

## Capability IDs everywhere

New durable records should carry one or more `CAP-*` IDs whenever the work belongs to a product capability.

This applies to:
- plans;
- task proposals;
- ideas;
- work packets;
- workflows;
- improvement recommendations;
- merge records;
- significant prototypes;
- handoff/reconciliation records.

Governance-only records may route to `CAP-DOCUMENT-GOVERNANCE` or `CAP-VERIFICATION`.

## Plan merge records

Every nontrivial plan-family merge produces a `PLAN-MERGE-*` record.

The record must preserve:
- all source plans;
- surviving target;
- unique material harvested;
- task / decision / requirement routing;
- conflicts;
- donor/archive disposition;
- no-loss verification notes.

A merge is incomplete while unique material is unaccounted.

## Feature Idea Registry

Ideas are not tasks.

All idea lists feed `ideas/registry.json`.

Each unique idea records:
- provenance;
- category / subcategory;
- target type and target ID;
- capability IDs;
- similarity keys;
- review / promotion status;
- related plan family / task / decision when promoted.

Source idea lists remain intact as provenance.

## Idea-to-capability routing

Every idea should first attempt to attach to:
1. an existing capability;
2. a Master Tool / system / feature / function within that capability;
3. an existing plan family.

Only ideas that expose a genuine ownership/capability gap should trigger a new capability review.

## Code ownership map

`governance/convergence/code-ownership.json` maps capability IDs to source paths, tests, routes/services and confidence.

It is intentionally explicit about uncertainty.

Code ownership records may be:
- VERIFIED;
- PARTIAL;
- NEEDS_DISCOVERY.

Static path maps never override current source/runtime evidence.

## Open Questions Queue

Unknowns that require research, creator judgment or architectural resolution are not tasks.

`governance/convergence/open-questions.json` records:
- question;
- capability / plan family;
- evidence needed;
- decision owner;
- blocking scope;
- resolution / decision reference.

Questions become tasks only when the work to resolve them is accepted.

## Capability coverage audit

Every capability is audited for:
- authority;
- code ownership;
- Task Index coverage;
- tests;
- UI surfaces;
- User Guide coverage;
- verification evidence.

Coverage is a diagnostic projection, not a completion percentage.

## Reusable Workflow Registry

`governance/convergence/workflows.json` contains reusable development workflows such as:
- feature build;
- bug fix;
- plan consolidation;
- document consolidation;
- prototype promotion;
- legacy migration;
- conversation handoff;
- capability change;
- visible UI ship;
- release verification.

Agents should reuse and improve workflows instead of re-inventing execution sequences per conversation.

## Skill-to-workflow map

Every reusable workflow declares the skills expected at each stage.

`governance/convergence/skill-workflow-map.json` lets agents resolve the narrowest current skill set for the job.

Skills execute procedure. Workflows orchestrate several procedures. Neither owns product truth.

## Improvement recommendation log

Conversation OS recommendations are recorded in `governance/convergence/improvements.json` before they become committed work.

Recommendations may cover:
- architecture;
- simplification;
- performance;
- UX/mobile/accessibility;
- debugging;
- dead code;
- AI/model/video-generation/Remotion;
- tooling/repositories/plugins/MCPs;
- CI/developer experience;
- documentation;
- cost/security/reliability.

Recommendations should be deduped against ideas, plan families and capabilities before promotion.

## Unified Development Control Room

The control room is a generated projection over the governed sources.

It should surface:
- capability coverage;
- plan families;
- idea counts / implementation waves;
- open questions;
- workflow registry;
- improvements;
- unresolved merge/consolidation work;
- eventually Task Index / Mission / PR / verification signals.

It is not a database.

Generation:
- `npm run generate:convergence-control-room`
- output JSON: `governance/convergence/control-room.json`
- output Markdown: `docs/generated/CONVERGENCE_CONTROL_ROOM.md`

## Master Ideas Library

`ideas/` is the governed home for brainstorm lists of every kind.

Source lists live under `ideas/lists/<category>/`.

`ideas/registry.json` is the normalized unique-idea registry.

`ideas/MASTER_IDEAS.md` is a generated human projection grouped by category and subcategory.

The master list is generated from unique idea records; it does not erase source lists.

## Operating pipeline

`conversation / idea list / bug / audit / research / prototype / code discovery → intake → capability routing → prior-art check → similarity/conflict analysis → plan family → convergence decision → Task Authority / Program / Authority / Decision / Opportunity / Risk → implementation → verification → receipt → update authority → archive donors`

## Creation rule

The burden of proof is on creating a new parallel owner.

When uncertain, route the proposal into an existing capability/plan family as REVIEWING rather than immediately creating a new system.
