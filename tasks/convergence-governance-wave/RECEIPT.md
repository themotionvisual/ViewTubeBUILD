# Convergence Governance & Ideas System Receipt

**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27  
**Status:** IMPLEMENTED_ON_BRANCH / PR VERIFICATION PENDING  
**Branch:** `governance/convergence-ideas-system-2026-09-27`  
**Base comparison at receipt creation:** 70 commits ahead / 0 behind main

## Purpose

Build the anti-splintering layer that routes agents, conversations, plans, ideas, code and workflows toward shared capability owners instead of allowing parallel systems to multiply.

## Implemented requested ideas

1. Capability Home Pages
2. Plan Families
3. Automatic Similar-Plan Detection
4. Mandatory Existing Work Checked
5. Universal Work Packet
6. Capability IDs Everywhere
7. Plan Merge Records
8. Feature Idea Registry
9. Idea-to-Capability Routing
10. Code Ownership Map
37. Open Questions Queue
43. Capability Coverage Audit
46. Reusable Workflow Registry
47. Skill-to-Workflow Mapping
48. Improvement Recommendation Log
49. Unified Development Control Room
50. Convergence-First Governance Rule

The duplicated item 37 in the user request is one implementation.

## New authority

- `docs/governance/CONVERGENCE.md`

Constitutional creation sequence:

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`

## Machine registries

- `governance/convergence/capability-homes.json`
- `governance/convergence/plan-families.json`
- `governance/convergence/plan-merges.json`
- `governance/convergence/code-ownership.json`
- `governance/convergence/open-questions.json`
- `governance/convergence/workflows.json`
- `governance/convergence/skill-workflow-map.json`
- `governance/convergence/improvements.json`
- `governance/convergence/capability-coverage.json`
- `governance/convergence/control-room.json`

## Capability homes

All 13 currently accepted capabilities receive routing pages under `docs/capabilities/`.

Homes link authority, plan-family routing, code ownership confidence, coverage gaps and questions without becoming new authorities.

## Ideas system

- source list: `ideas/lists/governance/document-governance-improvements.md`
- normalized registry: `ideas/registry.json`
- consolidated human projection: `ideas/MASTER_IDEAS.md`
- categorized source-list folders for product, UI/UX, AI, analytics, editor/video, workflows and infrastructure

All 50 governance ideas are preserved. Seventeen requested items are marked `IMPLEMENTATION_WAVE`; the remaining 33 remain unreviewed ideas.

## Executable tooling

- similarity scoring / likely-match detection
- convergence action recommendation
- idea consolidation preserving source provenance
- work-packet validation
- capability coverage evaluation
- convergence registry audit
- Master Ideas generation
- capability coverage generation
- Convergence Control Room generation
- similar-record CLI
- idea-consolidation CLI

## Skills / contracts

- `viewtube-convergence-governance`
- `viewtube-ideas-curator`
- Codex mirrors
- Universal Work Packet schema + contract
- plan template with mandatory Existing Work Checked

## Verification

- focused convergence tests: 6/6 PASS
- structural registry audit: 0 issues
- 13 capability homes
- 13 capability-coverage records
- 10 plan families
- 4 plan-merge records
- 13 code-ownership records
- 6 open questions
- 10 workflows
- 10 skill/workflow mappings
- 17 implementation-wave improvements
- 50 normalized ideas
- branch freshness at receipt creation: 0 behind main

## Known intentional gaps

- Capability coverage currently exposes missing Task/Test/User Guide/Verification links rather than inventing them.
- PARTIAL code-ownership records are advisory and must not become hard CI enforcement yet.
- Task Index VNext remains required for complete task-centric control-room integration.
- Similarity scores suggest candidates; humans/agents still perform no-loss reconciliation before merges.
