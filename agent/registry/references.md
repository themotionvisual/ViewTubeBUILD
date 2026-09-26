# ViewTube reference registry — what to read, and what it proves

On-file index of documents, artifacts, standalone HTML and folder sets.
Re-audited 2026-09-24 against current main `c494d96aad9cbcf073e7d157685cb8b0269f123d`. Append anything you needed that was not here.

**Classes:** `canonical` · `prototype` · `demo` · `recovery` · `quarantined` · `superseded`

---

## Canonical — plan from these

| Path | Covers |
|---|---|
| `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md` | **Start here for cross-system AI work**: current AI ownership/status, work claims, provenance, plans, prompts, evidence, outcomes, historical donors and agent update protocol. |
| `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md` | Canonical creator-facing Brain/AI runtime architecture and owner boundaries. |
| `docs/brain/VIEWTUBE_PROMPT_SYSTEM_AUTHORITY_2026-09-24.md` | Current prompt-system architecture, precedence, personalization and migration authority. |
| `docs/migration/reference/VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json` | Historical 2026-09-03 system-owner registry; useful migration evidence, **not current status authority**. |
| `docs/architecture/VIEWTUBE_CROWN_INTEGRATION_SYSTEM.md` | the constitution: KING/EMPEROR, 5 record types, lifecycle, conflict levels |
| `docs/architecture/viewtube-crown-protocols.schema.json` | schema for the five Crown records |
| `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md` | toolbox/subtoolbox UI contracts |
| `docs/architecture/SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md` | primitive system |
| `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md` | **master Asset Engine / ContentBuild product and architecture definition**: backend services, assets, lineage, generation, publishing, 15 frontend manifestations, integrations, mobile/UI contracts, migration and acceptance criteria |
| `docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md` | **canonical living Editor System integration authority**: desktop/mobile parity, Remotion, Editor Brain, generative media, skill/resource/branch registry and append-only update log. |
| `docs/architecture/dashboard-baseline.json` · `dashboard-style-snapshot.json` | dashboard regression baselines |
| `docs/MOBILE_VISUAL_RESPONSIVE_CONTRACT.md` · `MOBILE_VISUAL_QA_MATRIX.md` | mobile geometry contract + QA matrix |
| `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md` · `UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md` | AI systems management/orientation + creator-facing Brain runtime architecture |
| `docs/architecture/SIMPLE_AUTH_V1.md` · `VIEWTUBE_AUTH_API_STABILIZATION_REFERENCE.md` | auth boundaries |
| `.viewtube/exchange/README.md` | Royal Exchange record contract |
| `CLAUDE.md` | deployment topology, golden rules, known lint debt |

**External canonical** — `ViewTube-Task-Index.html` (schema 15, 1,598 tasks) is the sole
task/status authority. It lives outside this repo and is not yet committed.

## Folder sets — name the folder and its entry point, not the files

| Folder | Entry point | Contains |
|---|---|---|
| `governance/canonical-code-pack/` | `README_FIRST.md` → `MANIFEST.md` | 2 applicable patches + apply notes |
| `governance/widget-library/` | `README.md` | widget library v10, v11 interactive, v12 matrix |
| `governance/animation-lock-2026-08-21/` | `README.md` | frozen animation sources |
| `governance/release-2026-08-22/` | `RELEASE_RUNBOOK.md` | consolidation manifest + runbook |
| `docs/migration/reference/` | — | 23 files: registries, prototypes, relocation records, one patch |
| `docs/architecture/toolbox-ui-master-resource/` | — | toolbox UI supporting material |
| `.viewtube/exchange/` | `README.md` | 6 missions · 6 work orders · 6 receipts · decisions · conflicts |

## Prototype — an idea was explored. Proves nothing about runtime

| Path | Note |
|---|---|
| `docs/migration/reference/prototypes/ADAPTIVE_BRAIN_ORCHESTRATOR_2026-09-03.html` | Brain orchestration exploration |
| `docs/migration/reference/prototypes/VIEWTUBE_BRAIN_USER_CONTROL_CENTER_2026-09-03.html` | Brain user-control exploration |
| `src/assets/reference/viewtube-full-component-library.html` | component reference |
| `src/assets/reference/viewtube-mini-toolbox-bundle.html` | toolbox bundle reference |
| `public/widget-primitives.html` · `public/editor-template-library.html` | primitive/template references |

## Demo — what was shown, not what ships

| Path | Note |
|---|---|
| `docs/demos/ViewTube_Crown_Control_Room.html` | Crown control-room concept; see `VT-ARTIFACT-crown-control-room.json` |
| `public/content-build-manifestations-1-5.html` · `6-10.html` · `content-build-06-10/` | content build presentations |

## Recovery — what existed before

| Path | Note |
|---|---|
| `governance/canonical-code-pack/*.patch` | `mobile-csv-rehydration-fix` · `channel-progress-heat-matrix` |
| `docs/migration/reference/PARENT_DOCUMENTATION_UPDATES_2026-08-30.patch` | doc updates |
| `docs/migration/reference/BRANCH_CHECK_TO_VIEWTUBEX_RELOCATION_2026-08-30.md` | relocation record |

**External, unverified** — recorded in the memory reference, existence not confirmed from here:
`viewtube-preservation-20260830-rce7Xq/` · `ViewTube-branch-check/` ·
`ViewTube-Kingdom-Pack/` (reported as 30 portable skills + mirrors — check before building
`herald-sync.mjs`).

## Quarantined — often records *why something failed*

`_quarantine/` — 34 files. Search it during RECON; "we tried that and quarantined it" is a
real answer.

| Folder | Files |
|---|---|
| `_quarantine/performance-workflow/` | 15 |
| `_quarantine/src/` | 16 |
| `_quarantine/brain-legacy/` | 1 |
| `_quarantine/public/` | 2 — includes archived VT_E1 editor variants |

Integrity is gated by `npm run check:quarantine`.

## Superseded — history only

| Path | Superseded by |
|---|---|
| `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | the Task Index (1,598 tasks) |
| `docs/migration/reference/VIEWTUBE_UNDEPLOYED_SYSTEMS_INDEX_2026-08-27.json` | **empty** — 0 entries; do not rely on it |
| The uploaded condensed memory reference | its `viewtubeX` and `docs/skills/` paths are stale — see plan O12. Its **FAILURE → FIX INDEX** remains valuable |

## Local corpus — outside this repo

Hundreds of standalone HTML files, plans and audits live in local folders. They are **not**
catalogued by hand and never will be: `.viewtube/herald/index/` holds a derived index built
by `herald-scan.mjs`, queried with `herald-find` (design: plan §15, phase H2.5).

Configure roots once in `agent/registry/corpus-roots.json` (template:
`corpus-roots.example.json`). Classification is derived from path and filename by
`classifyLane()`, reused from `scripts/reorganize-html-docs.mjs`. Relatedness comes from
`vt-####` task ids and symbol references, not embeddings.

Until that index exists, local material is **unsearchable from any agent session** and the
entries below marked *external, unverified* stay unverified.

## Known gaps

- The Task Index is not committed anywhere in this repo (plan O10).
- No index exists for the 21 standalone HTML files in-repo, nor the local corpus; this
  registry is the first, and plan §15 is the mechanism.
- `docs/*` is gitignored except `docs/migration/**`. Most docs here were force-added, so
  **a new doc added without `git add -f` will not be tracked** (plan O1).


## Editor living resources — 2026-09-24

| Path | Class | Covers |
|---|---|---|
| docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md | canonical | unified desktop/mobile editor program, living work/resource/skill/branch log |
| docs/editor/EDITOR_BRAIN_HUB_ASSISTANT_PLAN.md | active-plan | contextual BrainRuntime assistant, typed edit proposals, guidance and generative-media actions |
| .claude/skills/viewtube-youtube-editor-system/SKILL.md | agent-skill | editor-specific workflow/ownership/parity/update discipline |
| .codex/skills/viewtube-youtube-editor-system/SKILL.md | agent-skill mirror | same editor workflow for Codex-compatible sessions |
| skills/viewtube-youtube-editor-system/SKILL.md | portable skill mirror | portable copy of the editor domain skill |


## AI systems living resources — 2026-09-24

| Path | Class | Covers |
|---|---|---|
| `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md` | canonical | AI systems management, cross-authority map, work claims/receipts, current-status and agent orientation |
| `docs/brain/ai-systems/AGENT_READY_REPORT_2026-09-24.md` | reference | external public agent-readiness scan and remediation evidence |
| `docs/brain/ai-systems/DOCUMENT_CONSOLIDATION_REGISTER_2026-09-24.md` | migration-receipt | AI document merge/archive/delete dispositions |
| `docs/migration/reference/brain-ai-history/README.md` | historical-index | archived broad AI audits/phase inventories after durable-rule harvest |
| `tasks/ai-brain-quality/` | active-plan | evidence → knowledge → context → prompt → outcome → learning → assistant continuity |
| `tasks/viewtube-finish-program/` | active-plan | cross-system finish backlog including AI registries/observability/prompt convergence |


## Current governance references — 2026-09-26

| Reference | Role |
| --- | --- |
| `docs/governance/CONVERSATION_OS.md` | current cross-agent conversation, prior-art, improvement and handoff authority |
| `agent/contracts/conversation-os.md` | host-neutral runtime contract |
| `docs/governance/CROWN.md` | mission coordination authority |
| `docs/governance/TASK_AUTHORITY.md` | canonical task-mutation authority |
| `docs/governance/VERIFICATION.md` | implementation completion and evidence contract |
| `docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md` | MASTER_SOURCE strategic prior art |

Legacy Herald and dated Crown integration sources are donor/provenance material, not current authority.
