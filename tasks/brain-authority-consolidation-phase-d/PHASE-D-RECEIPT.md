# Brain / Prompt Authority Consolidation — Phase D Receipt

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Status:** IMPLEMENTED / PR VERIFICATION PENDING  
**Branch:** docs/brain-authority-consolidation-phase-d-rebased-2026-09-26

## Purpose

Reduce overlapping AI/Brain management, runtime and prompt authorities into:
- one Brain domain authority;
- one Prompt specification;
- one stable machine prompt inventory;
- one operational AI health/reachability projection that no longer owns work state.

## New current authorities

- `docs/domains/BRAIN.md`
- `docs/specifications/PROMPTS.md`
- `docs/specifications/prompt-registry.json`

## Responsibilities removed from AI-specific management

Moved to existing global systems:
- conversation continuity / prior-art / proactive improvement → Conversation OS;
- missions / work orders / decisions / receipts → Crown / Royal Exchange;
- exact task identity and lifecycle state → Task Authority / Task Index;
- documentation authority / lineage / archive → Documentation Governance.

`governance/ai-systems/**` remains only an operational audit/reachability projection.

## Machine-projection changes

- AI systems registry now points to `docs/domains/BRAIN.md`.
- Prompt system record points to `PROMPTS.md` + stable prompt registry.
- Herald record is `superseded`.
- AI Systems Management record is `superseded`.
- AI capability/integration/plan projections use the stable Brain/Prompt authorities.
- Legacy Herald projection is explicitly compatibility-only/read-only.

## Cross-domain rewiring

Updated:
- AI Governor skill + supporting references;
- all three Editor skill mirrors;
- Editor master resource;
- Brain Hub assistant plan;
- User Guide master;
- completion-agent doc;
- Widget/Dashboard skill references;
- Product capability registry;
- Integrated Application Program;
- agent reference map;
- Brain-quality and dated Finish Program donor plans.

## Loss safety

`archive/removed/manifests/CONSOL-BRAIN-AUTHORITY.json` records exact pre-migration Git blob identities for:
- AI Systems Master Resource;
- Unified AI System contract;
- Prompt System Authority;
- Prompt Improvement Program;
- Prompt Registry;
- AI Documentation Consolidation Register.

The old Markdown sources remain in place with migration notices. The old prompt-registry JSON remains intact as provenance. Physical archive moves remain deferred until PR verification.

## Main-branch rebase

During Phase D, `main` advanced by 100 commits.

The complete Phase D file set was compared with those newer main changes:
- Phase D changed files: 41;
- newer-main changed files: 56;
- overlapping files: 0.

Phase D was therefore replayed onto a fresh branch from the current main without overwriting any newer main work.

The newer main changes relevant by filename were Vault/Publisher UI files only; no Brain runtime, prompt/provider, context/evidence or AI-governance implementation changed.

## Structural verification

- all governing JSON files parse;
- document registry contains no duplicate IDs;
- ACTIVE document concerns remain unique;
- `DOC-DOMAIN-BRAIN`, `DOC-SPEC-PROMPTS`, and `DOC-GEN-PROMPT-REGISTRY` are ACTIVE;
- prompt registry authority is `docs/specifications/PROMPTS.md`;
- AI systems registry authority is `docs/domains/BRAIN.md`;
- Herald lifecycle projection is `superseded`;
- AI Systems Management lifecycle projection is `superseded`;
- Brain and Prompt authorities contain the required governed metadata;
- old authority names appear in active authority bodies only in explicit `Supersedes` metadata;
- exact pre-migration source identities are captured in the consolidation manifest;
- branch was 46 commits ahead and 0 behind main before receipt creation.

## Remaining after Phase D

- Task Index VNext structured storage/writer still needs implementation.
- Legacy Herald compatibility readers/scripts still need replacement or retirement.
- Physical Removed Archive moves for the dated Brain/Prompt authorities remain pending until this PR is verified.
- Prompt/runtime implementation migration (legacy direct provider/generator paths) remains application work, not documentation work.
