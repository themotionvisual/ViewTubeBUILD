# Implementation Verification

**Capability ID:** `CAP-VERIFICATION`  
**Owner:** Verification  
**Authority:** `docs/governance/VERIFICATION.md`  
**Status:** ACCEPTED  
**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27

## Purpose

Require task-specific tests, runtime exercise, screenshot analysis, correction, reverification and receipts before completion.

## Product routing

**Master Tools:** none / governance capability  
**Creator lifecycle:** Operate  
**Domains:** governance

## Plan families

- `PLAN-FAMILY-TOOLBOX` — Toolbox / Primitive UI; survivor: `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
- `PLAN-FAMILY-DOCS-AGENTS` — Documentation / Agents / Task Governance; survivor: `docs/programs/INTEGRATED_APPLICATION.md`
- `PLAN-FAMILY-MOBILE-RESPONSIVE` — Cross-App Mobile / Responsive; survivor: `docs/programs/INTEGRATED_APPLICATION.md`

## Code ownership

- `OWNER-VERIFY` (PARTIAL) — `scripts/**`, `src/**/*.test.*`, `server/**/*.test.mjs`

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

- `QUESTION-003` — What code-ownership confidence is required before CI may enforce path ownership?

## Ideas and improvements

Query `ideas/registry.json` and `governance/convergence/improvements.json` by `CAP-VERIFICATION`.

## Before creating related work

Read this home, the canonical authority, linked plan family, Task Index/Task Authority, current code, related conversation-intake packages, active PRs, and the Ideas Registry.

Apply the convergence-first rule:

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`
