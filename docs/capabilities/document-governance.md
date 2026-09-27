# Documentation Governance & Lineage

**Capability ID:** `CAP-DOCUMENT-GOVERNANCE`  
**Owner:** Documentation Governance  
**Authority:** `docs/governance/DOCUMENTATION.md`  
**Status:** ACCEPTED  
**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27

## Purpose

Maintain one authority graph, lossless consolidation, removed archive, machine registry and agent-readable context.

## Product routing

**Master Tools:** none / governance capability  
**Creator lifecycle:** Operate  
**Domains:** governance

## Plan families

- `PLAN-FAMILY-DOCS-AGENTS` — Documentation / Agents / Task Governance; survivor: `docs/programs/INTEGRATED_APPLICATION.md`

## Code ownership

- `OWNER-DOCS` (VERIFIED) — `docs/**`, `.claude/skills/viewtube-document-system/**`

## Coverage

- Authority: present
- Code ownership: present
- Task references: missing
- Tests: missing
- UI surfaces: missing / not applicable review needed
- User Guide coverage: missing
- Verification evidence: missing

**Current coverage gaps:** taskRefs, tests, uiSurfaces, guideRefs, verificationRefs

Coverage is diagnostic only and is not a completion percentage.

## Open questions

- `QUESTION-001` — What is the final canonical repo-native storage/writer shape for Task Index VNext?
- `QUESTION-002` — Should capability home pages become fully generated or remain partly hand-authored routing pages?
- `QUESTION-003` — What code-ownership confidence is required before CI may enforce path ownership?
- `QUESTION-004` — Should the Unified Development Control Room remain generated documentation or become an application route?
- `QUESTION-005` — Should similarity thresholds differ by domain or remain globally configured?
- `QUESTION-006` — What review gate promotes an accepted idea into a permanent Task Candidate?

## Ideas and improvements

Query `ideas/registry.json` and `governance/convergence/improvements.json` by `CAP-DOCUMENT-GOVERNANCE`.

## Before creating related work

Read this home, the canonical authority, linked plan family, Task Index/Task Authority, current code, related conversation-intake packages, active PRs, and the Ideas Registry.

Apply the convergence-first rule:

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`
