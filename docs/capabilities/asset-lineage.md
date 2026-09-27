# Asset Lineage & Provenance

**Capability ID:** `CAP-ASSET-LINEAGE`  
**Owner:** Asset Engine  
**Authority:** `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`  
**Status:** ACCEPTED  
**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27

## Purpose

Track artifact identity, versions, variants, selections, provenance, dependencies and outcome attribution.

## Product routing

**Master Tools:** Vault & Asset Engine; Visual Development Studio; Video Director & Editor  
**Creator lifecycle:** Produce → Assemble → Package → Learn  
**Domains:** asset-engine, vault, editor

## Plan families

- `PLAN-FAMILY-ASSET-VAULT` — Asset Engine / Vault; survivor: `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`
- `PLAN-FAMILY-PUBLISHING` — Publishing / Distribution / Recovery; survivor: `docs/programs/INTEGRATED_APPLICATION.md`

## Code ownership

- `OWNER-ASSET` (PARTIAL) — `src/features/vault/**`, `src/services/asset*`

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

Query `ideas/registry.json` and `governance/convergence/improvements.json` by `CAP-ASSET-LINEAGE`.

## Before creating related work

Read this home, the canonical authority, linked plan family, Task Index/Task Authority, current code, related conversation-intake packages, active PRs, and the Ideas Registry.

Apply the convergence-first rule:

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`
