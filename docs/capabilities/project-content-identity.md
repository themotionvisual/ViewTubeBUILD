# Project / ContentBuild Identity

**Capability ID:** `CAP-PROJECT-CONTENT-IDENTITY`  
**Owner:** Projects + ContentBuild  
**Authority:** `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`  
**Status:** ACCEPTED  
**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27

## Purpose

Maintain one durable content identity across planning, tools, packages, assets, publish binding and outcomes.

## Product routing

**Master Tools:** Project & Production Command  
**Creator lifecycle:** Design → Produce → Assemble → Package → Publish → Learn  
**Domains:** projects, asset-engine, publisher

## Plan families

- `PLAN-FAMILY-PROJECTS` — Projects / ContentBuild; survivor: `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`
- `PLAN-FAMILY-PUBLISHING` — Publishing / Distribution / Recovery; survivor: `docs/programs/INTEGRATED_APPLICATION.md`

## Code ownership

- `OWNER-PROJECT` (PARTIAL) — `src/features/projects/**`, `src/services/contentBuild*`

## Coverage

- Authority: present
- Code ownership: present
- Task references: missing
- Tests: missing
- UI surfaces: present
- User Guide coverage: missing
- Verification evidence: missing

**Current coverage gaps:** taskRefs, tests, guideRefs, verificationRefs

Coverage is diagnostic only and is not a completion percentage.

## Open questions

- None currently registered.

## Ideas and improvements

Query `ideas/registry.json` and `governance/convergence/improvements.json` by `CAP-PROJECT-CONTENT-IDENTITY`.

## Before creating related work

Read this home, the canonical authority, linked plan family, Task Index/Task Authority, current code, related conversation-intake packages, active PRs, and the Ideas Registry.

Apply the convergence-first rule:

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`
